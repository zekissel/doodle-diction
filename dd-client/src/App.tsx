import './App.css'
import React, { useEffect, useState } from 'react'
import { MenuState } from './typedef';
import Join from './components/Join';
import Learn from './components/Learn';
import Lobby from './components/Lobby';

function App() {

  const [menu, setMenu] = useState<MenuState>(MenuState.Main);
  const goBack = () => { setMenu(MenuState.Main) };
  const goForward = (name: string, id: string) => { setCurRoom(name); setUID(id); setMenu(MenuState.Game) };
  const goJoin = () => { 
    setMenu(MenuState.Join); 
    setCurRoom(``); 
    setRoomKey(``); 
    setUserKey(``); 
  };
  const enterToJoin = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === `Enter`) setJoinIfNameSet(); }
  const setJoinIfNameSet = () => { 
    if (user !== ``) goJoin();
    else alert(`Please enter a nickname!`);
  }

  const [curRoom, setCurRoom] = useState(``);

  const [roomKey, setRoomKey] = useState(``);
  const [userKey, setUserKey] = useState(``);
  const [uID, setUID] = useState(``);

  const [user, setUser] = useState(``);
  const saveUser = (e: React.ChangeEvent<HTMLInputElement>) => { localStorage.setItem(`user`, e.target.value); setUser(e.target.value); }
  useEffect(() => {
    setUser(localStorage.getItem(`user`) || ``);
  }, []);

  return (
      <>
        { menu === MenuState.Main &&
          <menu>
            <h1>Doodle Diction</h1>
            <li onClick={setJoinIfNameSet}>Play</li>
            <li onClick={() => setMenu(MenuState.Learn)}>How to Play</li>
            <li>
              <input type='text' placeholder='Nickname' onChange={saveUser} defaultValue={user} onKeyDown={enterToJoin} />
            </li>
          </menu>
        }

        { menu === MenuState.Join && <Join setMain={goBack} setGame={goForward} setRKey={setRoomKey} setUKey={setUserKey} user={user} /> }
        { menu === MenuState.Learn && <Learn setMain={goBack} /> }
        
        { menu === MenuState.Game && 
          <Lobby setJoin={goJoin} name={curRoom} rKey={roomKey} uKey={userKey} uID={uID} setUID={setUID} user={user}/>
        }
      </>
  )
}

export default App
