"""Serial HTTP client with conditional requests, backoff and a raw-body cache.

Both chess.com and Lichess reject parallel traffic (spec §6.1, §6.2), so there is exactly
one in-flight request at a time, ever. Bodies are cached on disk under data/raw/ keyed by
a hash of the URL; ETag / Last-Modified live in the SQLite http_cache table.
"""
from __future__ import annotations

import hashlib
import logging
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterator

import httpx

from ..config import DATA_DIR
from ..db import Store

log = logging.getLogger(__name__)


class Gone(Exception):
    """Server returned 410; the resource must never be requested again."""


@dataclass
class Fetched:
    url: str
    status: int
    body: bytes
    from_cache: bool      # served without a network request (final resource)
    not_modified: bool    # server answered 304, body is the cached one


class SerialClient:
    def __init__(
        self,
        store: Store,
        user_agent: str,
        *,
        raw_dir: Path | None = None,
        min_interval: float = 0.0,
        rate_limit_wait: float = 10.0,
        max_retries: int = 6,
        timeout: float = 60.0,
        sleep: Callable[[float], None] = time.sleep,
        transport: httpx.BaseTransport | None = None,
        default_headers: dict[str, str] | None = None,
    ):
        self.store = store
        self.raw_dir = raw_dir or (DATA_DIR / "raw")
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.min_interval = min_interval
        self.rate_limit_wait = rate_limit_wait
        self.max_retries = max_retries
        self.sleep = sleep
        self._last_request_at = 0.0
        headers = {"User-Agent": user_agent, "Accept": "application/json"}
        headers.update(default_headers or {})
        self.http = httpx.Client(headers=headers, timeout=timeout, follow_redirects=True, transport=transport)

    def close(self) -> None:
        self.http.close()

    # --- internals -----------------------------------------------------------

    def _throttle(self) -> None:
        wait = self.min_interval - (time.monotonic() - self._last_request_at)
        if wait > 0:
            self.sleep(wait)

    def _body_path(self, url: str) -> Path:
        return self.raw_dir / (hashlib.sha1(url.encode()).hexdigest() + ".body")

    def _read_body(self, path: str | None) -> bytes:
        if not path:
            return b""
        p = Path(path)
        return p.read_bytes() if p.exists() else b""

    def _backoff(self, attempt: int, resp: httpx.Response | None) -> float:
        # Honour Retry-After when the server sends one, otherwise exponential from the
        # configured base. Lichess wants >=60s after a 429; chess.com is less specific.
        if resp is not None:
            ra = resp.headers.get("Retry-After")
            if ra and ra.isdigit():
                return max(float(ra), self.rate_limit_wait)
        return self.rate_limit_wait * (2 ** attempt)

    def _request(self, method: str, url: str, *, params=None, headers=None, stream=False) -> httpx.Response:
        """One request with retry on 429/5xx/transport errors. Raises on exhaustion."""
        last_exc: Exception | None = None
        for attempt in range(self.max_retries + 1):
            self._throttle()
            self._last_request_at = time.monotonic()
            try:
                req = self.http.build_request(method, url, params=params, headers=headers)
                resp = self.http.send(req, stream=stream)
            except httpx.TransportError as e:  # DNS, timeouts, resets
                last_exc = e
                wait = self._backoff(attempt, None)
                log.warning("transport error on %s (%s); retry in %.0fs", url, e, wait)
                self.sleep(wait)
                continue
            if resp.status_code == 429 or resp.status_code >= 500:
                wait = self._backoff(attempt, resp)
                log.warning("HTTP %s on %s; backing off %.0fs (attempt %d)", resp.status_code, url, wait, attempt + 1)
                resp.close()
                self.sleep(wait)
                continue
            return resp
        raise RuntimeError(f"gave up on {url} after {self.max_retries + 1} attempts") from last_exc

    # --- public --------------------------------------------------------------

    def get(self, url: str, *, params: dict | None = None, headers: dict | None = None,
            final: bool = False) -> Fetched:
        """Conditional GET.

        `final=True` marks the resource immutable (e.g. a chess.com archive month in the
        past): once fetched successfully it is served from disk forever without a request.
        """
        full = str(httpx.URL(url, params=params or {}))
        cached = self.store.cache_get(full)
        if cached is not None:
            if cached["gone"]:
                raise Gone(full)
            if cached["final"] and cached["body_path"]:
                return Fetched(full, cached["status"], self._read_body(cached["body_path"]), True, False)

        cond = dict(headers or {})
        if cached is not None:
            if cached["etag"]:
                cond["If-None-Match"] = cached["etag"]
            if cached["last_modified"]:
                cond["If-Modified-Since"] = cached["last_modified"]

        resp = self._request("GET", full, headers=cond)
        if resp.status_code == 304 and cached is not None:
            self.store.cache_touch(full)
            return Fetched(full, 200, self._read_body(cached["body_path"]), False, True)
        if resp.status_code == 410:
            self.store.cache_put(full, etag=None, last_modified=None, status=410, body_path=None, gone=True)
            raise Gone(full)
        if resp.status_code == 404:
            return Fetched(full, 404, b"", False, False)
        resp.raise_for_status()

        path = self._body_path(full)
        path.write_bytes(resp.content)
        self.store.cache_put(
            full, etag=resp.headers.get("ETag"), last_modified=resp.headers.get("Last-Modified"),
            status=resp.status_code, body_path=str(path), final=final,
        )
        if str(resp.url) != full:
            log.info("%s redirected to %s", full, resp.url)
        return Fetched(full, resp.status_code, resp.content, False, False)

    def stream_lines(self, url: str, *, params: dict | None = None, headers: dict | None = None) -> Iterator[str]:
        """Stream a text/NDJSON response line by line without buffering the whole body."""
        resp = self._request("GET", url, params=params, headers=headers, stream=True)
        try:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if line:
                    yield line
        finally:
            resp.close()
