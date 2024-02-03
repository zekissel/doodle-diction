import React, { useState, useEffect, useRef } from "react";
import { API_URL, ChatInfo, LobbyProps, UserInfo, DataState, GameInfo } from "../typedef";
import Game from "./Game";
import Settings from "./Settings";

function Lobby ({ setJoin, name, rKey, uKey, uID, setUID, user }: LobbyProps) {

    const [ready, setReady] = useState(false);
    const [curMessage, setMessage] = useState(``);
    const [enableChat, setEnableChat] = useState(true);

    const [curRound, setRound] = useState(0);
    const [prevAnswer, setPrevAnswer] = useState(``);

    const [users, setUsers] = useState<UserInfo[]>([]);
    const [chats, setChats] = useState<ChatInfo[]>([]);
    const [progress, setProgress] = useState<DataState>(DataState.Loading);
    
    const [confirmExit, setExit] = useState(false);
    const endChat = useRef<HTMLDivElement>(null);

    const [showSettings, setShowSettings] = useState(false);

    /* 
        update lobby info from server: 
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
                        setReady(dat['ready']);
                        setRound(dat['round']);
                        setPrevAnswer(dat['prev_answer']);
                        setEnableChat(dat['chat']);
                        setProgress(DataState.Success);
                    }
                })
                .catch(err => {
                    console.error(err)
                    setProgress(DataState.Error);
                })
        }, 2000);

        return () => clearInterval(interval);
    }, [rKey, uKey, uID, ready]);


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
            .catch(() => setJoin())
    }

    const signalReady = async () => {
        fetch(`${API_URL}/ready`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                'r_key': rKey,
                'u_key': uKey,
                'ready': !ready,
            })
        })
            .then(() => setReady(!ready))
            .catch(err => console.error(err))
    }

    const enterToSend = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === `Enter`) sendMessage(); }
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

    const altColor = { backgroundColor: `#1c1c1c`};
    useEffect(() => {
        endChat.current?.scrollIntoView({ behavior: `smooth` });
    }, [chats]);

    return (
        <main>
            <div className="lobbypanel">
                { confirmExit && 
                    <div>
                        <span>Exit to menu? </span>
                        <button onClick={exitRoom}>Confirm</button>
                        <button onClick={() => setExit(false)}>Cancel</button>
                    </div>
                }
                { showSettings && 
                   <Settings setShowSettings={setShowSettings} rKey={rKey} uKey={uKey} />
                }

                <fieldset className="lobbyfield" id="roombox"><legend><h3>Room: { name }</h3></legend>
                    <button onClick={() => setExit(true)}>Exit</button>
                    { Number(uID) === 0 && 
                        <button onClick={() => setShowSettings(true)}>Settings</button> 
                    }
                </fieldset>
                
                <fieldset className="lobbyfield" id="playerbox"><legend>Players</legend>
                    <ul id="players">
                        { progress === DataState.Loading && <li>Loading...</li> }
                        { progress === DataState.Error && <li>Failed to load</li> }
                        { progress === DataState.Success &&
                            users.map((user, i) => 
                            <li key={i} className="playerentry" style={i%2==0?undefined:altColor}> 
                                { user.name }
                                <span className="playerinfo">
                                { (user.uID === uID) && (curRound < 1) ?
                                    <button onClick={signalReady}>{ ready ? 'Cancel' : 'Ready Up' }</button>
                                    : <span>{ user.ready ? 'Ready' : 'Not Ready' }</span>
                                }</span>
                            </li>) 
                        }
                    </ul>
                </fieldset>
                
                <fieldset className="lobbyfield" id="chatbox"><legend>Chat</legend>
                    <ul id="chat">
                        { progress === DataState.Loading && <li>Loading...</li> }
                        { progress === DataState.Error && <li>Failed to load</li> }
                        { progress === DataState.Success &&
                            
                            chats.map((chat, i) => <li key={i} className="chatentry" style={i%2==0?undefined:altColor}>{ chat.message } <span className="chatinfo"> { chat.author.uID === uID ? 'You' : chat.author.name }@{ chat.stamp.toString() }</span></li>)
                            
                        }
                        <div ref={endChat}></div>
                    </ul>
                    <div id="chatinput">
                        <input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} value={curMessage} onKeyDown={enterToSend} disabled={!enableChat}/>
                        <button onClick={sendMessage} disabled={!enableChat}>Send</button>
                    </div>
                </fieldset>
            </div>

            <fieldset className="gamefield">
                <legend><h3>
                    { curRound === 0 && 'Pregame' }
                    { curRound > 0 && `Round ${curRound}` }
                    { curRound === -1 && 'Game Over' }
                </h3></legend>
                <Game round={curRound} prevAnswer={prevAnswer} ready={ready} rKey={rKey} uKey={uKey}/>
            </fieldset>
        </main>
    )
}

export default Lobby;