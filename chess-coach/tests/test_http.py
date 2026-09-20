"""SerialClient behaviour against a mock transport: conditional GETs, 304, 410, 429 backoff."""
import httpx
import pytest

from coach.ingest.http import Gone, SerialClient


class Script:
    """Scripted responses per URL; records every request it sees."""

    def __init__(self):
        self.calls: list[httpx.Request] = []
        self.queue: dict[str, list[httpx.Response]] = {}

    def add(self, url, *responses):
        self.queue.setdefault(url, []).extend(responses)

    def handler(self, request: httpx.Request) -> httpx.Response:
        self.calls.append(request)
        q = self.queue.get(str(request.url))
        if not q:
            return httpx.Response(500, text="unscripted")
        return q.pop(0)


@pytest.fixture
def script():
    return Script()


@pytest.fixture
def client(store, raw_dir, script):
    sleeps = []
    c = SerialClient(store, "test-agent", raw_dir=raw_dir, rate_limit_wait=5, max_retries=3,
                     sleep=sleeps.append, transport=httpx.MockTransport(script.handler))
    c.sleeps = sleeps
    yield c
    c.close()


U = "https://api.example/x"


def test_sends_user_agent_and_caches_etag(client, script):
    script.add(U, httpx.Response(200, headers={"ETag": '"abc"'}, content=b"body1"))
    f = client.get(U)
    assert f.body == b"body1" and not f.from_cache and not f.not_modified
    assert script.calls[0].headers["User-Agent"] == "test-agent"
    assert client.store.cache_get(U)["etag"] == '"abc"'


def test_second_request_is_conditional_and_304_returns_cached_body(client, script):
    script.add(U, httpx.Response(200, headers={"ETag": '"abc"', "Last-Modified": "Mon"}, content=b"body1"),
               httpx.Response(304))
    client.get(U)
    f = client.get(U)
    req = script.calls[1]
    assert req.headers["If-None-Match"] == '"abc"'
    assert req.headers["If-Modified-Since"] == "Mon"
    assert f.not_modified and f.body == b"body1"


def test_final_resource_is_never_requested_twice(client, script):
    script.add(U, httpx.Response(200, content=b"immutable"))
    client.get(U, final=True)
    f = client.get(U, final=True)
    assert f.from_cache and f.body == b"immutable"
    assert len(script.calls) == 1


def test_410_is_remembered(client, script):
    script.add(U, httpx.Response(410))
    with pytest.raises(Gone):
        client.get(U)
    with pytest.raises(Gone):
        client.get(U)
    assert len(script.calls) == 1


def test_429_backs_off_then_succeeds(client, script):
    script.add(U, httpx.Response(429), httpx.Response(429, headers={"Retry-After": "7"}),
               httpx.Response(200, content=b"ok"))
    f = client.get(U)
    assert f.body == b"ok"
    assert len(script.calls) == 3
    # first: base wait; second: Retry-After honoured (>= base)
    assert client.sleeps[0] == 5
    assert client.sleeps[1] == 7


def test_429_exhaustion_raises(client, script):
    script.add(U, *[httpx.Response(429)] * 4)
    with pytest.raises(RuntimeError):
        client.get(U)
    assert client.sleeps == [5, 10, 20, 40]


def test_stream_lines(client, script):
    script.add(U, httpx.Response(200, content=b'{"a":1}\n{"a":2}\n\n'))
    assert list(client.stream_lines(U)) == ['{"a":1}', '{"a":2}']
