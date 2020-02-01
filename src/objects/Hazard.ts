export interface IHazard {
    key: string;
    position: { x: number, y: number };
    tool: string;
}

export class Hazard extends Phaser.GameObjects.Sprite {
    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);

        // image
        this.setScale(3);
        this.setOrigin(0, 0);
    }

    update(): void {
    }
}
