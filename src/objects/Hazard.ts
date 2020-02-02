import { IFubarObject, FubarObject } from "./FubarObject";
import { Room } from "./Room";

export interface IHazard {
    key: string;
    position: { x: number, y: number };
    display_ratio: { width: number, height: number };
    tool: string;
}

export class Hazard extends FubarObject {
    public key: string;
    private room: Room;
    private activeKey: string;
    private activeSprite: Phaser.GameObjects.Sprite;

    // sound effects
    private antsThankYouSound: Phaser.Sound.BaseSound;
    private antsGreatJobSound: Phaser.Sound.BaseSound;
    private static playThankYou: boolean = true;

    constructor(params: IFubarObject, hazard: IHazard, room: Room) {
        super(params);

        this.key = params.key;

        // image
        this.setOrigin(0.5, 0.5);
        this.setScale(hazard.display_ratio.width, hazard.display_ratio.height);
        this.setX(hazard.position.x);
        this.setY(hazard.position.y);

        // Active key is the same name as the key with _active
        this.activeKey = params.key + '_active';

        this.room = room;

        // set up sound effects
        this.antsThankYouSound = this.scene.sound.add('ants-thank-you', {volume: 0.5});
        this.antsGreatJobSound = this.scene.sound.add('ants-great-job', {volume: 0.5});
    }

    update(): void {
    }

    public activate() {
        // Cover this obkect with the active key
        this.activeSprite = new Phaser.GameObjects.Sprite(this.scene, this.room.x + this.x, this.room.y + this.y, this.activeKey);
        this.activeSprite.setScale(0.3)
        this.scene.add.existing(this.activeSprite);
    }

    public fix() {
        this.activeSprite.destroy();

        // play appropriate sound effect (alternating between thank you and great job)
        if (Hazard.playThankYou) {
            this.antsThankYouSound.play();
        } else {
            this.antsGreatJobSound.play();
        }
        Hazard.playThankYou = !Hazard.playThankYou;
    }
}
