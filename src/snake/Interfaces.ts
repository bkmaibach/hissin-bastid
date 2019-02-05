export enum EMoveTypes {
    wall,
    body,
    contested,
    uncontested,
    unknown
}

export enum EMoveDirections {
    up = "up",
    down = "down",
    left = "left",
    right = "right"
}

export interface IMoveInfo {
    type: EMoveTypes;
    head?: boolean;
    food?: boolean;
    snakeLengths?: number[];

}
export interface IResponseData {
    move: EMoveDirections;
}

export interface IPoint {
    x: number;
    y: number;
}

export interface IGame {
    id: string;
}

export interface ISnake {
    id: string;
    name: string;
    health: number;
    body: IPoint[];
}

export interface IBoard {
    height: number;
    width: number;
    food: IPoint[];
    snakes: ISnake[];
}

export interface IGameState {
    game: IGame;
    turn: number;
    board: IBoard;
    you: ISnake;
}