import { Scene } from "phaser";
import { ToolIcon } from "./ToolIcon";

export class ToolBar extends Phaser.GameObjects.Container {
    private toolIcons: ToolIcon[] = [];
    private tools = ['hammer', 'driver', 'plunger', 'wrench'];
    private gameScene: Scene;
    private selectedTool: ToolIcon;

    constructor(scene: Phaser.Scene, x: number, y: number, gameScene: Phaser.Scene) {
        super(scene, x, y, []);
        this.gameScene = gameScene;

        let iconx = 0;
        for (let tool of this.tools) {
            let toolIcon = new ToolIcon(this.scene, iconx, 0, this.gameScene, tool);
            this.toolIcons.push(toolIcon);
            this.add(toolIcon);
            iconx += 115;
        }
        this.selectTool(0);

        this.gameScene.events.on('timer_update', (toolIndex) => { this.selectTool(toolIndex); });
    }

    update(): void {
    }
    
    selectTool(toolIndex): void {
        if (this.selectedTool) {
            this.selectedTool.setSelected(false);
        }
        this.selectedTool = this.toolIcons[toolIndex];
        this.selectedTool.setSelected(true);
    }
}