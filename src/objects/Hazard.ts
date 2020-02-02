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
    private originalScaleX: number;
    private originalScaleY: number;
    private activeKey: string;
    private activeSprite: Phaser.GameObjects.Sprite;
    public tool: string;
    public actionsUntilFixed: integer;

    // sound effects
    private antsThankYouSound: Phaser.Sound.BaseSound;
    private antsGreatJobSound: Phaser.Sound.BaseSound;
    private static playThankYou: boolean = true;

    constructor(params: IFubarObject, hazard: IHazard, room: Room) {
        super(params);

        this.key = params.key;

        // image
        this.setOrigin(0.5, 0.5);
        this.originalScaleX = hazard.display_ratio.width;
        this.originalScaleY = hazard.display_ratio.height;
        this.setScale(this.originalScaleX, this.originalScaleY);
        this.setX(hazard.position.x);
        this.setY(hazard.position.y);
        this.tool = hazard.tool;
        this.actionsUntilFixed = 5;

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

        // shrink this object down to zero and make it completely transparent. this will make for an awesome tween
        // later and ensure this object is completely covered by the "active sprite".
        this.setScale(0, 0);
        this.setAlpha(0);
    }

    public fix() {
        // shrink, spin, and fade out the "active sprite" covering this object. afterwards, destroy it.
        this.scene.add.tween({
            targets: this.activeSprite,
            scaleX: 0,
            scaleY: 0,
            angle: 180,
            alpha: 0,
            ease: 'Linear',
            duration: 200,
            onComplete: () => {
                this.activeSprite.destroy();
            }
        });

        // grow this object a little bit too big and fade it in.
        this.scene.add.tween({
            targets: this,
            scaleX: this.originalScaleX + 0.05,
            scaleY: this.originalScaleY + 0.05,
            alpha: 1,
            ease: 'Linear',
            duration: 200,
            onComplete: () => {
                // snap this object back to its correct scale
                this.scene.add.tween({
                    targets: this,
                    scaleX: this.originalScaleX,
                    scaleY: this.originalScaleY,
                    ease: 'Linear',
                    duration: 100
                });
            }
        });

        // play appropriate sound effect (alternating between thank you and great job)
        if (Hazard.playThankYou) {
            this.antsThankYouSound.play();
        } else {
            this.antsGreatJobSound.play();
        }
        Hazard.playThankYou = !Hazard.playThankYou;
    }
}
