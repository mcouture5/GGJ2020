export class Beetle extends Phaser.GameObjects.Sprite {
    protected isWalking: boolean = false;
    protected walkAnim: Phaser.Tweens.Tween;

    protected leftKey: Phaser.Input.Keyboard.Key;
	protected rightKey: Phaser.Input.Keyboard.Key;
	protected enterDoorKey: Phaser.Input.Keyboard.Key;

    protected beetleEvents: Phaser.Events.EventEmitter;
    protected moveSpeed: integer;

    public roomCoords;

    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);
        this.beetleEvents = params.eventEmitter;
        this.roomCoords = params.roomCoords;

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
        this.setScale(0.4);
        this.setOrigin(0.5, 1);
        this.moveSpeed = 200;

        // physics
        params.scene.physics.world.enable(this);
		this.body.allowGravity = false;
		this.body.collideWorldBounds = false;

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
        if (this.isOnLeft() && Phaser.Input.Keyboard.JustDown(this.enterDoorKey)) {
            this.beetleEvents.emit("enterDoor", "left");
        } else if (this.isOnRight() && Phaser.Input.Keyboard.JustDown(this.enterDoorKey)) {
            this.beetleEvents.emit("enterDoor", "right");
        } else if (Math.abs(this.body.x - this.roomCoords.x) < 25 && Phaser.Input.Keyboard.JustDown(this.enterDoorKey)) {
            this.beetleEvents.emit("enterDoor", "right");
        } else {
            this.handleMove();
        }
	}

    protected isOnLeft(): boolean {
        return this.x <= this.roomCoords.x + (this.displayWidth / 2) - 140;
    }

    protected isOnRight(): boolean {
        return this.x >= this.roomCoords.x + 140 - (this.displayWidth / 2);
    }

    protected handleMove(): void {
        let velocity = 0;
        if (this.leftKey.isDown && !this.isOnLeft()) {
            velocity = -this.moveSpeed;
            this.flipX = false;
        } else if (this.rightKey.isDown && !this.isOnRight()) {
            velocity = this.moveSpeed;
            this.flipX = true;
        }
        this.anims.play(velocity === 0 ? 'idle' : 'run', true);
        this.body.setVelocityX(velocity);
    }
}
