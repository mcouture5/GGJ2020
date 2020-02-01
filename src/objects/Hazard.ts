import { IFubarObject, FubarObject } from "./FubarObject";

export interface IHazard {
    key: string;
    position: { x: number, y: number };
    display: { width: number, height: number };
    tool: string;
}

export class Hazard extends FubarObject {
    constructor(params: IFubarObject, hazard: IHazard) {
        super(params);

        // image
        this.setOrigin(0.5, 0.5);
        this.displayWidth = hazard.display.width;
        this.displayHeight = hazard.display.width;
    }

    update(): void {
    }
}
