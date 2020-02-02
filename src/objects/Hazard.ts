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
    private hasTooltip: boolean;
    private tooltip: Phaser.GameObjects.Sprite;
    private actionsUntilFixedInternal: integer;

    // sound effects
    private antsThankYouSound: Phaser.Sound.BaseSound;
    private antsGreatJobSound: Phaser.Sound.BaseSound;
    private static playThankYou: boolean = true;

    private progressBox: Phaser.GameObjects.Sprite;
    private hazardProgressBar: Phaser.GameObjects.Sprite;
    private progressBarX: integer;
    private progressBarY: integer;
    private progressWidth: number;
    
    constructor(params: IFubarObject, hazard: IHazard, room: Room) {
        super(params);

        this.key = params.key;

        this.room = room;

        // image
        this.setOrigin(0.5, 0.5);
        this.originalScaleX = hazard.display_ratio.width;
        this.originalScaleY = hazard.display_ratio.height;
        this.setScale(this.originalScaleX, this.originalScaleY);
        this.setX(hazard.position.x);
        this.setY(hazard.position.y);
        this.tool = hazard.tool;

        this.progressBarX = this.room.x + hazard.position.x;
        this.progressBarY = this.room.y + hazard.position.y - this.displayHeight / 2;

        // The timer bar
        this.hazardProgressBar = new Phaser.GameObjects.Sprite(this.scene, this.progressBarX, this.progressBarY, 'hazardprogress');
        this.hazardProgressBar.setScale(0.3);
        this.hazardProgressBar.setOrigin(0, 0);
        this.hazardProgressBar.setDepth(1000);
        this.hazardProgressBar.setPosition(this.hazardProgressBar.x - (this.hazardProgressBar.displayWidth / 2), this.hazardProgressBar.y);
        this.progressWidth = this.hazardProgressBar.displayWidth;
        
        this.progressBox = new Phaser.GameObjects.Sprite(this.scene, this.progressBarX, this.progressBarY, 'hazard-meter');
        this.progressBox.setScale(0.3);
        this.progressBox.setOrigin(0, 0);
        this.progressBox.setDepth(1000);
        this.progressBox.setPosition(this.progressBox.x - (this.progressBox.displayWidth / 2), this.progressBox.y);
        
        this.actionsUntilFixed = 5;

        // Active key is the same name as the key with _active
        this.activeKey = params.key + '_active';

        this.hasTooltip = false;
        this.tooltip = null;

        // set up sound effects
        this.antsThankYouSound = this.scene.sound.add('ants-thank-you', {volume: 0.5});
        this.antsGreatJobSound = this.scene.sound.add('ants-great-job', {volume: 0.5});
    }

    update(): void {
    }

    public updateHazardProgressBar(progress: number) {
        this.hazardProgressBar.visible = true;
        this.progressBox.visible = true;
        this.hazardProgressBar.displayWidth = this.progressBox.displayWidth * Math.min(progress, 1);
        let red = Math.ceil(255 * progress);
        if (progress > 1) {
            red = Math.ceil(255 / progress); //make it darker if it's past the end
        }
        let green = Math.max(255 - Math.ceil(255 * progress), 0);
        console.log(red, green)
        let color = parseInt(this.rgbToHex(red, green, 0));
        console.log(this.rgbToHex(red, green, 0));
        this.hazardProgressBar.setTint(color, color, color, color);
    }

    private toHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
      
    private rgbToHex(r, g, b) {
        return "0x" + this.toHex(r) + this.toHex(g) + this.toHex(b);
    }

    public set actionsUntilFixed(newNum) {
        this.actionsUntilFixedInternal = newNum;
        this.updateHazardProgressBar(this.actionsUntilFixedInternal / 5);
    }

    public get actionsUntilFixed(): integer {
        return this.actionsUntilFixedInternal;
    }

    public activate(hasTooltip: boolean) {
        this.hasTooltip = hasTooltip;
        // Cover this object with the active key
        this.activeSprite = new Phaser.GameObjects.Sprite(this.scene, this.room.x + this.x, this.room.y + this.y, this.activeKey);
        this.activeSprite.setScale(0.3)
        this.scene.add.existing(this.activeSprite);

        // Add a little tween to show the active object
        setTimeout(() => {
            this.scene.add.tween({
                targets: [this.activeSprite],
                duration: 200,
                scaleX: 0.35,
                ease: 'Linear',
                scaleY: 0.35,
                onComplete: () => {
                    // snap this object back to its correct scale
                    this.scene.add.tween({
                        targets: [this.activeSprite],
                        scaleX: 0.3,
                        scaleY: 0.3,
                        ease: 'Linear',
                        duration: 200,
                        onComplete: () => {
                            this.scene.add.existing(this.hazardProgressBar);
                            this.scene.add.existing(this.progressBox);
                            this.progressBox.visible = false;
                            this.hazardProgressBar.visible = false;
                        }
                    });
                }
            });
        }, 900);


        // shrink this object down to zero and make it completely transparent. this will make for an awesome tween
        // later and ensure this object is completely covered by the "active sprite".
        this.setScale(0, 0);
        this.setAlpha(0);
    }

    public showTooltip() {
        // If the level says to show a tooltip, do it
        if (this.hasTooltip) {
            this.tooltip = new Phaser.GameObjects.Sprite(this.scene, this.room.x + this.x, (this.activeSprite.y - (this.activeSprite.displayHeight / 2) - 15), this.tool);
            this.tooltip.setScale(0.3, 0.3);
            this.scene.add.tween({
                targets: [this.tooltip],
                duration: 700,
                loop: -1,
                alpha: 0
            });
            this.scene.add.existing(this.tooltip);
        }
    }

    public fix(duration: number) {
        this.tooltip && this.tooltip.destroy();
        this.progressBox.destroy();
        this.hazardProgressBar.destroy();
        // shrink, spin, and fade out the "active sprite" covering this object. afterwards, destroy it.
        this.scene.add.tween({
            targets: this.activeSprite,
            scaleX: 0,
            scaleY: 0,
            angle: 180,
            alpha: 0,
            ease: 'Linear',
            duration: duration,
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
            duration: duration,
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
