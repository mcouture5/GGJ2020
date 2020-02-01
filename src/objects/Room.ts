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

let WIDTH = 300;
let HEIGHT = 200;

export class Room extends Phaser.GameObjects.Container {
    // Conatins all the children. Used for "collision" detections
    private children: FubarObject[];

    private doors: IDoor[];
    private hazards: IHazard[];

    constructor(scene: Phaser.Scene, x: number, y: number, room: IRoom) {

        // all rooms shall use this
        super(scene, x, y, []);

        this.doors = room.doors;
        this.hazards = room.hazards;
        this.children = [];

        // Create background image
        let bg = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'room_bg').setOrigin(0.5, 0.5).setScale(0.489, 0.392);
        this.add(bg);
        this.sendToBack(bg);

        // Create hazards in the room
        this.createHazards();

        // Create the doors
        this.createDoors();
    }

    private counter = 0;
    update(): void {
        // TODO remove: After a while, move to the next random room
        this.counter++;
        console.log(this.counter);
        if (this.counter >= 3000) {
            let rand = Math.floor(Math.random() * this.doors.length);
            this.counter = 0;
            this.scene.events.emit('moveToRoom', this.doors[rand]);
        }
    }

    getDoors() {
        return this.doors;
    }

    private createHazards() {
        for (let hazard of this.hazards) {
            let hd = new Hazard({ scene: this.scene, x: 0, y: 0, key: hazard.key }, hazard);
            this.add(hd);
            this.children.push(hd);
        }
    }
    
    private createDoors() {
        for (let door of this.doors) {
            // Create a new position based on the door position
            let x = 0, y = HEIGHT / 2;
            switch (door.position) {
                case "left":
                    x = 0 - (WIDTH / 2);
                    break;
                case "center":
                    break;
                case "right":
                    x = WIDTH / 2;
                    break;
            }
            let dr = new Door({ scene: this.scene, x: x, y: y, key: door.key }, door);
            this.add(dr);
            this.children.push(dr);
        }
    }
    
}
