import { useEffect, useState } from "react";
import { API_URL, DataState, JoinProps, RoomInfo } from "../typedef";

function Join ({ setMain, setGame, setRKey, setUKey, user }: JoinProps) {

  /* variables used to create/join room */
  const [hostName, setHostName] = useState(``);
  const [hostPass, setHostPass] = useState(``);
  const [isPublic, setPublic] = useState(true);
  const [capacity, setCap] = useState(6);

  const [joinName, setJoinName] = useState(``);
  const [joinPass, setJoinPass] = useState(``);
  //const resetJoin = () => { setJoinName(``); setJoinPass(``); setVerify(false); }
  // server prompts users for rooms with passwords != ''
  const [verify, setVerify] = useState(false);
  const [joinIndex, setJoinIndex] = useState(-1);

  /* GUI errors for user feedback */
  const [noHostNameError, setHNError] = useState(false);
  const [noJoinNameError, setJNError] = useState(false);
  const [hostError, setHError] = useState(``);
  const [joinError, setJError] = useState(``);
  const [pubError, setPError] = useState(``);
  const voidError = () => { 
    setHError(``); 
    setJError(``);
    setPError(``);
    setHNError(false); 
    setJNError(false);
  }
  
  // list of rooms to be displayed to user
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [progress, setProgress] = useState<DataState>(DataState.Loading);
  

  const fetchPublicRooms = async () => {
    fetch(`${API_URL}/join`)
      .then(res => res.json())
      .then(dat => {
          setRooms(dat['rooms']);
          setProgress(DataState.Success);
      })
      .catch(() => setProgress(DataState.Error))
  }

  // fetch list of rooms every 3 seconds
  useEffect(() => {
    fetchPublicRooms();
    const interval = setInterval(() => {
      fetchPublicRooms();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const hostGame = async () => {
    voidError();
    if (hostName === ``) { 
      setHNError(true); 
      setTimeout(() => setHNError(false), 5000);
      return 
    }
    // private rooms have negative capacity (not necessarily password enforced)
    fetch(`${API_URL}/host`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        'name': hostName,
        'pw': hostPass,
        'cap': isPublic ? capacity : capacity * -1,
        'host': user,
      })})
        .then(res => res.json())
        .then(dat => {
          if ('err' in dat) {
            setHError(dat['err'])
            setTimeout(() => setHError(``), 5000);
          }
          else {
            setRKey(dat['r_key']);
            setUKey(dat['u_key']);
            setGame(hostName, dat['u_id']);
        }})
        .catch(err => console.error(err))
  }

  const enterJoin = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === `Enter`) joinGame(joinName);
  }
  const joinGame = async (name: string) => {
    voidError();
    if (name === ``) {
      setJNError(true); 
      setTimeout(() => setJNError(false), 5000);
      return 
    }
    if (verify && joinPass === ``) return

    fetch(`${API_URL}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", }, 
      body: JSON.stringify({
        'name': name,
        'pw': joinPass,
        'user': user,
    })})
      .then(res => res.json())
      .then(dat => {
        if ('err' in dat) {
          if (joinIndex > -1) setPError(dat['err']);
          else setJError(dat['err'])
          setTimeout(() => setJError(``), 5000);
          setTimeout(() => setPError(``), 5000);
          setJoinPass(``);
        }
        else if ('auth' in dat) setVerify(true);
        else {
          setRKey(dat['r_key']);
          setUKey(dat['u_key']);
          setGame(joinName, dat['u_id']);
      }})
      .catch(err => console.error(err))
  }

  const errorStyle = { border: `1px solid red` }

  return (

    <menu>
      <li><button onClick={setMain} id='return'>Back to Menu</button></li>

      <div className='rowstyle'>

        <fieldset className='hostbox'>
          <legend><strong>Host</strong></legend>

          <li className='hostfield'>
            <input type='text' 
              name='rID' 
              placeholder='Room Name' 
              onChange={e => setHostName(e.target.value)} 
              defaultValue={hostName}
              className='maxwidth'
              style={noHostNameError ? errorStyle : undefined}
            />
          </li>

          <li className='hostfield'>
            <input type='text' 
              name='rPW' 
              placeholder='Password (Optional)' 
              onChange={e => setHostPass(e.target.value)}
              className='maxwidth'
            />
          </li>

          <li className='hostfield'>
            <button 
              onClick={() => setCap(capacity - 1)}
              disabled={capacity <= 1}
            >◀</button>
            { ` ${capacity} ` }
            <button
              onClick={() => setCap(capacity + 1)}
              disabled={capacity >= 10}
            >▶</button>
            <label> Player{ capacity !== 1 && `s`}</label>
          </li>
            
          <li className='hostfield'>
            
            <button onClick={hostGame} id='hostsub'>
              { isPublic ? 'Host Publicly' : 'Host Privately' }
            </button>
            <button onClick={() => setPublic(!isPublic)}>
              { isPublic ? 'Lock' : 'Unlock' }
            </button>
          </li>

          { hostError !== `` && <li>{ hostError }</li> }
        </fieldset>

        <fieldset className='joinbox'>
            <legend><strong>Join</strong></legend>

            <li className='hostfield'>
                { (!verify || joinIndex !== -1) && 
                    <input type='text' 
                        name='rID' 
                        placeholder='Room Name' 
                        onChange={e => setJoinName(e.target.value)} 
                        defaultValue={joinIndex === -1 ? joinName : undefined}
                        style={ noJoinNameError ? errorStyle : undefined} 
                        onKeyDown={enterJoin}
                        onFocus={() => setJoinIndex(-1)} /> 
                }
                { (verify && joinIndex === -1) && 
                  <>
                    <label>Room: { joinName }</label>
                    <input type='text' 
                    name='pw' 
                    placeholder='Enter Password' 
                    onChange={e => setJoinPass(e.target.value)}
                    onKeyDown={enterJoin} />
                  </>
                }
            </li>

            <li>
              { joinIndex === -1 && joinError !== `` && <li>{ joinError }</li> }
              <button 
                onClick={() => { 
                    setJoinIndex(-1); joinGame(joinName); 
                }}
                id='joinsub'>Connect
              </button>
              { verify && joinIndex === -1 && <button onClick={() => setVerify(false)}>Cancel</button> }
            </li>

            
        </fieldset>

      </div>

      <fieldset className='pubbox'>
        <legend><strong>Public Games</strong></legend>

        <ul>
          { progress === DataState.Loading && 
              <li>Loading public games</li> 
          }
          { progress === DataState.Error && 
              <li>Could not load public games</li> 
          }

          { progress === DataState.Success &&

            (rooms.length > 0 ? 
              rooms.map((r, i) => 
                <li key={i}><fieldset className="pubgame">
                  <legend>{ r.name }</legend>
                  <span>{ r.users.length }/{ r.cap }</span><br/>
                  { (joinIndex > -1 && pubError !== ``) && <li>{ pubError }</li> }
                  { (verify && joinIndex === i) && 
                    <input type='text'
                        placeholder='Enter password' 
                        onChange={e => setJoinPass(e.target.value)}
                        onKeyDown={enterJoin} 
                    />
                  }
                  <button id="joinpub"
                    onClick={() => { 
                      setJoinIndex(i);
                      setVerify(false);
                      setJoinName(r.name); 
                      joinGame(r.name); 
                    }} 
                    disabled={(r.users.length >= r.cap) || (r.cur_round > 0)}>
                      { verify && joinIndex === i ? 'Enter' : (r.cur_round > 0 ? 'Game Started' : 'Join') }
                  </button>
                  { verify && joinIndex === i && <button onClick={() => setVerify(false)}>Cancel</button> }
                  </fieldset></li>
              ) :
              <li>No public games yet...</li>
            )
          }
        </ul>
      </fieldset>
        
    </menu>
  )
}

export default Join;