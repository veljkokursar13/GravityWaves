//images types
export type Image = {
    id: string;
    name: string;
    path: string;
    type: 'image' | 'icon';
    width: number;
    height: number;
};
export type Images = {
    id: string;
    images: Image[];
};