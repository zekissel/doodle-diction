import { useState, useEffect } from "react";
import { API_URL, ChatInfo, GameInfo, LobbyProps, UserInfo } from "../typedef";
import Game from "./Game";

function Lobby ({ setJoin, name, rKey, uKey }: LobbyProps) {

    const [users, setUsers] = useState<UserInfo[]>([]);
    const [chats, setChats] = useState<ChatInfo[]>([]);

    const [confirmExit, setExit] = useState(false);
    const exitRoom = async () => {
        fetch(`${API_URL}/exit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                'rKey': rKey,
                'uKey': uKey,
            })
        })
            .then(() => setJoin())
            .catch(err => console.error(err))
    }

    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`${API_URL}/lobby/${rKey}`)
                .then(res => res.json())
                .then(dat => {
                    setUsers(dat['users']);
                    setChats(dat['chats']);
                })
                .catch(err => console.error(err))
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <main>
            { confirmExit && 
                <div>
                    <span>Are you sure you want to exit room?</span>
                    <button onClick={exitRoom}>Confirm</button>
                    <button onClick={() => setExit(false)}>Cancel</button>
                </div>
            }

            <fieldset><legend><h3>Room: { name }</h3></legend>
                <button onClick={() => setExit(true)}>Exit</button>
                <button>Ready</button>
            </fieldset>
            
            <fieldset><legend>Players</legend>
                <ul>
                    { users.map((user, i) => <li key={i}>{ user.name }</li>) }
                </ul>
            </fieldset>
            
            <fieldset><legend>Chat</legend>
                <ul>
                    { chats.map((chat, i) => <li key={i}>{ chat.author }: { chat.message }</li>) }
                </ul>
            </fieldset>

            <fieldset>
                <legend>
                    Pregame
                </legend>
                <Game />
            </fieldset>
        </main>
    )
}

export default Lobby;