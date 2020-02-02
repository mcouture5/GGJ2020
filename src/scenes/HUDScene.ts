import { ProgressBar } from "../hud/ProgressBar";

export class HUDScene extends Phaser.Scene {
    private gameScene: Phaser.Scene;
    private test: Phaser.GameObjects.Text;
    private progressBar: ProgressBar;
    private levelText: Phaser.GameObjects.Text;
    private textAnim: Phaser.Tweens.Tween;

    constructor() {
        super({
            key: 'HUDScene', active: true
        });
    }

    create() {
        this.gameScene = this.scene.get('GameScene');
        this.progressBar = new ProgressBar(this, 100, 50, this.gameScene);
        this.add.existing(this.progressBar);
        this.gameScene.events.on('begin_level', (currentLevel) => { this.handleBeginLevel(currentLevel) });
        this.gameScene.events.on('load_level', (currentLevel) => { this.handleLoadLevel(currentLevel) });
        this.gameScene.events.on('end_level', () => { this.handleEndLevel(); });
        this.levelText = this.add.text(10, 10, `Level: ${this.gameScene['currentLevel']}`);
        this.levelText.setColor('#000000');
        this.levelText.visible = false;
        this.progressBar.visible = false;
    }

    handleBeginLevel(currentLevel) {
        this.progressBar.reset();
        this.progressBar.visible = true;
        this.levelText.setText(`Level: ${this.gameScene['currentLevel']}`);
    }

    handleEndLevel() {
        this.progressBar.visible = false;
        this.levelText.visible = false;
    }

    handleLoadLevel(currentLevel) {
        this.levelText.visible = true;
        this.levelText.setText(`Level: ${this.gameScene['currentLevel']}`);
        this.levelText.x = 256;
        this.levelText.y = 192;
        this.levelText.scaleX = this.levelText.scaleY = 10;
        this.textAnim = this.add.tween({
            targets: this.levelText,
            duration: 1000,
            y: 10,
            x: 10,
            scaleX: 1,
            scaleY: 1
        })
    }
}