import { Scene } from "phaser";

export class ProgressBar extends Phaser.GameObjects.Container {
    private progressBox: Phaser.GameObjects.Sprite;
	private progressBar: Phaser.GameObjects.Graphics;
    private gameScene: Scene;
    
    private red: number;
    private green: number;

    // sound effects
    private antsDispleased1: Phaser.Sound.BaseSound;
    private antsDispleased2: Phaser.Sound.BaseSound;
    private antsDispleased3: Phaser.Sound.BaseSound;
    private antsDispleasedLevel: number;

    constructor(scene: Phaser.Scene, x: number, y: number, gameScene: Phaser.Scene) {
		super(scene, x, y, []);
		this.setSize(150,15);
        
        this.red = 0;
        this.green = 255;

        // The timer bar
        this.progressBar = new Phaser.GameObjects.Graphics(scene);
        this.progressBar.setY(10);
        this.progressBar.setX(5);
        this.progressBar.setScrollFactor(0);
        this.add(this.progressBar);
        
        this.progressBox = new Phaser.GameObjects.Sprite(scene, 200, 5, 'meter');
        this.progressBox.setScrollFactor(0);
        this.add(this.progressBox);
		
		this.gameScene = gameScene;
        this.gameScene.events.on('timer_update', (progress) => { this.updateProgressBar(progress); });

        // set up sound effects
        this.antsDispleased1 = this.scene.sound.add('ants-displeased-1', {volume: 0.5});
        this.antsDispleased2 = this.scene.sound.add('ants-displeased-2', {volume: 0.5});
        this.antsDispleased3 = this.scene.sound.add('ants-displeased-3', {volume: 0.5});
        this.antsDispleasedLevel = 0;
    }

    update(): void {
	}
	
	public reset(): void {
        this.updateProgressBar(0);
	}

    private updateProgressBar(progress: number) {
        this.progressBar.clear();
        this.progressBar.fillRect(0, 0, 380 * progress, 35);
        this.red = Math.ceil(255 * progress);
        this.green = 255 - Math.ceil(255 * progress);
        this.progressBar.fillStyle(parseInt(this.rgbToHex(this.red, this.green, 0)), 1);

        // play appropriate ants displeased sound if needed
        switch (this.antsDispleasedLevel) {
            case 0:
                if (progress >= .75) {
                    this.antsDispleasedLevel++;
                    this.antsDispleased1.play();
                }
                break;
            case 1:
                if (progress >= .8) {
                    this.antsDispleasedLevel++;
                    this.antsDispleased2.play();
                }
                break;
            case 2:
                if (progress >= .9) {
                    this.antsDispleasedLevel++;
                    this.antsDispleased3.play();
                }
                break;
            case 3:
                break; // do nothing
            default:
                throw new Error("unexpected antDispleasedLevel=" + this.antsDispleasedLevel)
        }
    }

    private toHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
      
    private rgbToHex(r, g, b) {
        return "0x" + this.toHex(r) + this.toHex(g) + this.toHex(b);
    }
}