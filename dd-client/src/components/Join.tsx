import { useEffect, useState } from "react";
import { API_URL, DataState, JoinProps, RoomInfo } from "../typedef";

function Join ({ setMain, setGame, setRKey, setUKey }: JoinProps) {

    /* variables used to create/join room */
    const [roomName, setRoom] = useState(``);
    const [roomPass, setPass] = useState(``);
    const [isPrivate, setPrivate] = useState(false);
    const [capacity, setCap] = useState(6);
    // prompt users for rooms with passwords != ''
    const [verify, setVerify] = useState(false);
    /* GUI errors for user feedback */
    const [hostError, setHError] = useState(``);
    const [joinError, setJError] = useState(``);
    const voidError = () => { setHError(``); setJError(``); }

    // list of rooms to be displayed to user
    const [rooms, setRooms] = useState<RoomInfo[]>([]);
    const [progress, setProgress] = useState<DataState>(DataState.Loading);

    // fetch list of rooms every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            // setProgress(DataState.Loading);
            fetch(`${API_URL}/join`)
                .then(res => res.json())
                .then(dat => {
                    setRooms(dat['rooms']);
                    setProgress(DataState.Success);
                })
                .catch(err => {
                    console.error(err)
                    setProgress(DataState.Error);
                })
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const hostGame = async () => {
        voidError();
        if (roomName === ``) return
        // private rooms have negative capacity (not necessarily password enforced)
        if (isPrivate) setCap(capacity * -1);
        fetch(`${API_URL}/host`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                'name': roomName,
                'pw': roomPass,
                'cap': capacity,
            })
        })
            .then(res => res.json())
            .then(dat => {
                if ('err' in dat) setHError(dat['err'])
                else {
                    setRKey(dat['r_key']);
                    setUKey(dat['u_key']);
                    setGame!(roomName);
                }
            })
            .catch(err => console.error(err))
    }

    const joinGame = async () => {
        voidError();
        if (roomName === ``) return
        if (verify && roomPass === ``) return

        fetch(`${API_URL}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json", }, 
            body: JSON.stringify({
                'name': roomName,
                'pw': roomPass,
            })
        })
            .then(res => res.json())
            .then(dat => {
                if ('err' in dat) setJError(dat['err'])
                else if ('auth' in dat) setVerify(true);
                else {
                    setRKey(dat['r_key']);
                    setUKey(dat['u_key']);
                    setGame!(roomName);
                }
            })
            .catch(err => console.error(err))
    }


    return (

        <menu>
            <li onClick={setMain}>Back to Menu</li>

            <div className="menurow">
            <fieldset className="hostbox">
                <legend>Host</legend>
                <li>
                    <input type='text' name='rID' placeholder='Room name' onChange={e => setRoom(e.target.value)}/>
                    <input type='checkbox' name='public' defaultChecked={isPrivate} onClick={() => setPrivate(!isPrivate)}/><label>Private</label>
                </li>

                { isPrivate && <li><input type='text' name='rPW' placeholder='Password' onChange={e => setPass(e.target.value)}/></li> }
                <li><input type='range' name='capacity' min={1} max={10} defaultValue={capacity} onChange={e => setCap(Number(e.target.value))}/><label>Max players: { capacity }</label></li>
    
                <li><button onClick={hostGame}>Create</button></li>

                { hostError !== `` && <li>{ hostError }</li> }
            </fieldset>

            <fieldset className="joinbox">
                <legend>Join</legend>
                <li>
                    { !verify && <input type='text' name='rID' placeholder='Room name' onChange={e => setRoom(e.target.value)} />}
                    { verify && <input type='text' name='pw' placeholder='Enter password' onChange={e => setPass(e.target.value)} />}
                </li>
                <li><button onClick={joinGame}>Connect</button></li>
                { joinError !== `` && <li>{ joinError }</li> }
            </fieldset>
            </div>

            <fieldset className="pubbox">
                <legend>Public Games</legend>
                    <ul>
                        { progress === DataState.Loading && <li>Loading public games</li> }
                        { progress === DataState.Error && <li>Could not load public games</li> }

                        { progress === DataState.Success &&
                            (rooms.length > 0 ? rooms.map(r => <li key={r.rID}>{ r.name }</li>) 
                            : <li>No public games yet</li>)
                        }
                    </ul>
            </fieldset>
            
            
        </menu>
    )
}

export default Join;