import { MenuProps } from "../typedef";

function Learn ({ setMain }: MenuProps) {


    return (

        <menu>
            <li onClick={setMain}>return to menu</li>
            <li>get gud</li>
            
        </menu>
    )
}

export default Learn;