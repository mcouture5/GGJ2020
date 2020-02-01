import { IFubarObject, FubarObject } from "./FubarObject";

export interface IDoor {
    key: string;
    position: 'left' | 'right' | 'center';
    target: string;
}

export class Door extends FubarObject {
    private position: 'left' | 'right' | 'center';
    private target: string;

    constructor(params: IFubarObject, door: IDoor) {
        super(params);

        // image
        this.setOrigin(0.5, 0.5);
    }

    update(): void {
    }
}
