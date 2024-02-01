import React, { useState } from "react";
import { SettingsProps } from "../typedef";

function Settings ({ setShowSettings }: SettingsProps) {

    const [maxPlayers, setMaxPlayers] = useState(6);
    const [visibility, setVisibility] = useState(0);
    const [roundTimer, setRoundTimer] = useState(0);
    const [maxRounds, setMaxRounds] = useState(5);
    const [enableChat, setEnableChat] = useState(true);

    return (
        <fieldset><legend>Settings</legend>
        <ul id='settingsbox'>
            <li>Maximum # players:  
                <button onClick={() => setMaxPlayers(maxPlayers - 1)} disabled={maxPlayers < 2}>&lt;</button>
                <span>{maxPlayers}</span>
                <button onClick={() => setMaxPlayers(maxPlayers + 1)} disabled={maxPlayers > 9}>&gt;</button>
            </li>
            <li>Visibility:
                <select defaultValue={visibility} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVisibility(Number(e.target.value))}>
                    <option value="0">Public</option>
                    <option value="1">Private</option>
                </select>
            </li>
            <li>Round timer:
                <select defaultValue={roundTimer} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoundTimer(Number(e.target.value))}>
                    <option value="0">None</option>
                    <option value="60">1 minute</option>
                    <option value="120">2 minutes</option>
                </select>
            </li>
            <li>Maximum # rounds: 
                <button onClick={() => setMaxRounds(maxRounds - 1)} disabled={maxPlayers < 2}>&lt;</button>
                <span>{maxRounds}</span>
                <button onClick={() => setMaxRounds(maxRounds + 1)} disabled={maxPlayers > 9}>&gt;</button>
            </li>
            <li>Chat:
                <select>
                    <option value="0">Enabled</option>
                    <option value="1">Disabled</option>
                </select>
            </li>
        </ul>
        <div id="setbut">
            <button onClick={() => {}}>Save</button>
            <button onClick={() => setShowSettings(false)}>Close</button>
        </div>
    </fieldset>
    )
}

export default Settings;