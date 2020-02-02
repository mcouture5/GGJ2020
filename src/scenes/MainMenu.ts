/**
 * Main menu.
 */
export class MainMenu extends Phaser.Scene {
    private startKey: Phaser.Input.Keyboard.Key;
    private texts: Phaser.GameObjects.Text[] = [];
    private fading: boolean;
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
        this.startKey.isDown = false;
        this.fading = false;
    }

    create() {
        // Load background image
        let bg = this.add.sprite(0, 0, 'main-menu').setOrigin(0, 0);
        bg.displayWidth = 1024;
        bg.displayHeight = 768;

        // set up sound effects. don't pause on blur. start playing music.
        this.sound.pauseOnBlur = false;
        this.music = this.sound.add('riff', {loop: true, volume: 1});
        this.music.play();

        // Listen for when the camera is done fading after a selection has been chosen
        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            // stop playing music
            this.music.stop();

            this.scene.start('LevelIntro');
        });
    }

    update() {
        // If fadig is complete, listen for a key input and begin fading out
        if (!this.fading) {
            if (Phaser.Input.Keyboard.JustDown(this.startKey)) {
                let fadeOutDuration: number = 2000;
                this.cameras.main.fadeOut(fadeOutDuration, 255, 255, 255);
                this.fading = true;

                // fade out music
                this.add.tween({
                    targets: this.music,
                    volume: 0,
                    ease: 'Linear',
                    duration: fadeOutDuration
                });
            }
        }
    }
}
