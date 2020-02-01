import { Scene, Game } from 'phaser';
import { Room, IRoom } from '../objects/Room';
import { IFubarObject } from '../objects/FubarObject';
import { Beetle } from '../objects/Beetle';
import { HUDGroup } from '../groups/HUDGroup';

enum GameState {
    STARTING_LEVEL,
    GETTING_RECIPE,
    AWAITING_INPUT,
    ANIMATING,
    GAME_OVER
}

export interface ILevel {
    hazards: { [room: string]: string[] };
    time_limit: number;
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

    // Timer Event
    private timer: Phaser.Time.TimerEvent;

    // Keep references
    private camera: Phaser.Cameras.Scene2D.Camera;

    // Rooms
    private layout: IRoom[];
    private rooms: { [key: string]: Room };
    private currentRoom: Room;

    // Levels
    private level: ILevel;
    private currentLevel: number;

    private hud: HUDGroup;

    private beetleSprite;
    private beetle;

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
        this.level = null;
        this.currentLevel = 1;

        // References
        this.camera = this.cameras.main;
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

        // Listen for when the hero interacts with a door
        this.events.addListener('enterDoor', (doorString: string) => {
            const doorToEnter = this.currentRoom.getDoors().find(door => door.position === doorString);
            if (doorToEnter) {
                this.beetle.stop();
                // Stop all input!
                this.state = GameState.ANIMATING;
                // Move to next room
                const roomString = doorToEnter.target;
                const roomObj = this.rooms[roomString];
                this.beetle.moveToRoom({x: roomObj.x, y: roomObj.y});
                this.moveToRoom(roomString);
            }
        });

        // Listen for every time the camera is done fading
        this.camera.once('camerafadeincomplete', (camera) => {
            this.state = GameState.AWAITING_INPUT;

            // Load the first level
            this.loadLevel(1);
        });
        this.beetle = new Beetle({
            scene: this,
            x: 0,
            y: 0,
            key: 'beetle',
            eventEmitter: this.events,
            roomCoords: {x: this.rooms[FAMILY_ROOM].x, y: this.rooms[FAMILY_ROOM].y}
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
        // Dispatch an event indicating timer progress. Used by the HUD to indicate progress to the player.
        if (this.timer) {
            let timerProgress: number = this.timer.getProgress();
            dispatchEvent(new CustomEvent('timer_update', {
                detail: timerProgress
            }));
        }
    }

    private loadLevel(level: number) {
        this.level = this.cache.json.get('level_' + level);
        let rooms = this.level['hazards'];
        // Apply the level to each room
        for (let key in rooms) {
            let room = this.rooms[key];
            room.loadHazards(rooms[key])
        }
        if (true) {
            // Zoom and pan to begin
            setTimeout(() => {
                this.camera.zoomTo(2.7, 1000, 'Linear', true);
                // Begin in the living room
                this.moveToRoom(FAMILY_ROOM);
            }, 1000);
        }
        // Create timer event
        this.timer = this.time.addEvent({
            delay: this.level.time_limit,
            callback: this.setGameOver,
        });
        // Create the HUD
        this.hud = new HUDGroup(this.scene);
    }

    private runGame() {
        switch (this.state) {
            case GameState.STARTING_LEVEL:
            case GameState.ANIMATING:
                // Let the fade and animations complete
                break;
            case GameState.AWAITING_INPUT:
                this.beetle.update();
                this.currentRoom && this.currentRoom.update();
                this.checkRooms();
                break;
            case GameState.GAME_OVER:
                // TODO: Create this scene.
                this.scene.start('GameOver');
                break;
        }
    }

    private restartGame(): void {
        this.scene.start('MainMenu');
    }

    private moveToRoom(key: string) {
        this.currentRoom = this.rooms[key];
        this.camera.pan(this.currentRoom.x, this.currentRoom.y, 1000, 'Power2', true, (camera, progress) => {
            if (progress >= 1) {
                this.state = GameState.AWAITING_INPUT;
            }
        });
    }

    /**
     * Check the rooms for cleared hazards. If all clear, advance
     */
    private checkRooms() {
        let allClear = true;
        for (let key in this.rooms) {
            let room = this.rooms[key];
            if (!room.allHazardsFixed()) {
                allClear = false;
                break;
            }
        }
        if (allClear) {
            this.state = GameState.ANIMATING;
            this.currentLevel++;
            this.camera.pan(512, 384, 1000, 'Linear', true);
            this.camera.zoomTo(1, 1000, 'Linear', true, (camera, progress) => {
                if (progress >= 1) {
                    setTimeout(() => { this.loadLevel(this.currentLevel); }, 1000);
                }
            });
        }
    }

    private setGameOver() {
        this.state = GameState.GAME_OVER;
    }
}
