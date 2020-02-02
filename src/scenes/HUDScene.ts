import { ProgressBar } from "../objects/ProgressBar";

export class HUDScene extends Phaser.Scene {
    private gameScene: Phaser.Scene;
    private test: Phaser.GameObjects.Text;
    private progressBar: ProgressBar;

    constructor() {
        super({
            key: 'HUDScene', active: true
        });
    }

    create() {
        this.gameScene = this.scene.get('GameScene');
        this.progressBar = new ProgressBar(this, 100, 50, this.gameScene);
        this.add.existing(this.progressBar);
        this.gameScene.events.on('begin_level', () => { this.renderProgressBar(); });
        this.gameScene.events.on('end_level', () => { this.destroyProgressBar(); });
    }

    renderProgressBar() {
        this.progressBar.reset();
        this.progressBar.visible = true;
    }

    destroyProgressBar() {
        this.progressBar.visible = false;
    }

}