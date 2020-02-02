import { ProgressBar } from "../hud/ProgressBar";
import { ToolBar } from "../hud/ToolBar";

export class HUDScene extends Phaser.Scene {
    private gameScene: Phaser.Scene;
    private test: Phaser.GameObjects.Text;
    private progressBar: ProgressBar;
    private levelText: Phaser.GameObjects.Text;
    private textAnim: Phaser.Tweens.Tween;

    private toolBar: ToolBar;

    constructor() {
        super({
            key: 'HUDScene', active: true
        });
    }

    preload() {
        this.load.pack('preload', './assets/pack.json');
    }

    create() {
        this.gameScene = this.scene.get('GameScene');
        this.gameScene.events.on('begin_level', (currentLevel) => { this.handleBeginLevel(currentLevel) });
        this.gameScene.events.on('load_level', (currentLevel) => { this.handleLoadLevel(currentLevel) });
        this.gameScene.events.on('end_level', () => { this.handleEndLevel(); });

        // progress
        this.progressBar = new ProgressBar(this, 10, 50, this.gameScene);
        this.add.existing(this.progressBar);

        // level text
        this.levelText = this.add.text(10, 10, `Level: ${this.gameScene['currentLevel']}`);
        this.levelText.setColor('#000000');

        // toolbar
        this.toolBar = new ToolBar(this, 325, 700, this.gameScene);
        this.add.existing(this.toolBar);

        this.levelText.visible = false;
        this.progressBar.visible = false;
        this.toolBar.visible = false;
    }

    handleBeginLevel(currentLevel) {
        this.progressBar.reset();
        this.progressBar.visible = true;
        this.toolBar.visible = true;
        this.levelText.setText(`Level: ${this.gameScene['currentLevel']}`);
    }

    handleEndLevel() {
        this.progressBar.visible = false;
        this.levelText.visible = false;
        this.toolBar.visible = false;
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