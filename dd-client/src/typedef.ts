export const API_URL = `http://localhost:8000`;

export enum MenuState { Main, Join, Learn, Game }
export interface MenuProps { 
    setMain: () => void;
}

export interface JoinProps {
    setMain: () => void;
    setGame: ((key: string) => void) | undefined;
    setRKey: React.Dispatch<React.SetStateAction<string>>;
    setUKey: React.Dispatch<React.SetStateAction<string>>;
}

export interface LobbyProps {
    setJoin: () => void;
    name: string;
    rKey: string;
    uKey: string;
}

export interface RoomInfo {
    id: number;
    name: string;
    pw: string;

    cap: number;
    host: UserInfo;

    users: UserInfo[];
    chats: ChatInfo[];
    games: GameInfo[];
}

export interface UserInfo {
    id: string;
    name: string;
    ready: boolean;
}

export interface ChatInfo {
    id: string;
    stamp: Date;
    author: string;
    message: string;
}


export interface GameInfo {
    id: string;
    data: string[];
}