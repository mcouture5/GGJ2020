import { FubarObject, IFubarObject } from "./FubarObject";


export class Foot extends FubarObject {
    constructor(params: IFubarObject) {
		params.key = 'foot';
        super(params);

        this.setOrigin(0, 0);
        this.displayWidth = -380;
        this.displayHeight = 380;
    }

    update(): void {
    }
}