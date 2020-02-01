import { IFubarObject } from "../objects/FubarObject";
import { Door, IDoor } from "../objects/Door";
import { IRoom, Room } from "../objects/Room";

export class DoorGroup extends Phaser.GameObjects.Group {
    private doors: Door[];

    constructor(params: {scene: Phaser.Scene, room: Room}) {
        super(params.scene);
        this.doors = [];
        this.createRooms(params.room);
    }
    
    private createRooms(room: Room) {
        let doors = room.getDoors();
        for (let door of doors) {
            // Create a new position based on the door position
            let x = 0, y = 100;
            switch (door.position) {
                case "left":
                    break;
                case "center":
                    x = room.displayWidth / 2;
                    break;
                case "right":
                    x = room.displayWidth - 20;
                    break;
            }
            let fubarParams: IFubarObject = {
                scene: this.scene,
                x: x,
                y: y,
                key: door.key,
                frame: 0
            };
            let doorSprite = new Door(fubarParams, door);
            this.add(doorSprite, true);
            this.doors.push(doorSprite);
        }
    }
}