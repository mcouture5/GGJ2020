import { Scene } from 'phaser';
import { Room, IRoom } from '../objects/Room';
import { IFubarObject } from '../objects/FubarObject';
import { RoomGroup } from '../groups/RoomGroup';

enum GameState {
    STARTING_LEVEL,
    GETTING_RECIPE,
    AWAITING_INPUT,
    ANIMATING
}

export class GameScene extends Phaser.Scene {
    // variables
    private fading: boolean;

    // Game state
    private state: GameState;

    // Rooms
    private layout: IRoom[];
    private roomGroup: RoomGroup;
    private rooms: Room[];

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    init(): void {
        // Starting level
        this.state = GameState.STARTING_LEVEL;
        // starts fading
        this.fading = true;
        // Get the rooms layout
        this.layout = this.cache.json.get('layout');

        // Create new rooms using the layout config
        this.roomGroup = null;
    }

    create(): void {
        // Create the background and main scene
        let bg = this.add.sprite(0, 0, 'game_bg').setOrigin(0, 0);
        bg.displayWidth = 1024;
        bg.displayHeight = 768;

        // Create and add the rooms
        this.roomGroup = new RoomGroup({scene: this, layout: this.layout});

        // Listen for events from obejcts
        this.events.addListener('event', () => {
            // noop
        });
    }

    update(): void {
        // Very first update, begin a fade in (camera & music)
        if (this.fading) {
            let fadeInDuration: number = 1300;
            this.cameras.main.fadeIn(fadeInDuration, 255, 255, 255);
            this.fading = false;
        }
        this.runGame();
    }

    private runGame() {
        switch (this.state) {
            case GameState.STARTING_LEVEL:
                break;
            case GameState.AWAITING_INPUT:
                break;
            case GameState.ANIMATING:
                break;
        }
    }

    private restartGame(): void {
        this.scene.start('MainMenu');
    }

}
