import { Scene, Game } from 'phaser';
import { Room, IRoom } from '../objects/Room';
import { IFubarObject } from '../objects/FubarObject';
import { Beetle } from '../objects/Beetle';

enum GameState {
    STARTING_LEVEL,
    GETTING_RECIPE,
    AWAITING_INPUT,
    AWAITING_MENU_INPUT,
    AWAITING_GAME_OVER_INPUT,
    ANIMATING,
    GAME_OVER
}

export interface ILevel {
    hazards: { [room: string]: string[] };
    time_limit: number;
    tooltips: string[];
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
    private fixedRoomCount;

    // Levels
    private level: ILevel;
    private currentLevel: number;

    private beetleSprite;
    private beetle: Beetle;

    private invoice: Phaser.GameObjects.Sprite;
    private paid: Phaser.GameObjects.Sprite;
    private menuKey: Phaser.Input.Keyboard.Key;

    // sound effects
    private music: Phaser.Sound.BaseSound;
    private levelCompleteSound: Phaser.Sound.BaseSound;
    private gameOverSound: Phaser.Sound.BaseSound;

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
        this.gameStarted = false;
        // Get the rooms layout
        this.layout = this.cache.json.get('layout');

        // Create new rooms using the layout config
        this.beetle = null;
        this.rooms = {};
        this.currentRoom = null;
        this.level = null;
        this.currentLevel = config['currentLevel'] || 1;
        this.fixedRoomCount = 0;

        // References
        this.camera = this.cameras.main;
        
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('beetle', { start: 0, end: 1 }),
            frameRate: 3,
            repeat: -1,
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNames('beetle', { start: 2, end: 3 }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: 'hammer',
            frames: this.anims.generateFrameNames('beetle', { start: 4, end: 4 }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: 'use-hammer',
            frames: this.anims.generateFrameNames('beetle', { start: 5, end: 6 }),
            frameRate: 8,
            repeat: 0,
        });
        this.anims.create({
            key: 'plunger',
            frames: this.anims.generateFrameNames('beetle', { start: 7, end: 7 }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: 'use-plunger',
            frames: this.anims.generateFrameNames('beetle', { start: 8, end: 9 }),
            frameRate: 8,
            repeat: 0,
        });
        this.anims.create({
            key: 'screwdriver',
            frames: this.anims.generateFrameNames('beetle', { start: 10, end: 10 }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: 'use-screwdriver',
            frames: this.anims.generateFrameNames('beetle', { start: 11, end: 12 }),
            frameRate: 8,
            repeat: 0,
        });
        this.anims.create({
            key: 'wrench',
            frames: this.anims.generateFrameNames('beetle', { start: 13, end: 13 }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: 'use-wrench',
            frames: this.anims.generateFrameNames('beetle', { start: 14, end: 15 }),
            frameRate: 8,
            repeat: 0,
        });

        this.menuKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
    }

    create(): void {
        // Create the background and main scene
        let bg = this.add.sprite(0, 0, 'game_bg').setOrigin(0, 0);
        bg.displayWidth = 1024;
        bg.displayHeight = 768;

        // Get the HUD
        this.hudScene = this.scene.get('HUDScene');
        this.scene.setVisible(true, 'HUDScene');

        // Create and add the rooms
        for (let room_key in this.layout) {
            let room = this.layout[room_key];
            let roomContainer = new Room(this, room.position.x, room.position.y, room);
            this.add.existing(roomContainer);
            this.rooms[room_key] = roomContainer;
        }

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
            roomCoords: {x: this.rooms[FAMILY_ROOM].x, y: this.rooms[FAMILY_ROOM].y}
        });
        this.add.existing(this.beetle);
        
        this.loadLevel(this.currentLevel);

        // set up sound effects. don't pause on blur. start playing music at 0 volume. will fade in shortly.
        this.sound.pauseOnBlur = false;
        this.music = this.sound.add('beetle-beetle-song', {loop: true, volume: 0});
        this.music.play();
        this.levelCompleteSound = this.sound.add('level-complete', {volume: 1});
        this.gameOverSound = this.sound.add('game-over', {volume: 1});

        this.events.emit('pick_tool', undefined);
    }

    update(): void {
        // Very first update, begin a fade in (camera & music)
        if (this.fading) {
            let fadeInDuration: number = 1300;
            this.cameras.main.fadeIn(fadeInDuration, 255, 255, 255);
            this.fading = false;
            this.add.tween({
                targets: this.music,
                volume: 0.2,
                ease: 'Linear',
                duration: fadeInDuration
            });
        }
        this.runGame();
    }

