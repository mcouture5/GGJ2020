export interface IFoot {
    scene: Phaser.Scene;
    x: number,
    y: number;
    key?: string;
    frame?: number;
}

export class Foot extends Phaser.GameObjects.Sprite {
    constructor(params: IFoot) {
        super(params.scene, params.x, params.y, params.key, params.frame);

        // image
        this.setScale(3);
        this.setOrigin(0, 0);
    }

    update(): void {
    }
}