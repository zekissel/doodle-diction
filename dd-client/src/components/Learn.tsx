import { MenuProps } from "../typedef";

function Learn ({ setMain }: MenuProps) {


    return (

        <menu>
            <li><button onClick={setMain}>return to menu</button></li>
            <li>get gud</li>
            
        </menu>
    )
}

export default Learn;