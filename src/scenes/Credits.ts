/**
 * Main menu.
 */
export class Credits extends Phaser.Scene {
    private startKey: Phaser.Input.Keyboard.Key;
    private texts: Phaser.GameObjects.Text[] = [];
    private fading: boolean;

    constructor() {
        super({
            key: 'Credits'
        });
    }

    init() {
        this.startKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
    }

    create() {
        // Load background image
        let bg = this.add.sprite(0, 0, 'credits').setOrigin(0, 0);
        bg.displayWidth = 1024;
        bg.displayHeight = 768;

        // Start text (or others)
        this.texts.push(
            this.add.text(300,720,
                'Press Space to return to the menu',
                {
                    fontFamily: 'Digital',
                    fontSize: 30,
                    color: '#000'
                }
            )
        );
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.startKey)) {
            this.scene.start('MainMenu');
        }
    }
}
