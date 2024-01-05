import { useEffect, useState } from "react";
import { API_URL, JoinProps, RoomInfo } from "../typedef";

function Join ({ setMain, setGame, setRKey, setUKey }: JoinProps) {

    const [roomName, setRoom] = useState(``);
    const [roomPass, setPass] = useState(``);
    const [isPrivate, setPrivate] = useState(false);
    const [capacity, setCap] = useState(6);

    const [hostError, setHError] = useState(``);
    const [joinError, setJError] = useState(``);
    const voidError = () => { setHError(``); setJError(``); }

    const [verify, setVerify] = useState(false);
    const [rooms, setRooms] = useState<RoomInfo[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`${API_URL}/join`)
                .then(res => res.json())
                .then(dat => setRooms(dat['rooms']))
                .catch(err => console.error(err))
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const hostGame = async () => {
        voidError();
        if (roomName === ``) return

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
                    setRKey(dat['rKey']);
                    setUKey(dat['uKey']);
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
                    setRKey(dat['rKey']);
                    setUKey(dat['uKey']);
                    setGame!(roomName);
                }
            })
            .catch(err => console.error(err))
    }


    return (

        <menu>
            <li onClick={setMain}>Back to Menu</li>

            <fieldset>
                <legend>Host</legend>
                <li><input type='text' name='rID' placeholder='Room name' onChange={e => setRoom(e.target.value)}/></li>
                { isPrivate && <li><input type='text' name='rPW' placeholder='Password' onChange={e => setPass(e.target.value)}/></li> }
                <li><input type='checkbox' name='public' defaultChecked={isPrivate} onClick={() => setPrivate(!isPrivate)}/><label>private</label></li>
                <li><input type='range' name='capacity' min={1} max={10} defaultValue={capacity} onChange={e => setCap(Number(e.target.value))}/><label>({ capacity }) max. players</label></li>
    
                <li><button onClick={hostGame}>Create</button></li>

                { hostError !== `` && <li>{ hostError }</li> }
            </fieldset>

            <fieldset>
                <legend>Join</legend>
                <li>
                    { !verify && <input type='text' name='rID' placeholder='Room name' />}
                    { verify && <input type='text' name='pw' placeholder='Enter password' />}
                </li>
                <li><button onClick={joinGame}>Connect</button></li>
                { joinError !== `` && <li>{ joinError }</li> }
            </fieldset>

            <fieldset>
                <legend>Public Games</legend>
                    <ul>
                        { rooms.map(r => <li key={r.id}>{ r.name }</li>) }
                    </ul>
            </fieldset>
            
            
        </menu>
    )
}

export default Join;