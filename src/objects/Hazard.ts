import { IFubarObject, FubarObject } from "./FubarObject";

export interface IHazard {
    key: string;
    position: { x: number, y: number };
    tool: string;
}

export class Hazard extends FubarObject {
    private 
    constructor(params: IFubarObject, hazard: IHazard) {
        super(params);

        // image
        this.setOrigin(0, 0);
        this.displayWidth = 32;
        this.displayHeight = 64;
    }

    update(): void {
    }
}
