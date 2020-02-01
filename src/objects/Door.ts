import { IFubarObject, FubarObject } from "./FubarObject";

export interface IDoor {
    key: string;
    position: 'left' | 'right' | 'center';
    target: string;
}

export class Door extends FubarObject {
    private target: string;

    constructor(params: IFubarObject, door: IDoor) {
        super(params);

        // image
        this.setOrigin(0.5, 0.5);
        this.setScale(0.3, 0.3);
    }

    update(): void {
    }
}
