import { Scene } from 'phaser';

enum GameState {
    STARTING_LEVEL,
    GETTING_RECIPE,
    AWAITING_INPUT,
    ANIMATING
}

export class LevelIntro extends Phaser.Scene {
    // variables
	private fading: boolean;
	private y = 0;

    constructor() {
        super({
            key: 'LevelIntro'
        });
    }

    init(): void {
		this.load.atlas('foot', 'assets/foot.png');
    }

    create(): void {
        // Create the background and main scene
        // this.add.sprite(0, 0, 'background').setOrigin(0, 0);

        // Listen for events from obejcts
        this.events.addListener('event', () => {
            // noop
		});

		this.anims.on(Phaser.Animations.Events.ADD_ANIMATION, this.addAnimation, this);
    }

    update(): void {
        // Very first update, begin a fade in (camera & music)
        if (this.fading) {
            let fadeInDuration: number = 1300;
            this.cameras.main.fadeIn(fadeInDuration, 255, 255, 255);
            this.fading = false;
        }
    }

	addAnimation(key): void {
		this.add.sprite(400, this.y, 'gems').play(key);
	}
}
