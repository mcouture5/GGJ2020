import { IFubarObject } from "../objects/FubarObject";
import { Door, IDoor } from "../objects/Door";
import { IRoom, Room } from "../objects/Room";

export class HUDGroup extends Phaser.GameObjects.Group {

    constructor(params: { scene: Phaser.Scene }) {
        super(params.scene);
        this.createHUDElements(params.scene);
    }

    private createHUDElements(scene): void {

        // The frame for the timer bar
        var progressBox = new Phaser.GameObjects.Graphics(scene);
        progressBox.fillStyle(0x000000, 1);
        progressBox.fillRect(100, 50, 150, 15);
        progressBox.setScrollFactor(1);
        this.add(progressBox, true);

        // The timer bar
        var progressBar = new Phaser.GameObjects.Graphics(scene);
        progressBar.addListener('timer', function (e) {
            progressBar.clear();
            progressBar.fillStyle(0xF93208, 1);
            progressBar.fillRect(100, 50, 150 * e.detail, 15);
        });
        progressBar.setScrollFactor(1);
        this.add(progressBar, true);
    }
}