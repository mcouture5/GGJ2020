import { Scene } from "phaser";

export class ProgressBar extends Phaser.GameObjects.Container {
    private progressBox: Phaser.GameObjects.Sprite;
	private progressBar: Phaser.GameObjects.Graphics;
    private gameScene: Scene;
    
    constructor(scene: Phaser.Scene, x: number, y: number, gameScene: Phaser.Scene) {
		super(scene, x, y, []);
		this.setSize(150,15);
        
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
    }

    update(): void {
	}
	
	public reset(): void {
        this.updateProgressBar(0);
	}

    private updateProgressBar(progress: number) {
        this.progressBar.clear();
        this.progressBar.fillRect(0, 0, 380 * progress, 35);
        let red = Math.ceil(255 * progress);
        let green = 255 - Math.ceil(255 * progress);
        this.progressBar.fillStyle(parseInt(this.rgbToHex(red, green, 0)), 1);
    }

    private toHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
      
    private rgbToHex(r, g, b) {
        return "0x" + this.toHex(r) + this.toHex(g) + this.toHex(b);
    }
}