import { Scene } from 'phaser';
import { Foot } from '../objects/Foot';
import { IFubarObject } from '../objects/FubarObject';

enum GameState {
    STARTING_LEVEL,
    GETTING_RECIPE,
    AWAITING_INPUT,
    ANIMATING
}

export class LevelIntro extends Phaser.Scene {
    // variables
	private fading: boolean;
	private foot: Foot;

	private footAnim: Phaser.Tweens.Tween;

    constructor() {
        super({
            key: 'LevelIntro'
        });
    }

    init(): void {
    }

    create(): void {
        // Create the background and main scene
        let bg = this.add.sprite(0, 0, 'game_bg').setOrigin(0, 0);
        bg.displayWidth = 1024;
		bg.displayHeight = 768;

		// this.add.sprite(0, 0, 'background').setOrigin(0, 0);
		let fubarParams: IFubarObject = {
			scene: this,
			x: 900,
			y: -512,
			frame: 0
		};
		this.foot = new Foot(fubarParams);
		this.add.existing(this.foot);

		this.footAnim = this.add.tween({
            targets: this.foot,
            duration: 1000,
            onComplete: () => {
                this.cameras.main.shake(1000,0.02);
			},
			y: 0
        })
	}

    update(): void {
        this.foot.update();
    }
}
