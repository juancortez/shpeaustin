export enum HueLight {
    TopDining,
    Closet,
    Bedside,
    BottomDining,
    Bed
}

export type IHueLights = { [light in HueLight]: number; }