import { useState, useEffect } from "react";
import { API_URL, ChatInfo, GameInfo, LobbyProps, UserInfo, DataState } from "../typedef";
import Game from "./Game";

function Lobby ({ setJoin, name, rKey, uKey }: LobbyProps) {

    const [uID, setUID] = useState(``);
    const [user, setUser] = useState(`Zane`);
    const [ready, setReady] = useState(false);
    const [curMessage, setMessage] = useState(``);

    const [users, setUsers] = useState<UserInfo[]>([]);
    const [chats, setChats] = useState<ChatInfo[]>([]);
    const [progress, setProgress] = useState<DataState>(DataState.Loading);
    
    const [confirmExit, setExit] = useState(false);

    /* 
        update lobby info from serveer: 
        personal user info, other users' info, chat info, meta game info (rounds)
    */
        useEffect(() => {
            const interval = setInterval(() => {
                fetch(`${API_URL}/lobby/${rKey}/${uKey}`)
                    .then(res => res.json())
                    .then(dat => {
                        if ('err' in dat) setJoin();
                        else {
                            setUsers(dat['users']);
                            setChats(dat['chats']);
                            setUID(dat['uID']);
                            setProgress(DataState.Success);
                        }
                    })
                    .catch(err => {
                        console.error(err)
                        setProgress(DataState.Error);
                    })
            }, 2000);
    
            return () => clearInterval(interval);
        }, [rKey, uKey]);


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
            .then(() => {
                const stamp = new Date(Date.now()).toLocaleTimeString().split(` `);
                if (stamp[1] === `PM`) {
                    const time = stamp[0].split(`:`);
                    time[0] = String(Number(time[0]) + 12);
                    stamp[0] = time.join(`:`);
                }
                setChats([...chats, { 
                        'cID': String(chats.length + 1), 
                        'stamp': stamp[0],
                        'author': { 'uID': uID, 'name': user, 'ready': ready }, 
                        'message': curMessage 
                }])
            })
            .then(() => setMessage(``))
            .catch(err => console.error(err))
    }


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
                    { progress === DataState.Loading && <li>Loading...</li> }
                    { progress === DataState.Error && <li>Failed to load</li> }
                    { progress === DataState.Success &&
                        users.map((user, i) => <li key={i}>{ user.name }</li>) 
                    }
                </ul>
            </fieldset>
            
            <fieldset><legend>Chat</legend>
                <ul>
                    { progress === DataState.Loading && <li>Loading...</li> }
                    { progress === DataState.Error && <li>Failed to load</li> }
                    { progress === DataState.Success &&
                        chats.map((chat, i) => <li key={i}>{ chat.message } - { chat.author.uID === uID ? 'You' : chat.author.name }:{ chat.stamp.toString() }</li>) 
                    }
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