export interface ILog {
    date: number;
    id: string;
    log: string;
    severity: string;
}

export enum LogTypes {
    All,
    Regular,
    Error,
    Info
}