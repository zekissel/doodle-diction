import React, { useState } from "react";
import { GameProps } from "../typedef";
import { API_URL } from "../typedef";
import Canvas from "./_canvas";


function Game ({ round, prevAnswer, ready, results, rKey, uKey }: GameProps) {

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

    const imgStyle = { backgroundColor: `#f0f0f0`, borderRadius: `10px`, boxShadow: `0 0 10px 5px #000000`}

    return (
        <div>
            { (round > 0 && ready) && <h3>Answer submitted! Wait for others players.</h3> }
            { round === 0 && <h3>Waiting for players to be ready...</h3> }

            { (!ready && round === 1) && 
                <>
                    <h3>Type a creative or interesting sentence: </h3>
                    <input type="text" id="textanswer" value={myAnswer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMyAnswer(e.target.value)}/>
                </>
            }

            { !ready && (round > 1 && round % 2 === 0) &&
                <>

                    <h3>Draw a picture to illustrate the sentence: </h3>
                    <h2>{ prevAnswer }</h2>
                    <Canvas height={300} width={400} updateImage={setMyAnswer} />
                </>
            }

            { !ready && (round > 1 && round % 2 !== 0) &&
                <>

                    <h3>Type a sentence to caption the picture: </h3>
                    <img src={prevAnswer} alt="Picture drawn last round by other player" style={imgStyle}/>
                    <input type="text" id="textanswer" value={myAnswer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMyAnswer(e.target.value)}/>
                </>
            }

            { (!ready && round > 0) && <button onClick={submitAnswer}>Submit</button> }

            { round === -1 && 
                <div>
                    results
                </div>
            }
        </div>
    )
}

export default Game;