import { Scene } from "phaser";

export class ToolIcon extends Phaser.GameObjects.Container {
    private icon: Phaser.GameObjects.Sprite;
	private gameScene: Scene;
	private tool: string;
	private selected: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, gameScene: Phaser.Scene, tool: string) {
		super(scene, x, y, []);
		
        this.icon = new Phaser.GameObjects.Sprite(scene, 0, 0, tool);
		this.add(this.icon);
		this.setSelected(false);
    }

    update(): void {
	}

	setSelected(selected): void {
		this.selected = selected;
		if (selected) {
			this.icon.setTint(0xFFFFFF);
		} else {
			this.icon.setTint(0x000000);
		}
	}
}