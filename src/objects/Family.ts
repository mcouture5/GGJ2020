import { FubarObject, IFubarObject } from "./FubarObject";


export class Family extends FubarObject {
    constructor(params: IFubarObject) {
		params.key = 'ants';
        super(params);

        this.setOrigin(0, 0);
        this.displayWidth = 170;
        this.displayHeight = 133;
    }

    update(): void {
    }
}