import { IHazard, Hazard } from "./Hazard";
import { FubarObject, IFubarObject } from "./FubarObject";
import { IDoor, Door } from "./Door";
import { DoorGroup } from "../groups/DoorGroup";

export interface IRoom {
    key: string;
    position: { x: number, y: number },
    hazards: IHazard[];
    doors: IDoor[];
}

export class Room extends Phaser.GameObjects.Container {
    // Contains all the children. Used for "collision" detections
    private children: FubarObject[];

    private doors: IDoor[];
    private hazards: { [key: string]: Hazard };
    private activeHazards: Hazard[];

    constructor(scene: Phaser.Scene, x: number, y: number, room: IRoom) {

        // all rooms shall use this
        super(scene, x, y, []);
        this.children = [];
        this.activeHazards = [];

        this.doors = room.doors;
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
    }

    private counter = 0;
    update(): void {
        // TODO remove: After a while, move to the next random room
        /*
        this.counter++;
        if (this.counter >= 100) {
            let rand = Math.floor(Math.random() * this.doors.length);
            this.counter = 0;
            this.activeHazards = [];
            this.scene.events.emit('moveToRoom', this.doors[rand].target);
        }
        */
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

    public allHazardsFixed(): boolean {
        return this.activeHazards.length === 0;
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
            let x = 0, y = this.displayHeight / 2;
            switch (door.position) {
                case "left":
                    x = 0 - (this.displayWidth / 2);
                    break;
                case "center":
                    break;
                case "right":
                    x = this.displayWidth / 2;
                    break;
            }
            let dr = new Door({ scene: this.scene, x: x, y: y, key: door.key }, door);
            this.add(dr);
            this.children.push(dr);
        }
    }
    
}
