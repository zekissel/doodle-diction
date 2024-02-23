import { MenuProps } from "../typedef";

function Learn ({ setMain }: MenuProps) {


    return (

        <menu>
            <li><button onClick={setMain} id='return'>Back to Menu</button></li>

            <fieldset id='tutorial'><legend><strong>How to Play</strong></legend>
                <ol>
                    <li>One player will reserve a name for the lobby, and other players should join the game with that name.</li>
                    <li>After creating the lobby, the host has the ability to control the gameplay settings. Once all players are ready, the game will begin.</li>
                </ol>
                <br/>
                <ol>
                    <li>During the first round, all players must create a uniquely interesting sentence and submit it. After all players have submitted, the game proceeds to the next round.</li>
                    <li>During the second round, each player will be shown a sentence created by another player during the first round. The task this time is to illustrate the sentence and submit your drawing.</li>
                    <li>During the third round, each player will now see only a picture that has been drawn by another player during the previous round. The task now is to caption the illustration with a descriptive sentence.</li>
                    <li>The game continues in this manner: each round showing every player only one picture/sentence that was created by another player the previous round, and prompting a caption/illustration respectively.</li>
                    <li>Once the round limit has been reached, all original sentences are displayed to every player and you get to see how the non-auditory game of "Telephone" went!</li>
                </ol>
            </fieldset>
            
        </menu>
    )
}

export default Learn;