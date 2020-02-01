import { IHazard } from "./Hazard";
import { FubarObject, IFubarObject } from "./FubarObject";
import { HazardGroup } from "../groups/HazardGroup";
import { IDoor } from "./Door";
import { DoorGroup } from "../groups/DoorGroup";

export interface IRoom {
    key: string;
    position: { x: number, y: number },
    hazards: IHazard[];
    doors: IDoor[];
}

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

        // Create background image
        this.add(new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'room_bg').setOrigin(0.5, 0.5).setScale(0.5, 0.5));

        // Create hazards in the room
        //this.hazardGroup = new HazardGroup({ scene: this.scene, hazards: room.hazards });

        // Create the doors
        //this.createDoors();
    }

    update(): void {
    }

    getDoors() {
        return this.doors;
    }
    
}
