import { IFubarObject, FubarObject } from "./FubarObject";
import { Room } from "./Room";

export interface IHazard {
    key: string;
    position: { x: number, y: number };
    display_ratio: { width: number, height: number };
    tool: string;
}

export class Hazard extends FubarObject {
    private room: Room;
    private activeKey: string;

    constructor(params: IFubarObject, hazard: IHazard, room: Room) {
        super(params);

        // image
        this.setOrigin(0.5, 0.5);
        this.setScale(hazard.display_ratio.width, hazard.display_ratio.height);
        this.setX(hazard.position.x);
        this.setY(hazard.position.y);

        // Active key is the same name as the key with _active
        this.activeKey = params.key + '_active';

        this.room = room;
    }

    update(): void {
    }

    public activate() {
        // Cover this obkect with the active key
        let activeSprite = new Phaser.GameObjects.Sprite(this.scene, this.room.x + this.x, this.room.y + this.y, this.activeKey);
        activeSprite.setScale(0.3)
        this.scene.add.existing(activeSprite);
        console.log('Activate!!!')
    }
}
