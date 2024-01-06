import { useState, useEffect } from "react";
import { API_URL, ChatInfo, GameInfo, LobbyProps, UserInfo } from "../typedef";
import Game from "./Game";

function Lobby ({ setJoin, name, rKey, uKey }: LobbyProps) {

    const [uID, setUID] = useState(``);
    const [user, setUser] = useState(`Zane`);
    const [ready, setReady] = useState(false);
    const [curMessage, setMessage] = useState(``);

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
                'r_key': rKey,
                'u_key': uKey,
            })
        })
            .then(() => setJoin())
            .catch(err => console.error(err))
    }

    const sendMessage = async () => {
        if (curMessage === ``) return
        fetch(`${API_URL}/lobby/${rKey}/msg`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                'r_key': rKey,
                'u_key': uKey,
                'message': curMessage,
            })
        })
            .then(() => setChats([...chats, { 'cID': String(chats.length + 1), 'stamp': new Date(Date.now()),'author': { 'uID': uID, 'name': user, 'ready': ready }, 'message': curMessage }]))
            .then(() => setMessage(``))
            .catch(err => console.error(err))
    }

    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`${API_URL}/lobby/${rKey}/${uKey}`)
                .then(res => res.json())
                .then(dat => {
                    setUsers(dat['users']);
                    setChats(dat['chats']);
                    setUID(dat['uID']);
                })
                .catch(err => console.error(err))
        }, 2000);

        return () => clearInterval(interval);
    }, [rKey, uKey]);

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
                    { chats.map((chat, i) => <li key={i}>{ chat.author.uID === uID ? 'You' : chat.author.name }: { chat.message }</li>) }
                </ul>
                <input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} value={curMessage}/>
                <button onClick={sendMessage}>Send</button>
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