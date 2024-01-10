from redis_om import JsonModel, EmbeddedJsonModel, Field, Migrator, get_redis_connection
from typing import List, Optional

class User(EmbeddedJsonModel):
    uID: str = Field(index=True)
    name: str = Field(index=True)
    ready: bool

class Game(EmbeddedJsonModel):
    gID: str = Field(index=True)
    data: List[str]

class Chat(EmbeddedJsonModel):
    cID: str = Field(index=True)
    stamp: str = Field(index=True)
    author: User
    message: str

class Room(JsonModel):
    rID: int = Field(index=True)
    name: str = Field(index=True)
    pw: Optional[str] = Field(index=False, default='')

    g_round: int = Field(index=False, default=0)
    cap: int = Field(index=True)
    host: User = Field(index=False)

    users: List[User] = Field(index=False, default=[])
    chats: List[Chat] = Field(index=False, default=[])
    games: List[Game] = Field(index=False, default=[])

def index_models():
    Migrator().run()

def connect():
    cache = get_redis_connection(host='dbase', port=6378)
    return cache