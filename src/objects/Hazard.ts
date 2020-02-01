import { IFubarObject, FubarObject } from "./FubarObject";

export interface IHazard {
    key: string;
    position: { x: number, y: number };
    display_ratio: { width: number, height: number };
    tool: string;
}

export class Hazard extends FubarObject {
    constructor(params: IFubarObject, hazard: IHazard) {
        super(params);

        // image
        this.setOrigin(0.5, 0.5);
        this.displayWidth = hazard.display_ratio.width;
        this.displayHeight = hazard.display_ratio.width;
    }

    update(): void {
    }
}
