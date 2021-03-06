/**
 * Boot scene shows a loading bar while loading all assets.
 */
export class Boot extends Phaser.Scene {
    private loadingBar: Phaser.GameObjects.Graphics;
    private progressBar: Phaser.GameObjects.Graphics;
    private camera: Phaser.Cameras.Scene2D.Camera;

    constructor() {
        super({
            key: 'Boot'
        });
    }

    preload() {
        // Reference to the main camera
        this.camera = this.cameras.main;

        // set the background and create loading bar
        this.cameras.main.setBackgroundColor("#A8A8A8");
        this.createLoadingbar();

        // pass value to change the loading bar fill
        this.load.on('progress', (value) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0x684949, 1);
            this.progressBar.fillRect(
                this.camera.width / 4,
                this.camera.height / 2 - 16,
                (this.camera.width / 2) * value,
                16
            );
        });

        // delete bar graphics, when loading complete
        this.load.on('complete', () => {
            this.progressBar.destroy();
            this.loadingBar.destroy();
        });

        /**
         * pack is a JSON that contains details about other files that should be added into the Loader.
         * Place ALL files to load in there, separated by sections.
         */
        this.load.pack('preload', './assets/pack.json');

        //Load room data
        this.load.json('layout', './assets/layout.json');
        this.load.json('level_1', './assets/levels/level_1.json');
        this.load.json('level_2', './assets/levels/level_2.json');
        this.load.json('level_3', './assets/levels/level_3.json');
        this.load.json('level_4', './assets/levels/level_4.json');
        this.load.json('level_5', './assets/levels/level_5.json');
        this.load.json('level_6', './assets/levels/level_6.json');
        this.load.json('level_7', './assets/levels/level_7.json');
        this.load.json('level_8', './assets/levels/level_8.json');
        this.load.json('level_9', './assets/levels/level_9.json');
        this.load.json('level_10', './assets/levels/level_10.json');
        this.load.spritesheet('beetle', 'assets/images/beetle.png', {frameWidth: 245, frameHeight: 252});
    }

    update() {
        // Immediately start the main menu
        this.scene.start('MainMenu');
        // this.scene.start('LevelIntro');
        // this.scene.start('GameScene');
    }

    private createLoadingbar() {
        this.loadingBar = this.add.graphics();
        this.loadingBar.fillStyle(0x684949, 1);
        this.loadingBar.fillRect(
            this.camera.width / 4 - 2,
            this.camera.height / 2 - 18,
            this.camera.width / 2 + 4,
            20
        );
        this.progressBar = this.add.graphics();
    }
}
