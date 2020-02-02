/**
 * Main menu.
 */
export class MainMenu extends Phaser.Scene {
    private startKey: Phaser.Input.Keyboard.Key;
    private leftKey: Phaser.Input.Keyboard.Key;
    private rightKey: Phaser.Input.Keyboard.Key;
    private texts: Phaser.GameObjects.Text[] = [];
    private fading: boolean;
    private selected: integer;
    private selectedButton: Phaser.GameObjects.Sprite;

    // sound effects
    private music: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: 'MainMenu'
        });
    }

    init() {
        this.startKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.leftKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT
        );
        this.rightKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT
        );
        this.startKey.isDown = false;
        this.fading = false;
        this.selected = 1;
    }

    create() {
        // Load background image
        let bg = this.add.sprite(0, 0, 'main-menu').setOrigin(0, 0);
        bg.displayWidth = 1024;
        bg.displayHeight = 768;

        // set up sound effects. don't pause on blur. start playing music.
        this.sound.pauseOnBlur = false;
        if (!this.music) {
            this.music = this.sound.add('riff', {loop: true, volume: 0.2});
            this.music.play();
        }

        this.selectedButton = this.add.sprite(420, 570, 'selected-menu-option').setOrigin(0, 0);

        // Start text (or others)
        this.texts.push(
            this.add.text(300,700,
                'Press Space to select an option',
                {
                    fontFamily: 'Digital',
                    fontSize: 30,
                    color: '#000'
                }
            )
        );

        // Listen for when the camera is done fading after a selection has been chosen
        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            this.scene.start('GameScene');
        });
    }

    update() {
        // If fadig is complete, listen for a key input and begin fading out
        if (!this.fading) {
            if (Phaser.Input.Keyboard.JustDown(this.startKey)) {
                if (this.selected === 0) {
                    this.scene.start('Credits');
                } else if (this.selected === 1) {
                    let fadeOutDuration: number = this.selected === 1 ? 1300 : 0;
                    this.cameras.main.fadeOut(fadeOutDuration, 130, 130, 130);
                    this.fading = true;
                    // fade out music
                    this.add.tween({
                        targets: this.music,
                        volume: 0,
                        ease: 'Linear',
                        duration: fadeOutDuration,
                        onComplete: () => {
                            this.music.stop();
                        }
                    });
                } else {
                    this.scene.start('Credits');
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.leftKey)) {
                this.selected = Math.max(0, this.selected - 1);
            }
            if (Phaser.Input.Keyboard.JustDown(this.rightKey)) {
                this.selected = Math.min(2, this.selected + 1);
            }
            this.selectedButton.x = 158 + 237 * this.selected;
        }
    }
}
