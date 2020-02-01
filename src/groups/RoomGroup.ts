import { IRoom, Room } from "../objects/Room";
import { IFubarObject } from "../objects/FubarObject";

export class RoomGroup extends Phaser.GameObjects.Group {
    private rooms: { [key: string]: Room };

    constructor(params: {scene: Phaser.Scene, layout: IRoom[]}) {
        super(params.scene);
        this.rooms = {};
        this.createRooms(params.layout);
    }
    
    public getRoom(key: string): Room {
        return this.rooms[key];
    }

    private createRooms(layout: IRoom[]) {
        for (let room_key in layout) {
            let room = layout[room_key];
            let roomSprite = new Room(this.scene, room.position.x, room.position.y, room);
            this.scene.add.existing(roomSprite);
            //this.add(roomSprite, true);
            this.rooms[room_key] = roomSprite;
        }
    }
}