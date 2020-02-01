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
        this.setScale(hazard.display_ratio.width, hazard.display_ratio.height);
    }

    update(): void {
    }

    public activate() {
        console.log('Activate!!!')
    }
}
