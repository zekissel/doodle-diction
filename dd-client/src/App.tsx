import './App.css'
import { useState } from 'react'
import { MenuState } from './typedef';
import Join from './components/Join';
import Learn from './components/Learn';
import Lobby from './components/Lobby';

function App() {

  const [menu, setMenu] = useState<MenuState>(MenuState.Main);
  const goBack = () => { setMenu(MenuState.Main) };
  const goForward = (name: string) => { setCurRoom(name); setMenu(MenuState.Game) };
  const goJoin = () => { 
    setMenu(MenuState.Join); 
    setCurRoom(``); 
    setRoomKey(``); 
    setUserKey(``); 
  };

  const [curRoom, setCurRoom] = useState(``);
  const [roomKey, setRoomKey] = useState(``);
  const [userKey, setUserKey] = useState(``);
  

  return (
      <>
        <h1 onClick={menu !== MenuState.Game ? goBack : undefined}>Doodle Diction</h1>
        { menu === MenuState.Main &&
          <menu>
            <li onClick={() => setMenu(MenuState.Join)}>Play</li>
            <li onClick={() => setMenu(MenuState.Learn)}>How to Play</li>
          </menu>
        }

        { menu === MenuState.Join && <Join setMain={goBack} setGame={goForward} setRKey={setRoomKey} setUKey={setUserKey} /> }
        { menu === MenuState.Learn && <Learn setMain={goBack} /> }
        
        { menu === MenuState.Game && 
          <Lobby setJoin={goJoin} name={curRoom} rKey={roomKey} uKey={userKey} />
        }
      </>
  )
}

export default App
