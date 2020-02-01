import { Scene } from 'phaser';
import { Room, IRoom } from '../objects/Room';
import { IFubarObject } from '../objects/FubarObject';
import { RoomGroup } from '../groups/RoomGroup';
import { Beetle } from '../objects/Beetle';

enum GameState {
    STARTING_LEVEL,
    GETTING_RECIPE,
    AWAITING_INPUT,
    ANIMATING
}

// All of the rooms
let LIVING_ROOM = "living_room";
let FAMILY_ROOM = "family_room";
let DINING_ROOM = "dining_room";
let BEDROOM = "bedroom";
let BATHROOM = "bathroom";
let KITCHEN = "kitchen";

export class GameScene extends Phaser.Scene {
    // variables
    private fading: boolean;

    // Game state
    private state: GameState;

    // Keep references
    private camera: Phaser.Cameras.Scene2D.Camera;

    // Rooms
    private layout: IRoom[];
    private rooms: { [key: string]: Room };
    private currentRoom: Room;

    private beetleSprite;
    private beetle;
    private beetleEvents: Phaser.Events.EventEmitter;

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
        this.rooms = {};
        this.currentRoom = null;

        // References
        this.camera = this.cameras.main;

        this.beetleEvents = new Phaser.Events.EventEmitter();
    }

    create(): void {
        // Create the background and main scene
        let bg = this.add.sprite(0, 0, 'game_bg').setOrigin(0, 0);
        bg.displayWidth = 1024;
        bg.displayHeight = 768;

        // Create and add the rooms
        for (let room_key in this.layout) {
            let room = this.layout[room_key];
            let roomContainer = new Room(this, room.position.x, room.position.y, room);
            this.add.existing(roomContainer);
            this.rooms[room_key] = roomContainer;
        }

        // Start in the living room
        this.currentRoom = this.rooms[LIVING_ROOM];

        // Listen for events from obejcts
        this.events.addListener('event', () => {
            // noop
        });

        // Listen for when the hero interacts with a door
        this.events.addListener('door', (door) => {
            // Stop all input!
            this.state = GameState.ANIMATING;

            // Pan to the new level
        });
        
        // Listen for every time the camera is done fading
        this.camera.once('camerafadeincomplete', (camera) => {
            this.state = GameState.AWAITING_INPUT;

            // Zoom and pan must be the same duration so the scene will begin seamlessly when both finish
            if (false) {
                camera.pan(this.currentRoom.x, this.currentRoom.y, 1000, 'Power2');
                camera.zoomTo(2.4, 1000, 'Linear', (camera, progress) => {
                    if (progress >= 1) {
                        this.state = GameState.AWAITING_INPUT;
                    }
                });
            }
        });

        this.beetle = new Beetle({
            scene: this,
            x: 512,
            y: 650,
            key: 'beetle',
            // beetleEvents.addListener("panToRoom", HANDLER_FUNCTION); handler function should take room number arg
            eventEmitter: this.beetleEvents,
        });
        this.add.existing(this.beetle);
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
            case GameState.ANIMATING:
                // Let the fade and animations complete
                break;
            case GameState.AWAITING_INPUT:
                this.beetle.update();
                break;
        }
    }

    private restartGame(): void {
        this.scene.start('MainMenu');
    }

    private moveToRoom(key: string) {

    }

}
