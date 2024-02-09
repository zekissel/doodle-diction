import { useEffect, useState } from "react";
import { API_URL, DataState, JoinProps, RoomInfo } from "../typedef";

function Join ({ setMain, setGame, setRKey, setUKey, user }: JoinProps) {

    /* variables used to create/join room */
    const [hostName, setHostName] = useState(``);
    const [hostPass, setHostPass] = useState(``);
    const [joinName, setJoinName] = useState(``);
    const [joinPass, setJoinPass] = useState(``);
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
        if (hostName === ``) return
        // private rooms have negative capacity (not necessarily password enforced)
        fetch(`${API_URL}/host`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                'name': hostName,
                'pw': hostPass,
                'cap': isPrivate ? capacity * -1 : capacity,
                'host': user,
            })
        })
            .then(res => res.json())
            .then(dat => {
                if ('err' in dat) setHError(dat['err'])
                else {
                    setRKey(dat['r_key']);
                    setUKey(dat['u_key']);
                    setGame(hostName, dat['u_id']);
                }
            })
            .catch(err => console.error(err))
    }

    const joinGame = async () => {
        voidError();
        if (joinName === ``) return
        if (verify && joinPass === ``) return

        fetch(`${API_URL}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json", }, 
            body: JSON.stringify({
                'name': joinName,
                'pw': joinPass,
                'user': user,
            })
        })
            .then(res => res.json())
            .then(dat => {
                if ('err' in dat) setJError(dat['err'])
                else if ('auth' in dat) setVerify(true);
                else {
                    setRKey(dat['r_key']);
                    setUKey(dat['u_key']);
                    setGame(joinName, dat['u_id']);
                }
            })
            .catch(err => console.error(err))
    }


    return (

        <menu>
            <li onClick={setMain}>Back to Menu</li>

            <div className="menurow">
                <fieldset className="hostbox">
                    <legend><strong>Host</strong></legend>
                    <li>
                        <input type='text' name='rID' placeholder='Room name' onChange={e => setHostName(e.target.value)} defaultValue={hostName}/>
                    </li>
                    <li>
                        <input type='checkbox' name='public' defaultChecked={isPrivate} onClick={() => setPrivate(!isPrivate)}/><label>Private</label>
                    </li>

                    { isPrivate && <li><input type='text' name='rPW' placeholder='Password (Optional)' onChange={e => setHostPass(e.target.value)}/></li> }

                    <li><label>Max players: { capacity }</label></li>
                    <li><input type='range' name='capacity' min={1} max={10} defaultValue={capacity} onChange={e => setCap(Number(e.target.value))}/></li>
                    
        
                    <li><button onClick={hostGame}>Create</button></li>

                    { hostError !== `` && <li>{ hostError }</li> }
                </fieldset>

                <fieldset className="joinbox">
                    <legend><strong>Join</strong></legend>
                    <li>
                        { !verify && <input type='text' name='rID' placeholder='Room name' onChange={e => setJoinName(e.target.value)} defaultValue={joinName}/>}
                        { verify && <input type='text' name='pw' placeholder='Enter password' onChange={e => setJoinPass(e.target.value)} />}
                    </li>
                    <li><button onClick={joinGame}>Connect</button></li>
                    { joinError !== `` && <li>{ joinError }</li> }
                </fieldset>
            </div>

            <fieldset className="pubbox">
                <legend><strong>Public Games</strong></legend>
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