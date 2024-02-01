import React, { useState } from "react";
import { GameProps } from "../typedef";
import { API_URL } from "../typedef";
import Canvas from "./_canvas";


function Game ({ round, prevAnswer, rKey, uKey }: GameProps) {

    const [myAnswer, setMyAnswer] = useState(``);

    const submitAnswer = async () => {
        fetch(`${API_URL}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                'r_key': rKey,
                'u_key': uKey,
                'answer': myAnswer,
            })
        })
            .then(() => setMyAnswer(``))
    }

    return (
        <div>
            { round === 0 && <h3>Waiting for players to be ready...</h3> }

            { round === 1 && 
                <>
                    <h3>Type a creative or interesting sentence: </h3>
                    <input type="text" id="textanswer" value={myAnswer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMyAnswer(e.target.value)}/>
                </>
            }

            { (round > 1 && round % 2 === 0) &&
                <>

                    <h3>Draw a picture to illustrate the sentence: </h3>
                    <h2>{ prevAnswer }</h2>
                    <Canvas height={300} width={400} updateImage={setMyAnswer} />
                </>
            }

            { (round > 1 && round % 2 !== 0) &&
                <>

                    <h3>Type a sentence to caption the picture: </h3>
                    <img src={prevAnswer} alt="Picture drawn last round by other player"/>
                    <input type="text" id="textanswer" value={myAnswer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMyAnswer(e.target.value)}/>
                </>
            }

            { round > 0 && <button onClick={submitAnswer}>Submit</button> }
        </div>
    )
}

export default Game;