import { Scene, Game } from 'phaser';
import { Room, IRoom } from '../objects/Room';
import { IFubarObject } from '../objects/FubarObject';
import { Beetle } from '../objects/Beetle';

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
    private gameStarted: boolean;

    private hudScene: Phaser.Scene;
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

    private beetleSprite;
    private beetle: Beetle;

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    init(config): void {
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
        this.currentLevel = config['currentLevel'] || 1;

        // References
        this.camera = this.cameras.main;
    }

    create(): void {


        // Create the background and main scene
        let bg = this.add.sprite(0, 0, 'game_bg').setOrigin(0, 0);
        bg.displayWidth = 1024;
        bg.displayHeight = 768;

        // Get the HUD
        this.hudScene = this.scene.get('HUDScene');

        // Create and add the rooms
        for (let room_key in this.layout) {
            let room = this.layout[room_key];
            let roomContainer = new Room(this, room.position.x, room.position.y, room);
            this.add.existing(roomContainer);
            this.rooms[room_key] = roomContainer;
        }

        // Listen for when the hero interacts with a door
        this.events.addListener('enterDoor', (doorString: string) => {
            const doorToEnter = this.currentRoom.getDoors()[doorString];
            if (doorToEnter) {
                this.beetle.stop();
                // Stop all input!
                this.state = GameState.ANIMATING;
                // Open the door
                doorToEnter.open();
                // Move to next room, after a slight delay to see the door close
                this.beetle.hide();
                setTimeout(() => {
                    const roomString = doorToEnter.target;
                    const roomObj = this.rooms[roomString];
                    this.beetle.moveToRoom({x: roomObj.x, y: roomObj.y});
                    this.beetle.show();
                    this.moveToRoom(roomString);
                }, 250);
            }
        });

        // Listen for when the hero interacts with a hazard
        this.events.addListener('action', () => {
            this.currentRoom.checkInteraction();
        });

        // Listen for every time the camera is done fading
        this.camera.once('camerafadeincomplete', (camera) => {
            // Load the first level
            this.startCurrentLevel();
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
        
        this.loadLevel(1);

        // start playing music
        let music = this.sound.add('beetle-beetle-song', {loop: true, volume: 0.05});
        music.play();
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

    private loadLevel(level: number) {
        this.level = this.cache.json.get('level_' + level);
        let rooms = this.level['hazards'];
        // Apply the level to each room
        for (let key in rooms) {
            let room = this.rooms[key];
            room.loadHazards(rooms[key])
        }
    }

    private startCurrentLevel() {
        // Create timer event
        this.timer = this.time.addEvent({
            delay: this.level.time_limit,
            callback: this.setGameOver,
        });

        // Zoom and pan to begin
        setTimeout(() => {
            this.camera.zoomTo(2.7, 800, 'Linear', true);
            // Begin in the living room
            this.currentRoom = this.rooms[FAMILY_ROOM];
            this.camera.pan(this.currentRoom.x, this.currentRoom.y, 800, 'Power2', true, (camera, progress) => {
                if (progress >= 1) {
                    this.events.emit('begin_level');
                    // Create timer event
                    this.timer = this.time.addEvent({
                        delay: this.level.time_limit,
                        callback: this.setGameOver,
                    });
                    this.state = GameState.AWAITING_INPUT;
                    this.gameStarted = true;
                }
            });
        }, 1000);
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

        // Dispatch an event indicating timer progress. Used by the HUD to indicate progress to the player.
        if (this.timer && this.gameStarted) {
            let timerProgress: number = this.timer.getProgress();
            this.events.emit('timer_update', timerProgress);
        }
    }

    private restartGame(): void {
        this.scene.start('MainMenu');
    }

    private moveToRoom(key: string) {
        this.currentRoom = this.rooms[key];
        this.camera.pan(this.currentRoom.x, this.currentRoom.y, 400, 'Linear', true, (camera, progress) => {
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
            this.levelComplete();
        }
    }

    private levelComplete() {
        this.gameStarted = false;
        this.beetle.stop();
        this.state = GameState.ANIMATING;
        this.events.emit('end_level');
        this.currentLevel++;
        this.camera.pan(512, 384, 800, 'Linear', true);
        this.camera.zoomTo(1, 800, 'Linear', true, (camera, progress) => {
            if (progress >= 1) {
                this.scene.start('LevelIntro', {currentLevel: this.currentLevel});``
            }
        });
    }

    private setGameOver() {
        this.gameStarted = false;
        this.state = GameState.GAME_OVER;
    }
}
