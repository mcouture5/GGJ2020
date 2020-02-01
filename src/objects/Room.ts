import { IHazard } from "./Hazard";
import { FubarObject, IFubarObject } from "./FubarObject";
import { HazardGroup } from "../groups/HazardGroup";

export interface IRoom {
    key: string;
    position: { x: number, y: number },
    hazards: IHazard[];
    doors: ('left' | 'right' | 'center')[];
}

export class Room extends FubarObject {
    private doors: ('left' | 'right' | 'center')[];
    private hazards: IHazard[];

    private hazardSprites: HazardGroup;

    constructor(params: IFubarObject, room: IRoom) {

        // all rooms shall use this
        params.key = 'room_bg';
        super(params);

        this.doors = room.doors;
        this.hazards = room.hazards;

        // image
        this.setOrigin(0, 0);
        this.displayWidth = 200;
        this.displayHeight = 150;

        // Create hazards in the room
        this.hazardSprites = new HazardGroup({ scene: this.scene, hazards: room.hazards });
    }

    update(): void {
    }
}
