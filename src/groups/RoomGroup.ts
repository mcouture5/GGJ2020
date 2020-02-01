import { IRoom, Room } from "../objects/Room";
import { IFubarObject } from "../objects/FubarObject";

export class RoomGroup extends Phaser.GameObjects.Group {
    private rooms: Room[];

    constructor(params: {scene: Phaser.Scene, layout: IRoom[]}) {
        super(params.scene);
        this.createRooms(params.layout);
    }
    
    private createRooms(layout: IRoom[]) {
        for (let room_key in layout) {
            let room = layout[room_key];
            // Create a new position
            let fubarParams: IFubarObject = {
                scene: this.scene,
                x: room.position.x,
                y: room.position.y,
                key: room.key,
                frame: 0
            };
            let roomSprite = new Room(fubarParams, room);
            this.add(roomSprite, true);
            this.rooms.push(roomSprite);
        }
    }
}