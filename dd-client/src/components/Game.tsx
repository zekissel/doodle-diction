import React, { useEffect, useState } from "react";
import { GameProps, PostProps, ResultProps } from "../typedef";
import { API_URL, GameInfo } from "../typedef";
import Canvas from "./_canvas";

const imgStyle = { backgroundColor: `#f0f0f0`, borderRadius: `8px`, boxShadow: `0 0 5px 2px #000000` }

function Paper({ results }: ResultProps) {

    return (
        <ul className="resultpaper">
            { results.data.map((answer, i) => 
                <li key={i} className="resultans">
                    { i % 2 === 0 ? <p>{ answer }</p> : <img src={answer} alt="Drawing" style={imgStyle} /> }
                </li>
            )}
        </ul>
    )
}

function Postgame ({ rKey }: PostProps) {

    const [results, setResults] = useState<GameInfo[]>([]);

    useEffect(() => {
        fetch(`${API_URL}/results/${rKey}`)
            .then(res => res.json())
            .then(dat => {
                setResults(dat['results'])
            })
    }, []);


    return (
        results.map((game, i) => <Paper key={i} results={game} />)
    )
}


function Game ({ round, prevAnswer, ready, setReady, rKey, uKey }: GameProps) {

    const [myAnswer, setMyAnswer] = useState(``);

    const submitAnswer = async () => {
        if (myAnswer === ``) return;

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
            .then(() => {
                setMyAnswer(``);
                setReady(true);
            })
    }


    return (
        <div>
            { (round > 0 && ready) && <h3>Answer submitted! Wait for others players.</h3> }
            { round === 0 && <h3>Waiting for players to be ready...</h3> }

            { (!ready && round === 1) && 
                <>
                    <h3>Type an interesting or creative sentence: </h3>
                    <textarea id="textanswer" rows={5} cols={24} wrap="soft" value={myAnswer} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMyAnswer(e.target.value)}></textarea><br/>
                </>
            }

            { !ready && (round > 1 && round % 2 === 0) &&
                <>

                    <h3>Draw a picture to illustrate the sentence: </h3>
                    <h2>{ prevAnswer }</h2>
                    <Canvas height={270} width={360} updateImage={setMyAnswer} />
                </>
            }

            { !ready && (round > 1 && round % 2 !== 0) &&
                <>

                    <h3>Type a sentence to caption the picture: </h3>
                    <img src={prevAnswer} alt="Picture drawn last round by other player" style={imgStyle}/>
                    <textarea id="textanswer" rows={3} cols={24} wrap="soft" value={myAnswer} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMyAnswer(e.target.value)}></textarea><br/>
                </>
            }

            { (!ready && round > 0) && <button onClick={submitAnswer}>Submit</button> }

            { round === -1 && 
                <Postgame rKey={rKey}/>
            }
        </div>
    )
}

export default Game;