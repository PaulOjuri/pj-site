"""Load config/player.yaml into a validated object.

Paths resolve relative to the package root (chess-coach/), so the CLI works from any cwd.
"""
from __future__ import annotations

import os
from pathlib import Path

import yaml
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[2]
CONFIG_DIR = ROOT / "config"
DATA_DIR = ROOT / "data"


class Identities(BaseModel):
    chesscom: str | None = None
    lichess: str | None = None


class Player(BaseModel):
    name: str
    fide_id: int
    federation: str = "BEL"
    birth_year: int | None = None
    contact_email: str


class Availability(BaseModel):
    hours_per_week: float = 10
    free_days: list[str] = Field(default_factory=lambda: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"])
    timezone: str = "Europe/Brussels"
    home_city: str | None = None


class Goals(BaseModel):
    target_title: str = "CM"
    horizon_months: int = 24
    route: str = "both"


class PlayerConfig(BaseModel):
    player: Player
    identities: Identities
    fide_seed: dict = Field(default_factory=dict)
    manual_override: dict = Field(default_factory=dict)
    availability: Availability = Field(default_factory=Availability)
    goals: Goals = Field(default_factory=Goals)
    coaching: dict = Field(default_factory=dict)
    public_mode: dict[str, bool] = Field(default_factory=dict)

    @property
    def user_agent(self) -> str:
        # chess.com asks for a descriptive UA with a contact address so they can reach
        # the owner instead of silently blocking.
        return f"chess-coach/0.1 (personal training pipeline; contact: {self.player.contact_email})"


def load_config(path: Path | None = None) -> PlayerConfig:
    path = path or Path(os.environ.get("COACH_CONFIG", CONFIG_DIR / "player.yaml"))
    with open(path) as f:
        return PlayerConfig.model_validate(yaml.safe_load(f))


def db_path() -> Path:
    return Path(os.environ.get("COACH_DB", DATA_DIR / "coach.db"))
