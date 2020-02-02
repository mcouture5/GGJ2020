export class Beetle extends Phaser.GameObjects.Sprite {
    protected isWalking: boolean = false;
    protected walkAnim: Phaser.Tweens.Tween;

    protected leftKey: Phaser.Input.Keyboard.Key;
	protected rightKey: Phaser.Input.Keyboard.Key;
    protected enterDoorKey: Phaser.Input.Keyboard.Key;
    protected actionKey: Phaser.Input.Keyboard.Key;
    protected hammerKey: Phaser.Input.Keyboard.Key;
    protected plungerKey: Phaser.Input.Keyboard.Key;
    protected screwdriverKey: Phaser.Input.Keyboard.Key;
    protected wrenchKey: Phaser.Input.Keyboard.Key;

    protected beetleEvents: Phaser.Events.EventEmitter;
    protected moveSpeed: integer;
    protected toolEquipped: integer; // 0=none,1=hammer,2=plunger,3=screwdriver,4=wrench

    protected roomCoords;

    // sound effects
    protected doorSound: Phaser.Sound.BaseSound;

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
        params.scene.anims.create({
            key: 'hammer',
            frames: params.scene.anims.generateFrameNames('beetle', { start: 4, end: 4 }),
            frameRate: 8,
            repeat: -1,
        });
        params.scene.anims.create({
            key: 'use-hammer',
            frames: params.scene.anims.generateFrameNames('beetle', { start: 5, end: 6 }),
            frameRate: 8,
            repeat: 0,
        });
        params.scene.anims.create({
            key: 'plunger',
            frames: params.scene.anims.generateFrameNames('beetle', { start: 7, end: 7 }),
            frameRate: 8,
            repeat: -1,
        });
        params.scene.anims.create({
            key: 'use-plunger',
            frames: params.scene.anims.generateFrameNames('beetle', { start: 8, end: 9 }),
            frameRate: 8,
            repeat: 0,
        });
        params.scene.anims.create({
            key: 'screwdriver',
            frames: params.scene.anims.generateFrameNames('beetle', { start: 10, end: 10 }),
            frameRate: 8,
            repeat: -1,
        });
        params.scene.anims.create({
            key: 'use-screwdriver',
            frames: params.scene.anims.generateFrameNames('beetle', { start: 11, end: 12 }),
            frameRate: 8,
            repeat: 0,
        });
        params.scene.anims.create({
            key: 'wrench',
            frames: params.scene.anims.generateFrameNames('beetle', { start: 13, end: 13 }),
            frameRate: 8,
            repeat: -1,
        });
        params.scene.anims.create({
            key: 'use-wrench',
            frames: params.scene.anims.generateFrameNames('beetle', { start: 14, end: 15 }),
            frameRate: 8,
            repeat: 0,
        });
        this.toolEquipped = 0;
        this.anims.play('idle');

        // image
        this.setScale(0.25);
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
        this.hammerKey = params.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ONE
        );
        this.plungerKey = params.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.TWO
        );
        this.screwdriverKey = params.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.THREE
        );
        this.wrenchKey = params.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.FOUR
        );

        // set up sound effects
        this.doorSound = this.scene.sound.add('door', {volume: 0.25});
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
            if (this.toolEquipped === 1) {
                this.anims.play('use-hammer', false);
            }
            if (this.toolEquipped === 2) {
                this.anims.play('use-plunger', false);
            }
            if (this.toolEquipped === 3) {
                this.anims.play('use-screwdriver', false);
            }
            if (this.toolEquipped === 4) {
                this.anims.play('use-wrench', false);
            }
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

        // play door sound
        this.doorSound.play();
    }

    protected isOnLeft(): boolean {
        return this.x <= this.roomCoords.x + (this.displayWidth / 2) - 140;
    }

    protected isOnRight(): boolean {
        return this.x >= this.roomCoords.x + 140 - (this.displayWidth / 2);
    }

    public stop(): void {
        this.toolEquipped = 0;
        this.applyVelocity(0);
    }

    public hide() {
        this.setAlpha(0);
    }

    public show() {
        this.setAlpha(1);
    }

    protected applyVelocity(velocity): void {
        if (velocity !== 0) {
            this.anims.play('run', true);
            this.toolEquipped = 0;
        } else if (this.toolEquipped === 0) {
            this.anims.play('idle');
        }
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
        } else if (this.hammerKey.isDown) {
            this.toolEquipped = 1;
            this.anims.play('hammer', false);
        } else if (this.plungerKey.isDown) {
            this.toolEquipped = 2;
            this.anims.play('plunger', false);
        } else if (this.screwdriverKey.isDown) {
            this.toolEquipped = 3;
            this.anims.play('screwdriver', false);
        } else if (this.wrenchKey.isDown) {
            this.toolEquipped = 4;
            this.anims.play('wrench', false);
        }
        this.applyVelocity(velocity);
    }
}
