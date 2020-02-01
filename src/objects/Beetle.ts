export class Beetle extends Phaser.GameObjects.Sprite {
    protected isWalking: boolean = false;
	protected isEnteringElevator: boolean = false;
    protected walkAnim: Phaser.Tweens.Tween;

    protected leftKey: Phaser.Input.Keyboard.Key;
	protected rightKey: Phaser.Input.Keyboard.Key;
	protected enterDoorKey: Phaser.Input.Keyboard.Key;

    protected beetleEvents: Phaser.Events.EventEmitter;

    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);
        this.beetleEvents = params.eventEmitter;

        params.scene.anims.create({
            key: 'idle',
            frames: params.scene.anims.generateFrameNames('beetle', { start: 0, end: 1 }),
            frameRate: 3,
            repeat: -1,
        });
        params.scene.anims.create({
            key: 'run',
            frames: params.scene.anims.generateFrameNames('beetle', { start: 2, end: 3 }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.play('idle');

        // image
        this.setScale(1);
        this.setOrigin(0.5, 1);

        // physics
        params.scene.physics.world.enable(this);
		this.body.allowGravity = false;
		this.body.collideWorldBounds = true;

        this.leftKey = params.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT
        );
        this.rightKey = params.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT
        );
        this.enterDoorKey = params.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.UP
        );
    }
	
    update(): void {
        this.handleMove();
	}

    protected handleMove(): void {
        let velocity = 0;
        const moveSpeed = 500
        if (this.leftKey.isDown && !this.isEnteringElevator) {
            velocity = -moveSpeed;
            this.flipX = false;
        } else if (this.rightKey.isDown && !this.isEnteringElevator) {
            velocity = moveSpeed;
            this.flipX = true;
        } else if (Phaser.Input.Keyboard.JustDown(this.enterDoorKey)) {
            this.isEnteringElevator = true;
            this.beetleEvents.emit("panToRoom", 1/* dynamically determine appropriate room */);
        }
        this.anims.play(velocity === 0 ? 'idle' : 'run', true);
        this.body.setVelocityX(velocity);
    }
}
