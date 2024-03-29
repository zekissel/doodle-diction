from redis_om import JsonModel, EmbeddedJsonModel, Field, Migrator, get_redis_connection
from typing import List, Optional

class User(EmbeddedJsonModel):
    uID: str = Field(index=True)
    name: str = Field(index=True)
    ready: bool

class Game(EmbeddedJsonModel):
    gID: str = Field(index=True)
    data: List[str] = Field(index=False, default=[])

class Chat(EmbeddedJsonModel):
    cID: str = Field(index=True)
    stamp: str = Field(index=True)
    author: User
    message: str

class Settings(EmbeddedJsonModel):
    max_rounds: int = Field(index=False, default=5)
    round_timer: int = Field(index=False, default=0)
    enable_chat: bool = Field(index=False, default=True)

class Room(JsonModel):
    rID: int = Field(index=True)
    name: str = Field(index=True)
    pw: Optional[str] = Field(index=False, default='')

    cap: int = Field(index=True)
    host: User = Field(index=False)
    exited_users: List[User] = Field(index=False, default=[])

    cur_round: int = Field(index=False, default=0)
    settings: Settings = Field(index=False, default=Settings())

    users: List[User] = Field(index=False, default=[])
    chats: List[Chat] = Field(index=False, default=[])
    games: List[Game] = Field(index=False, default=[])

def index_models():
    Migrator().run()

def connect():
    cache = get_redis_connection(host='dbase', port=6378)
    return cache