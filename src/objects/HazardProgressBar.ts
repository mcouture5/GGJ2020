import { Scene } from "phaser";

export class HazardProgressBar extends Phaser.GameObjects.Container {
    private progressBox: Phaser.GameObjects.Sprite;
	private progressBar: Phaser.GameObjects.Graphics;
    
    private red: number;
    private green: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, []);
		this.setSize(150,15);
        
        this.red = 0;
        this.green = 255;

        // The timer bar
        this.progressBar = new Phaser.GameObjects.Graphics(scene);
        this.add(this.progressBar);
        
        this.progressBox = new Phaser.GameObjects.Sprite(scene, 200, 5, 'meter');
        this.progressBox.setScrollFactor(0);
        this.add(this.progressBox);
        console.log('hi')
    }

    update(): void {
	}
	
	public reset(): void {
        this.updateProgressBar(0);
	}

    public updateProgressBar(progress: number) {
        console.log('bye')
        this.progressBar.clear();
        this.progressBar.fillRect(0, 0, 50 * Math.min(progress, 1), 10);
        this.red = Math.ceil(255 * progress);
        if (progress > 1) {
            this.red /= 2 * progress; //make it darker if it's past the end
        }
        this.green = 255 - Math.ceil(255 * progress);
        this.progressBar.fillStyle(parseInt(this.rgbToHex(this.red, this.green, 0)), 1);
    }

    private toHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
      
    private rgbToHex(r, g, b) {
        return "0x" + this.toHex(r) + this.toHex(g) + this.toHex(b);
    }
}