import { IHazard } from "./Hazard";
import { FubarObject, IFubarObject } from "./FubarObject";

export interface IRoom {
    key: string;
    position: { x: number, y: number },
    hazards: IHazard[];
    doors: ('left' | 'right' | 'center')[];
}

export interface RoomOptions extends IRoom {
    scene: Phaser.Scene;
    x: number,
    y: number;
}

export class Room extends FubarObject {
    private bg_key: string;
    private doors: ('left' | 'right' | 'center')[];
    private hazards: IHazard[];

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
    }

    update(): void {
    }
}
