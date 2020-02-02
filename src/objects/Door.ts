import { IFubarObject, FubarObject } from "./FubarObject";
import { Room } from "./Room";

export interface IDoor {
    key: string;
    position: 'left' | 'right' | 'center';
    target: string;
}

export class Door extends FubarObject {
    public target: string;
    private position: 'left' | 'right' | 'center';
    public key: string;
    private openSprite: Phaser.GameObjects.Sprite;
    private room: Room;
    // sound effects
    protected doorSound: Phaser.Sound.BaseSound;

    constructor(params: IFubarObject, door: IDoor, room: Room) {
        super(params);
        this.key = params.key;
        this.position = door.position;
        this.room = room;
        this.target = door.target;

        // image
        this.setOrigin(0.5, 0.5);
        this.setScale(0.3, 0.3);

        this.doorSound = this.scene.sound.add('door', {volume: 0.25});
    }

    update(): void {
    }

    open() {
        // Create the open door depending on the side
        let openKey = 'door_open';
        switch (this.position) {
            case "left":
                openKey = 'door';
                break;
            case "right":
                openKey = 'door';
                break;
        }
        // Offset for side doors
        let offset = 0;
        switch (this.position) {
            case "left":
                offset = 25;
                break;
            case "right":
                offset = -25;
                break;
        }
        this.openSprite = new Phaser.GameObjects.Sprite(this.scene, this.room.x + this.x + offset, this.room.y + this.y, openKey);
        this.openSprite.setScale(0.3)
        this.scene.add.existing(this.openSprite);

        // play door sound
        this.doorSound.play();

        // Quick timeout then close the door
        setTimeout(() => {
            this.openSprite.destroy();
        }, 100);
    }
}