    private loadLevel(level: number) {
        let brokenRoomCount = 0;
        this.level = this.cache.json.get('level_' + level);
        let rooms = this.level.hazards;
        let tooltips = this.level.tooltips;
        this.events.emit('load_level', this.currentLevel);
        // Apply the level to each room
        for (let key in rooms) {
            let room = this.rooms[key];
            room.loadHazards(rooms[key], tooltips)
            brokenRoomCount++;
        }
        this.fixedRoomCount = 6 - brokenRoomCount;
    }

    private startCurrentLevel() {
        // Zoom and pan to begin
        setTimeout(() => {
            this.camera.zoomTo(2.7, 800, 'Linear', true);
            // Begin in the living room
            this.currentRoom = this.rooms[FAMILY_ROOM];
            this.camera.pan(this.currentRoom.x, this.currentRoom.y, 800, 'Power2', true, (camera, progress) => {
                if (progress >= 1) {
                    this.events.emit('begin_level', this.currentLevel);
                    
                    // Listen for when the hero interacts with a door
                    (this.events.off as any)('enterDoor');
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
                    (this.events.off as any)('action');
                    this.events.addListener('action', (tool, x) => {
                        this.currentRoom.checkInteraction(tool, x);
                    });

                    // Tell the rooms the game has started
                    for (let key in this.rooms) {
                        this.rooms[key].gameStart();
                    }

                    // Create timer event
                    this.timer = this.time.addEvent({
                        delay: this.level.time_limit,
                        callback: () => { this.setGameOver(); }
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
            case GameState.AWAITING_MENU_INPUT:
                if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
                    this.currentLevel++;
                    this.scene.start('LevelIntro', {currentLevel: this.currentLevel});
                }
                break;
            case GameState.AWAITING_GAME_OVER_INPUT:
                if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
                    this.scene.restart({currentLevel: this.currentLevel});
                }
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
        let fixedRooms = 0;
        for (let key in this.rooms) {
            let room = this.rooms[key];
            let roomFixed = room.allHazardsFixed();
            if (roomFixed) {
                fixedRooms++;
            }
        }
        if (fixedRooms === 6) {
            this.levelComplete();
        }
        this.fixedRoomCount = fixedRooms;
    }

    public roomsRemaining() {
        return 6 - this.fixedRoomCount;
    }

    private levelComplete() {
        this.timer.destroy();
        (this.events.off as any)('enterDoor');
        (this.events.off as any)('action');
        this.gameStarted = false;
        this.beetle.stop();
        this.state = GameState.ANIMATING;
        this.events.emit('end_level');
        // Zoom closer into the current room for that last fix effect
        this.camera.zoomTo(3.2, 1800, 'Linear', true, (camera, progress) => {
            if (progress >= 1) {
                // Now quickly zoom back out to normal and wait a few before finishing
                setTimeout(() => {
                    this.camera.zoomTo(2.7, 400, 'Linear', true, (camera, progress) => {
                        if (progress >= 1) {
                            // Finish the scene
                            setTimeout(() => { 
                                this.beetle.destroy();
                                this.camera.pan(512, 384, 800, 'Linear', true);
                                this.camera.zoomTo(1, 800, 'Linear', true, (camera, progress) => {
                                    if (progress >= 1) {
                                        setTimeout(() => { this.showInvoice(); }, 0);
                                    }
                                });
                            }, 800);
                        }
                    });
                }, 0);
            }
        });

        // fade out music
        this.add.tween({
            targets: this.music,
            volume: 0,
            ease: 'Linear',
            duration: 2000,
            onComplete: () => {
                this.music.stop();
            }
        });
    }

    private showInvoice() {
        // Start the dance party
        for (let key in this.rooms) {
            let room = this.rooms[key];
            room.danceParty();
        }
        this.invoice = new Phaser.GameObjects.Sprite(this, 70, 30, 'invoice');
        this.invoice.setOrigin(0.5, 0.5);
        this.invoice.setScale(0);
        this.add.existing(this.invoice);
        this.add.tween({
            targets: [this.invoice],
            duration: 500,
            scaleX: 0.5,
            scaleY: 0.5,
            x: 512,
            y: 384,
            angle: 720,
            ease: 'Linear',
            onComplete: () => {
                // play level complete sound
                this.levelCompleteSound.play();
                this.paid = new Phaser.GameObjects.Sprite(this, 512, 384, 'paid');
                this.paid.setOrigin(0.5, 0.5);
                this.paid.setAlpha(0);
                this.paid.setScale(0.2);
                this.add.existing(this.paid);
                this.add.tween({
                    targets: [this.paid],
                    delay: 1000,
                    duration: 1000,
                    alpha: 0.7,
                    ease: 'Linear',
                    onComplete: () => {
                        let text = this.add.text(512, 560, 'Press Space', {
                            fontFamily: 'Digital',
                            fontSize: 30,
                            color: '#000'
                        }).setOrigin(0.5, 0.5);
                        this.add.tween({
                            targets: [text],
                            duration: 1200,
                            loop: -1,
                            alpha: 0
                        });
                        this.state = GameState.AWAITING_MENU_INPUT;
                    }
                });
            }
        });
    }

    private setGameOver() {
        // abruptly stop music
        this.music.stop();
        // play game over sound
        this.gameOverSound.play();

        (this.events.off as any)('enterDoor');
        (this.events.off as any)('action');
        this.scene.setVisible(false, 'HUDScene');
        this.gameStarted = false;
        this.state = GameState.ANIMATING;
        this.beetle.destroy();
        // Overlay
        let overlay = new Phaser.GameObjects.Graphics(this);
        this.add.existing(overlay);
        overlay.clear();
        overlay.fillStyle(0xFFFFFF, 1);
        overlay.fillRect(0, 0, 1024, 768);
        overlay.setAlpha(0);
        overlay.setDepth(99999);
        this.add.tween({
            targets: [overlay],
            duration: 4000,
            alpha: 1
        });

        let texts = ['F', 'i', 'x', 'U', 'p', ' ', 'B', 'e', 'e', 't', 'l', 'e', ':', ' ', 'A', 'l', 'w', 'a', 'y', 's', ' ', 'R', 'e', 'p', 'a', 'i', 'r', 'i', 'n', 'g'];
        let x = 60;
        let textObjs = [], toBreak = [], toMove = [];
        for (let text of texts) {
            let textojb = this.add.text(x, 0, text, {
                fontFamily: 'OneNine',
                fontSize: 42,
                color: '#000'
            }).setOrigin(0.5, 0.5).setScale(1.2);
            textojb.setDepth(overlay.depth + 1);
            textObjs.push(textojb);
            if (text !== ' ' && text === text.toLowerCase()) {
                toBreak.push(textojb);
            }
            if (text !== ' ' && text !== ':' && text === text.toUpperCase()) {
                toMove.push(textojb);
            }
            x += 30;
        }
        this.camera.pan(512, 384, 600, 'Linear', true);
        this.camera.zoomTo(1, 600, 'Linear', true);
        this.add.tween({
            targets: textObjs,
            y: 384,
            duration: 800,
            onComplete: () => {
                setTimeout(() => {
                    let delay = 100;
                    // Break
                    for (let text of toBreak) {
                        this.add.tween({
                            targets: [text],
                            duration: Math.random() * 2000,
                            delay: delay,
                            y: 2000
                        });
                        delay += 100;
                    }
                    // Move together
                    let f = toMove[0];
                    let u = toMove[1];
                    let b = toMove[2];
                    let a = toMove[3];
                    let r = toMove[4];
                    this.add.tween({
                        targets: [f],
                        duration: 400,
                        delay: 400,
                        x: 440,
                        onComplete: () => {
                            this.add.tween({
                                targets: [u],
                                duration: 400,
                                x: 480,
                                onComplete: () => {
                                    this.add.tween({
                                        targets: [b],
                                        duration: 400,
                                        x: 520,
                                        onComplete: () => {
                                            this.add.tween({
                                                targets: [a],
                                                duration: 400,
                                                x: 560,
                                                onComplete: () => {
                                                    this.add.tween({
                                                        targets: [r],
                                                        duration: 400,
                                                        x: 600,
                                                        onComplete: () => {
                                                            this.add.tween({
                                                                targets: toMove,
                                                                duration: 800,
                                                                scaleX: 1.6,
                                                                scaleY: 1.6
                                                            });
                                                            let text = this.add.text(512, 560, 'Press Space', {
                                                                fontFamily: 'Digital',
                                                                fontSize: 30,
                                                                color: '#000',
                                                            }).setOrigin(0.5, 0.5);
                                                            text.setDepth(overlay.depth + 1);
                                                            this.add.tween({
                                                                targets: [text],
                                                                duration: 1200,
                                                                loop: -1,
                                                                alpha: 0
                                                            });
                                                            this.state = GameState.AWAITING_GAME_OVER_INPUT;
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }, 700);
            }
        });
    }
}
