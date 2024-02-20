import './App.css'
import React, { useEffect, useState } from 'react'
import { MenuState } from './typedef';
import Join from './components/Join';
import Learn from './components/Learn';
import Lobby from './components/Lobby';

window.addEventListener('touchmove', ev => {
  if (
    (ev.target as HTMLElement)!.nodeName !== 'CANVAS'
  ) {
    ev.preventDefault();
    ev.stopImmediatePropagation();
  };
}, { passive: false });

window.addEventListener('touchstart', ev => {
  if (
    (ev.target as HTMLElement)!.nodeName !== 'CANVAS' &&
    (ev.target as HTMLElement)!.nodeName !== 'INPUT' &&
    (ev.target as HTMLElement)!.nodeName !== 'BUTTON'
  ) {
    ev.preventDefault();
    ev.stopImmediatePropagation();
  };
}, { passive: false });

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
            <li><button onClick={setJoinIfNameSet}>Play</button></li>
            <li><button onClick={() => setMenu(MenuState.Learn)}>How to Play</button></li>
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
