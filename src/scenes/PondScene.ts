import Phaser from "phaser";

const POND_WIDTH = 1600;
const POND_HEIGHT = 1200;
const BOAT_SIZE = 32;
const BOAT_MAX_SPEED = 160;
const BOAT_ACCELERATION = 400;
const BOAT_DRAG = 300;

export class PondScene extends Phaser.Scene {
  private boat!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };

  constructor() {
    super("PondScene");
  }

  create(): void {
    this.physics.world.setBounds(0, 0, POND_WIDTH, POND_HEIGHT);
    this.cameras.main.setBounds(0, 0, POND_WIDTH, POND_HEIGHT);

    this.add
      .rectangle(0, 0, POND_WIDTH, POND_HEIGHT, 0x2f6690)
      .setOrigin(0, 0);

    const shoreThickness = 24;
    const shoreColor = 0xc9a876;
    this.add.rectangle(POND_WIDTH / 2, shoreThickness / 2, POND_WIDTH, shoreThickness, shoreColor);
    this.add.rectangle(POND_WIDTH / 2, POND_HEIGHT - shoreThickness / 2, POND_WIDTH, shoreThickness, shoreColor);
    this.add.rectangle(shoreThickness / 2, POND_HEIGHT / 2, shoreThickness, POND_HEIGHT, shoreColor);
    this.add.rectangle(POND_WIDTH - shoreThickness / 2, POND_HEIGHT / 2, shoreThickness, POND_HEIGHT, shoreColor);

    const boatTextureKey = "boat-placeholder";
    if (!this.textures.exists(boatTextureKey)) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x8b5a2b, 1);
      graphics.fillRect(0, 0, BOAT_SIZE, BOAT_SIZE);
      graphics.lineStyle(2, 0x5c3a1a, 1);
      graphics.strokeRect(0, 0, BOAT_SIZE, BOAT_SIZE);
      graphics.generateTexture(boatTextureKey, BOAT_SIZE, BOAT_SIZE);
      graphics.destroy();
    }

    this.boat = this.physics.add.sprite(POND_WIDTH / 2, POND_HEIGHT / 2, boatTextureKey);
    this.boat.setCollideWorldBounds(true);
    this.boat.setDamping(true);
    this.boat.setDrag(BOAT_DRAG);
    this.boat.setMaxVelocity(BOAT_MAX_SPEED);

    this.cameras.main.startFollow(this.boat, true, 0.08, 0.08);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as {
      [key: string]: Phaser.Input.Keyboard.Key;
    };
  }

  update(): void {
    const body = this.boat.body as Phaser.Physics.Arcade.Body;
    let ax = 0;
    let ay = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) ax -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) ax += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) ay -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) ay += 1;

    if (ax !== 0 || ay !== 0) {
      const length = Math.sqrt(ax * ax + ay * ay);
      body.setAcceleration((ax / length) * BOAT_ACCELERATION, (ay / length) * BOAT_ACCELERATION);
    } else {
      body.setAcceleration(0, 0);
    }
  }
}
