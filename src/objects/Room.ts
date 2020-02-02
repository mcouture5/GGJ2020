import { IHazard, Hazard } from "./Hazard";
import { FubarObject, IFubarObject } from "./FubarObject";
import { IDoor, Door } from "./Door";
import { GameScene } from "../scenes/GameScene";

export interface IRoom {
    key: string;
    position: { x: number, y: number },
    hazards: IHazard[];
    doors: IDoor[];
}

export class Room extends Phaser.GameObjects.Container {
    // Contains all the children. Used for "collision" detections
    private children: FubarObject[];

    private doors: { [key: string]: Door };
    private hazards: { [key: string]: Hazard };
    private activeHazards: Hazard[];
    private ant: Phaser.GameObjects.Sprite;

    // sound effects
    private hammerSound: Phaser.Sound.BaseSound;
    private plungerSound: Phaser.Sound.BaseSound;
    private screwdriverSound: Phaser.Sound.BaseSound;
    private wrenchSound: Phaser.Sound.BaseSound;
    private rightToolSound: Phaser.Sound.BaseSound;
    private wrongToolSound: Phaser.Sound.BaseSound;

    constructor(scene: Phaser.Scene, x: number, y: number, room: IRoom) {

        // all rooms shall use this
        super(scene, x, y, []);
        this.children = [];
        this.activeHazards = [];

        this.doors = {};
        this.hazards = {};

        this.setSize(300, 200);

        // Create background image
        let bg = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'room_bg').setOrigin(0.5, 0.5).setScale(0.489, 0.392);
        this.add(bg);
        this.sendToBack(bg);

        // Create hazards in the room
        this.createHazards(room.hazards);

        // Create the doors
        this.createDoors(room.doors);

        // Random dancing ant
        let randAntIndex = Math.floor(Math.random() * 3) + 1;
        let randX = -100 + Math.floor(Math.random() * 200);
        this.ant = new Phaser.GameObjects.Sprite(this.scene, randX, 60, 'ant_' + randAntIndex);
        this.ant.setOrigin(0.5, 0.5);
        this.ant.setScale(0.5);

        // set up sound effects
        this.hammerSound = this.scene.sound.add('hammer', {volume: 0.2});
        this.plungerSound = this.scene.sound.add('plunger', {volume: 1});
        this.screwdriverSound = this.scene.sound.add('screwdriver', {volume: 0.4});
        this.wrenchSound = this.scene.sound.add('wrench', {volume: 0.6});
        this.rightToolSound = this.scene.sound.add('right-tool-2', {volume: 0.3});
        this.wrongToolSound = this.scene.sound.add('wrong-tool-1', {volume: 0.2});
    }

    update(): void {
    }

    getDoors() {
        return this.doors;
    }

    public loadHazards(hazards: string[]) {
        // Find each hazard and add a bad hazard
        for (let key in hazards) {
            let hazard = hazards[key];
            // Find it and make it active
            let thisHazard = this.hazards[hazard];
            thisHazard.activate();
            this.activeHazards.push(thisHazard);
        }
    }

    public checkInteraction(tool, x) {
        // Filter out hazards that are fixed here
        this.activeHazards = this.activeHazards.filter(hazard => {
            if (Math.abs(this.x + hazard.x - x) < 25) {
                if (hazard.tool === tool) {
                    this.rightToolSound.play();
                    hazard.actionsUntilFixed--;
                    if (hazard.actionsUntilFixed <= 0) {
                        // If this is going to be the last fix for this room, check with the game to see if this is the last room that needs fixin.
                        // If so, do more fancies with the hazard
                        let duration = 200;
                        let remaining = (this.scene as GameScene).roomsRemaining();
                        if (remaining === 1 && this.activeHazards.length === 1) {
                            duration = 1800;
                        }
                        hazard.fix(duration);
                        return false;
                    }
                }
                else {
                    hazard.actionsUntilFixed += 0.5;
                    this.wrongToolSound.play();
                }
            }
            return true;
        });
    }

    public allHazardsFixed(): boolean {
        return this.activeHazards.length === 0;
    }

    public danceParty() {
        this.add(this.ant);
        this.bringToTop(this.ant);
        this.dance();
    }

    private dance() {
        if (this.ant) {
            this.ant.setScale(this.ant.scaleX * -1, this.ant.scaleY);
            setTimeout(() => {
                this.dance();
            }, Math.floor(Math.random() * 800) + 800);
        }
    }

    private playToolSound(tool: string) {
        switch (tool) {
            case 'hammer': this.hammerSound.play(); break;
            case 'plunger': this.plungerSound.play(); break;
            case 'screwdriver': this.screwdriverSound.play(); break;
            case 'wrench': this.wrenchSound.play(); break;
            default: throw new Error('unexpected tool=' + tool);
        }
    }

    private createHazards(hazards: IHazard[]) {
        for (let hazard of hazards) {
            let hd = new Hazard({ scene: this.scene, x: 0, y: 0, key: hazard.key }, hazard, this);
            this.add(hd);
            this.children.push(hd);
            this.hazards[hazard.key] = hd;
        }
    }
    
    private createDoors(doors: IDoor[]) {
        for (let door of doors) {
            // Create a new position based on the door position
            let x = 0, y = (this.displayHeight / 4) - 20;
            switch (door.position) {
                case "left":
                    x = 0 - (this.displayWidth / 2) + 15;
                    break;
                case "center":
                    break;
                case "right":
                    x = (this.displayWidth / 2) - 15;
                    break;
            }
            let dr = new Door({ scene: this.scene, x: x, y: y, key: door.key }, door, this);
            this.add(dr);
            this.children.push(dr);
            this.doors[door.position] = dr;
        }
    }
    
}
