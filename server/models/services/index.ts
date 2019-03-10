export enum HueLight {
    TopDining,
    Closet,
    Bedside,
    BottomDining,
    Bed
}

export interface IReiProducts {
    items: IReiProduct[]
}

export interface IReiProduct {
    productId: number;
    productName: string;
    productSellingPrice: number;
    thresholdDifference: number;
}

export type IHueLights = { [light in HueLight]: number; }