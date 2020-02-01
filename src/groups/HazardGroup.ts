import { IFubarObject } from "../objects/FubarObject";
import { IHazard, Hazard } from "../objects/Hazard";

export class HazardGroup extends Phaser.GameObjects.Group {
    private hazards: Hazard[];

    constructor(params: {scene: Phaser.Scene, hazards: IHazard[]}) {
        super(params.scene);
        this.hazards = [];
        this.createHazards(params.hazards);
    }
    
    private createHazards(hazs: IHazard[]) {
        for (let hazard of hazs) {
            // Create a new position
            let fubarParams: IFubarObject = {
                scene: this.scene,
                x: hazard.position.x,
                y: hazard.position.y,
                key: hazard.key,
                frame: 0
            };
            let hazardSprite = new Hazard(fubarParams, hazard);
            this.add(hazardSprite, true);
            this.hazards.push(hazardSprite);
        }
    }
}