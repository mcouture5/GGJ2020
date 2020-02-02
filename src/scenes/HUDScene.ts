export class HUDScene extends Phaser.Scene {
    private gameScene: Phaser.Scene;
    private test: Phaser.GameObjects.Text;
    private progressBox: Phaser.GameObjects.Graphics;
    private progressBar: Phaser.GameObjects.Graphics;

    constructor() {
        super({
            key: 'HUDScene', active: true
        });
    }

    create() {
        this.gameScene = this.scene.get('GameScene');
        this.gameScene.events.on('begin_level', () => { this.renderProgressBar(); });
        this.gameScene.events.on('end_level', () => { this.destroyProgressBar(); });
        this.gameScene.events.on('timer_update', (progress) => { this.updateProgressBar(progress); });
    }

    renderProgressBar() {
        this.destroyProgressBar();
        // Create the HUD
        this.progressBox = new Phaser.GameObjects.Graphics(this);
        this.progressBox.fillStyle(0x000000, 1);
        this.progressBox.fillRect(100, 50, 150, 15);
        this.progressBox.setScrollFactor(0);
        this.add.existing(this.progressBox);

        // The timer bar
        this.progressBar = new Phaser.GameObjects.Graphics(this);
        this.progressBar.setScrollFactor(0);
        this.add.existing(this.progressBar);
    }

    destroyProgressBar() {
        this.progressBox && this.progressBox.destroy();
        this.progressBar && this.progressBar.destroy();
    }

    private updateProgressBar(progress: number) {
        this.progressBar.clear();
        this.progressBar.fillStyle(0xF93208, 1);
        this.progressBar.fillRect(100, 50, 150 * progress, 15);
    }
}