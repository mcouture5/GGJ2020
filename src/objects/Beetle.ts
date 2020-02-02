export class Beetle extends Phaser.GameObjects.Sprite {
    protected isWalking: boolean = false;
    protected walkAnim: Phaser.Tweens.Tween;

    protected leftKey: Phaser.Input.Keyboard.Key;
	protected rightKey: Phaser.Input.Keyboard.Key;
    protected enterDoorKey: Phaser.Input.Keyboard.Key;
    protected actionKey: Phaser.Input.Keyboard.Key;

    protected beetleEvents: Phaser.Events.EventEmitter;
    protected moveSpeed: integer;

    protected roomCoords;

    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);
        this.beetleEvents = params.eventEmitter;
        this.initializeToRoom(params.roomCoords);

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
        this.setDepth(800);
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
        this.actionKey = params.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
    }
	
    update(): void {
        if (this.canEnterLeftDoor() && Phaser.Input.Keyboard.JustDown(this.enterDoorKey)) {
            this.beetleEvents.emit("enterDoor", "left");
        } else if (this.canEnterRightDoor() && Phaser.Input.Keyboard.JustDown(this.enterDoorKey)) {
            this.beetleEvents.emit("enterDoor", "right");
        } else if (Math.abs(this.x - this.roomCoords.x) < 25 && Phaser.Input.Keyboard.JustDown(this.enterDoorKey)) {
            this.beetleEvents.emit("enterDoor", "center");
        } else if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
            this.beetleEvents.emit("action");
        }
        else {
            this.handleMove();
        }
	}

    protected canEnterLeftDoor(): boolean {
        return this.isOnLeft() && !this.flipX;
    }

    protected canEnterRightDoor(): boolean {
        return this.isOnRight() && this.flipX;
    }

    // like moveToRoom but starts at the center always
    public initializeToRoom(coords): void {
        this.roomCoords = coords;
        this.x = this.roomCoords.x;
        this.y = this.roomCoords.y + 100;
    }

    public moveToRoom(newCoords): void {
        const wasOnLeft = this.isOnLeft();
        const wasOnRight = this.isOnRight();
        this.roomCoords = newCoords;
        if (wasOnLeft) {
            this.x = this.roomCoords.x + 140 - (this.displayWidth / 2);
        } else if (wasOnRight) {
            this.x = this.roomCoords.x + (this.displayWidth / 2) - 140;
        }
        this.y = this.roomCoords.y + 100;
    }

    protected isOnLeft(): boolean {
        return this.x <= this.roomCoords.x + (this.displayWidth / 2) - 140;
    }

    protected isOnRight(): boolean {
        return this.x >= this.roomCoords.x + 140 - (this.displayWidth / 2);
    }

    public stop(): void {
        this.applyVelocity(0);
    }

    protected applyVelocity(velocity): void {
        this.anims.play(velocity === 0 ? 'idle' : 'run', true);
        this.body.setVelocityX(velocity);
    }

    protected handleMove(): void {
        let velocity = 0;
        if (this.leftKey.isDown) {
            if (!this.isOnLeft()) {
                velocity = -this.moveSpeed;
            }
            this.flipX = false;
        } else if (this.rightKey.isDown) {
            if (!this.isOnRight()) {
                velocity = this.moveSpeed;
            }
            this.flipX = true;
        }
        this.applyVelocity(velocity);
    }
}
