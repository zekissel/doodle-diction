export const DEV: boolean = process.env.NODE_ENV !== 'production';
export const API_URL = DEV ? `http://localhost:8000` : `https://doodlediction.com`;

export enum DataState { Loading, Success, Error }
export enum MenuState { Main, Join, Learn, Game }
export interface MenuProps { 
    setMain: () => void;
}

export interface JoinProps {
    setMain: () => void;
    setGame: ((key: string, id: string) => void);
    setRKey: React.Dispatch<React.SetStateAction<string>>;
    setUKey: React.Dispatch<React.SetStateAction<string>>;
    user: string;
}

export interface LobbyProps {
    setJoin: () => void;
    name: string;
    rKey: string;
    uKey: string;
    uID: string;
    setUID: React.Dispatch<React.SetStateAction<string>>;
    user: string;
}

export interface SettingsProps {
    round: number;
    setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
    rKey: string;
    uKey: string;
}

export interface GameProps {
    round: number;
    prevAnswer: string;
    ready: boolean;
    setReady: React.Dispatch<React.SetStateAction<boolean>>;
    rKey: string;
    uKey: string;
}

export interface PostProps {
    rKey: string;
}

export interface ResultProps {
    results: GameInfo;
}

export interface SettingsInfo {
    max_rounds: number;
    round_timer: number;
    enable_chat: boolean;
}

export interface RoomInfo {
    rID: number;
    name: string;
    pw: string;

    cur_round: number;
    settings: SettingsInfo;
    cap: number;
    host: UserInfo;

    users: UserInfo[];
    chats: ChatInfo[];
    games: GameInfo[];
}

export interface UserInfo {
    uID: string;
    name: string;
    ready: boolean;
}

export interface ChatInfo {
    cID: string;
    stamp: string;
    author: UserInfo;
    message: string;
}


export interface GameInfo {
    gID: string;
    data: string[];
}