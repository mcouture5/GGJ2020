export interface IFubarObject {
    scene: Phaser.Scene;
    x: number,
    y: number;
    key?: string;
    frame?: number;
}

/**
 * Just a wrapper class to expose some common options
 */
export class FubarObject extends Phaser.GameObjects.Sprite {
    constructor(params: IFubarObject) {
        super(params.scene, params.x, params.y, params.key, params.frame);
    }
}
