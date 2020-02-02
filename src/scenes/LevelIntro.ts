import { Foot } from '../objects/Foot';
import { IFubarObject, FubarObject } from '../objects/FubarObject';
import { IRoom, Room } from '../objects/Room';
import { Family } from '../objects/Family';
import { ILevel } from './GameScene';

enum GameState {
	EVERYTHING_IS_FINE,
	RUN_AWAY,
	END
}

export class LevelIntro extends Phaser.Scene {
    // variables
	private foot: Foot;
	private family: Family;
	private entrance: FubarObject;
    private rooms: { [key: string]: Room };
	private layout: IRoom;
	private state: GameState;
	private lastState: GameState;

	private footAnim: Phaser.Tweens.Tween;
	private antAnim: Phaser.Tweens.Tween;

    // Levels
    private level: ILevel;
	private currentLevel: number;

	// sound effects
	private stompSound: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: 'LevelIntro'
        });
    }

    init(config): void {
        this.state = GameState.EVERYTHING_IS_FINE;
		
        // Get the rooms layout
        this.layout = this.cache.json.get('layout');

        // Create new rooms using the layout config
		this.rooms = {};
		this.level = null;
		this.currentLevel = config['currentLevel'] || 1;
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
		
		// // Create and add the fam
		// let room = this.layout['intro_room'];
		// let roomContainer = new Room(this, 512, 384, room);
		// this.add.existing(roomContainer);
		
		let fubarParams: IFubarObject = {
			scene: this,
			x: 425,
			y: 265,
			frame: 0
		};
		this.family = new Family(fubarParams);
		this.add.existing(this.family);

		// this.add.sprite(0, 0, 'background').setOrigin(0, 0);

		fubarParams = {
			scene: this,
			x: 495,
			y: 133,
			frame: 0,
			key: 'entrance'
		}
		this.entrance = new FubarObject(fubarParams);
		this.entrance.scaleX = 0.517;
		this.entrance.scaleY = 0.517;
		// this.entrance.displayHeight = 237;
		// this.entrance.displayWidth = 444;
		this.add.existing(this.entrance);

		fubarParams = {
			scene: this,
			x: 900,
			y: -380,
			frame: 0
		};
		this.foot = new Foot(fubarParams);
		this.add.existing(this.foot);

		// set up sound effects
		this.stompSound = this.sound.add('stomp', {volume: 0.2});
	}

    update(): void {
		this.foot.update();
        this.runGame();
    }

    private runGame() {
        switch (this.state) {
			case GameState.EVERYTHING_IS_FINE:
				if(this.lastState !== GameState.EVERYTHING_IS_FINE) {
					this.animFoot();	
				}
				break;
			case GameState.RUN_AWAY:
				if(this.lastState !== GameState.RUN_AWAY) {	
					this.runAway();
				}
				break;
			case GameState.END:
				if(this.lastState !== GameState.END) {	
					this.bye();
				}
				break;
		}
		this.lastState = this.state
	}
	
	private animFoot() {
		this.footAnim = this.add.tween({
            targets: this.foot,
            duration: 1000,
			y: -100,
            onComplete: () => {
				// play stomp sound
				this.stompSound.play();

				//shake cam
				this.cameras.main.shake(1000,0.02,undefined, (cam, prog) => {
					if (prog === 1){
						// jump fam
						this.add.tween({
							targets: this.family,
							duration: 300,
							onComplete: () => {
								this.state = GameState.RUN_AWAY;
							},
							y: 250,
							yoyo: true
						});
					}
				});
				this.footAnim = this.add.tween({
					targets: this.foot,
					duration: 1000,
					y: -512
				})
				this.loadLevel(this.currentLevel);
			}
		});
	}

	private runAway() {
		this.antAnim = this.add.tween({
			targets: this.family,
			duration: 1000,
			y: 265,
			onComplete: () => {
				this.family.visible = false;
				this.antAnim = this.add.tween({
					targets: this.family,
					duration: 500,
					y: 20,
					onComplete: () => {
						this.family.visible = true;
						this.antAnim = this.add.tween({
							targets: this.family,
							duration: 500,
							x: 50,
							delay: 1000,
							onComplete: () => {
								this.family.visible = true;
								this.antAnim = this.add.tween({
									targets: this.family,
									duration: 500,
									x: 50,
									delay: 1000,
									onComplete: () => {
										this.state = GameState.END;
									},
								})
							},
						})
					},
				})
			}
		})
	}

	private bye() {
        this.cameras.main.fadeOut(2000, 255, 255, 255);
		this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            this.scene.start('GameScene', {currentLevel: this.currentLevel});
        });
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
}
