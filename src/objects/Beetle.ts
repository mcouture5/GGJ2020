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

    protected moveSpeed: integer;
    protected toolEquipped: integer; // 0=none,1=hammer,2=plunger,3=screwdriver,4=wrench
    protected holdingUpTool: integer; // 0 means not holding up, n means n setTimeouts are waiting to put the tool back down
    protected overrideHolding: boolean; // override holding up tool because we moved (don't want to mess with async timeout counter)

    protected roomCoords;

    // sound effects
    private hammerSound: Phaser.Sound.BaseSound;
    private plungerSound: Phaser.Sound.BaseSound;
    private screwdriverSound: Phaser.Sound.BaseSound;
    private wrenchSound: Phaser.Sound.BaseSound;

    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);
        this.initializeToRoom(params.roomCoords);

        this.toolEquipped = 0;
        this.holdingUpTool = 0;
        this.overrideHolding = false;
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
        this.hammerSound = this.scene.sound.add('hammer', {volume: 1.5});
        this.plungerSound = this.scene.sound.add('plunger', {volume: 2});
        this.screwdriverSound = this.scene.sound.add('screwdriver', {volume: 1.5});
        this.wrenchSound = this.scene.sound.add('wrench', {volume: 1.5});
    }
	
    update(): void {
        if (this.canEnterLeftDoor() && Phaser.Input.Keyboard.JustDown(this.enterDoorKey)) {
            this.scene.events.emit("enterDoor", "left");
        } else if (this.canEnterRightDoor() && Phaser.Input.Keyboard.JustDown(this.enterDoorKey)) {
            this.scene.events.emit("enterDoor", "right");
        } else if (Math.abs(this.x - this.roomCoords.x) < 25 && Phaser.Input.Keyboard.JustDown(this.enterDoorKey)) {
            this.scene.events.emit("enterDoor", "center");
        } else if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
            if (this.toolEquipped === 1) {
                this.pickTool('hammer');
                this.anims.play('use-hammer', false);
                this.scene.events.emit("action", "hammer", this.x);
                this.hammerSound.play();
            }
            if (this.toolEquipped === 2) {
                this.pickTool('plunger');
                this.anims.play('use-plunger', false);
                this.scene.events.emit("action", "plunger", this.x);
                this.plungerSound.play();
            }
            if (this.toolEquipped === 3) {
                this.pickTool('screwdriver');
                this.anims.play('use-screwdriver', false);
                this.scene.events.emit("action", "screwdriver", this.x);
                this.screwdriverSound.play();
            }
            if (this.toolEquipped === 4) {
                this.pickTool('wrench');
                this.anims.play('use-wrench', false);
                this.scene.events.emit("action", "wrench", this.x);
                this.wrenchSound.play();
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
        this.y = this.roomCoords.y + 95;
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
        this.y = this.roomCoords.y + 95;
    }

    protected isOnLeft(): boolean {
        return this.x <= this.roomCoords.x + (this.displayWidth / 2) - 140;
    }

    protected isOnRight(): boolean {
        return this.x >= this.roomCoords.x + 140 - (this.displayWidth / 2);
    }

    public stop(): void {
        setTimeout(() => this.holdingUpTool = 0, 1000); // to avoid race conditions
        this.overrideHolding = true;
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
            this.overrideHolding = true;
        } else if (this.holdingUpTool <= 0 || this.overrideHolding) {
            this.anims.play('idle', true);
        }
        this.body.setVelocityX(velocity);
    }

    protected pickTool(tool): void {
        this.anims.play(tool, false);
        this.holdingUpTool++;
        this.overrideHolding = false;
        this.scene.events.emit("pick_tool", tool);
        setTimeout(() => {
            this.holdingUpTool--;
        }, 1000);
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
        if (this.hammerKey.isDown) {
            this.toolEquipped = 1;
            this.pickTool('hammer');
        } else if (this.plungerKey.isDown) {
            this.toolEquipped = 2;
            this.pickTool('plunger');
        } else if (this.screwdriverKey.isDown) {
            this.toolEquipped = 3;
            this.pickTool('screwdriver');
        } else if (this.wrenchKey.isDown) {
            this.toolEquipped = 4;
            this.pickTool('wrench');
        }
        this.applyVelocity(velocity);
    }
}
