import React, { useEffect, useState } from "react";
import { SettingsProps, API_URL } from "../typedef";

function Settings ({ round, setShowSettings, rKey, uKey }: SettingsProps) {

    const [maxPlayers, setMaxPlayers] = useState(6);
    const [visibility, setVisibility] = useState(0);
    const [roundTimer, setRoundTimer] = useState(0);
    const [maxRounds, setMaxRounds] = useState(5);
    const [enableChat, setEnableChat] = useState(true);
    // add password variable

    useEffect(() => {
        fetch(`${API_URL}/settings/${rKey}/${uKey}`)
                .then(res => res.json())
                .then(dat => {
                    setMaxPlayers(dat['max_players']);
                    setVisibility(dat['visibility']);
                    setRoundTimer(dat['round_timer']);
                    setMaxRounds(dat['max_rounds']);
                    setEnableChat(dat['chat']);
                })
                .catch(err => {
                    console.error(err)
                })
    }, []);

    const saveSettings = async () => {
        fetch(`${API_URL}/settings/${rKey}/${uKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                'max_players': maxPlayers,
                'visibility': visibility,
                'round_timer': roundTimer,
                'max_rounds': maxRounds,
                'chat': enableChat,
            })
        })
            .then(() => setShowSettings(false))
    }

    return (
        <fieldset><legend>Settings</legend>
            <ul id='settingsbox'>
                <li>Maximum # players:  
                    <button onClick={() => setMaxPlayers(maxPlayers - 1)} disabled={maxPlayers < 2}>&lt;</button>
                    <span>{maxPlayers}</span>
                    <button onClick={() => setMaxPlayers(maxPlayers + 1)} disabled={maxPlayers > 9}>&gt;</button>
                </li>
                <li>Visibility:
                    <select onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVisibility(Number(e.target.value))}>
                        <option value="0" selected={visibility === 0}>Public</option>
                        <option value="1" selected={visibility === 1}>Private</option>
                    </select>
                </li>
                <li>Round timer:
                    <select onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoundTimer(Number(e.target.value))}>
                        <option value="0" selected={roundTimer === 0}>None</option>
                        <option value="60" selected={roundTimer === 60}>1 minute</option>
                        <option value="120" selected={roundTimer === 120}>2 minutes</option>
                    </select>
                </li>
                <li>Maximum # rounds: 
                    <button onClick={() => setMaxRounds(maxRounds - 1)} disabled={maxRounds < 3 || maxRounds == round}>&lt;</button>
                    <span>{maxRounds}</span>
                    <button onClick={() => setMaxRounds(maxRounds + 1)} disabled={maxRounds > 10}>&gt;</button>
                </li>
                <li>Chat:
                    <select 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEnableChat(e.target.value === 'true')}
                    >
                        <option value="true" selected={enableChat}>Enabled</option>
                        <option value="false" selected={!enableChat}>Disabled</option>
                    </select>
                </li>
            </ul>
            <div id="setbut">
                <button onClick={() => saveSettings()}>Save</button>
                <button onClick={() => setShowSettings(false)}>Close</button>
            </div>
        </fieldset>
    )
}

export default Settings;