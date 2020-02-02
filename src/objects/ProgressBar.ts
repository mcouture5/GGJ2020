import { FubarObject, IFubarObject } from "./FubarObject";
import { Scene } from "phaser";

export class ProgressBar extends Phaser.GameObjects.Container {
    private progressBox: Phaser.GameObjects.Graphics;
	private progressBar: Phaser.GameObjects.Graphics;
	private gameScene: Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, gameScene: Phaser.Scene) {
		super(scene, x, y, []);
		this.setSize(150,15);
		
        this.progressBox = new Phaser.GameObjects.Graphics(scene);
        this.progressBox.fillStyle(0x000000, 1);
        this.progressBox.fillRect(0, 0, 150, 15);
        this.progressBox.setScrollFactor(0);
        this.add(this.progressBox);

        // The timer bar
        this.progressBar = new Phaser.GameObjects.Graphics(scene);
        this.progressBar.setScrollFactor(0);
		this.add(this.progressBar);
		
		this.gameScene = gameScene;
        this.gameScene.events.on('timer_update', (progress) => { this.updateProgressBar(progress); });
    }

    update(): void {
	}
	
	reset(): void {
        this.updateProgressBar(0);
	}

    private updateProgressBar(progress: number) {
        this.progressBar.clear();
        this.progressBar.fillStyle(0xF93208, 1);
        this.progressBar.fillRect(100, 50, 150 * progress, 15);
    }
}