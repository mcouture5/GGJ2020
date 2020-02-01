import { Scene } from 'phaser';
import { Foot } from '../objects/Foot';

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
		this.foot = new Foot({
            scene: this,
            x: 70,
            y: 500,
            key: 'foot',
		});
        // Add foot
        this.add.existing(this.foot);
	}

    update(): void {
        this.foot.update();
    }
}
