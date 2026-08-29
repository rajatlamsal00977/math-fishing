import Phaser from "phaser";
import { Fish } from "../objects/Fish";

const POND_WIDTH = 1600;
const POND_HEIGHT = 1200;
const BOAT_SIZE = 32;
const BOAT_MAX_SPEED = 160;
const BOAT_ACCELERATION = 400;
const BOAT_DRAG = 300;
const SHORE_THICKNESS = 24;
const FISH_PATROL_PADDING = 60;
const CAST_RANGE = 100;
const CAST_MIN_BITE_MS = 1000;
const CAST_MAX_BITE_MS = 3000;
const CAST_TIMEOUT_MS = 5000;

// Placeholder colors/sizes standing in for real species art (Phase 2.1).
// Larger radius + brighter color loosely hints at higher difficulty.
const FISH_PLACEHOLDER_CONFIGS = [
  { color: 0xa8d98a, radius: 10, speed: 20 },
  { color: 0x6fc0c0, radius: 12, speed: 22 },
  { color: 0xe0a75e, radius: 14, speed: 26 },
  { color: 0xb07fd0, radius: 15, speed: 24 },
  { color: 0xd06060, radius: 18, speed: 30 },
];

export class PondScene extends Phaser.Scene {
  private boat!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private fish: Fish[] = [];
  private statusText!: Phaser.GameObjects.Text;

  private isCasting = false;
  private castLine?: Phaser.GameObjects.Graphics;
  private bobber?: Phaser.GameObjects.Arc;
  private biteTimer?: Phaser.Time.TimerEvent;
  private timeoutTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("PondScene");
  }

  create(): void {
    this.physics.world.setBounds(0, 0, POND_WIDTH, POND_HEIGHT);
    this.cameras.main.setBounds(0, 0, POND_WIDTH, POND_HEIGHT);

    this.add
      .rectangle(0, 0, POND_WIDTH, POND_HEIGHT, 0x2f6690)
      .setOrigin(0, 0);

    const shoreColor = 0xc9a876;
    this.add.rectangle(POND_WIDTH / 2, SHORE_THICKNESS / 2, POND_WIDTH, SHORE_THICKNESS, shoreColor);
    this.add.rectangle(POND_WIDTH / 2, POND_HEIGHT - SHORE_THICKNESS / 2, POND_WIDTH, SHORE_THICKNESS, shoreColor);
    this.add.rectangle(SHORE_THICKNESS / 2, POND_HEIGHT / 2, SHORE_THICKNESS, POND_HEIGHT, shoreColor);
    this.add.rectangle(POND_WIDTH - SHORE_THICKNESS / 2, POND_HEIGHT / 2, SHORE_THICKNESS, POND_HEIGHT, shoreColor);

    const patrolBounds = new Phaser.Geom.Rectangle(
      SHORE_THICKNESS + FISH_PATROL_PADDING,
      SHORE_THICKNESS + FISH_PATROL_PADDING,
      POND_WIDTH - 2 * (SHORE_THICKNESS + FISH_PATROL_PADDING),
      POND_HEIGHT - 2 * (SHORE_THICKNESS + FISH_PATROL_PADDING),
    );
    this.fish = FISH_PLACEHOLDER_CONFIGS.map((config) => {
      const x = Phaser.Math.Between(patrolBounds.x, patrolBounds.x + patrolBounds.width);
      const y = Phaser.Math.Between(patrolBounds.y, patrolBounds.y + patrolBounds.height);
      return new Fish(this, x, y, { ...config, bounds: patrolBounds });
    });

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
    this.boat.setDrag(BOAT_DRAG);
    this.boat.setMaxVelocity(BOAT_MAX_SPEED);
    this.boat.setDepth(1);

    this.cameras.main.startFollow(this.boat, true, 0.08, 0.08);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as {
      [key: string]: Phaser.Input.Keyboard.Key;
    };
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.statusText = this.add
      .text(this.scale.width / 2, 24, "", {
        fontFamily: "Georgia, serif",
        fontSize: "18px",
        color: "#f4e9d8",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(10);
  }

  update(time: number, delta: number): void {
    const body = this.boat.body as Phaser.Physics.Arcade.Body;

    if (this.isCasting) {
      body.setAcceleration(0, 0);
    } else {
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

      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.startCast();
      }
    }

    for (const fish of this.fish) {
      fish.update(time, delta);
    }
  }

  private startCast(): void {
    this.isCasting = true;

    const bobberX = this.boat.x;
    const bobberY = this.boat.y + 28;

    this.castLine = this.add.graphics().setDepth(2);
    this.castLine.lineStyle(2, 0xf4e9d8, 0.8);
    this.castLine.lineBetween(this.boat.x, this.boat.y, bobberX, bobberY);

    this.bobber = this.add.circle(bobberX, bobberY, 5, 0xf4e9d8).setDepth(2);

    const nearbyFish = this.fish.find(
      (f) => Phaser.Math.Distance.Between(bobberX, bobberY, f.x, f.y) <= CAST_RANGE,
    );

    this.statusText.setText("Casting...");

    if (nearbyFish) {
      const biteDelay = Phaser.Math.Between(CAST_MIN_BITE_MS, CAST_MAX_BITE_MS);
      this.biteTimer = this.time.delayedCall(biteDelay, () => this.onBite());
    }

    this.timeoutTimer = this.time.delayedCall(CAST_TIMEOUT_MS, () => this.onCastTimeout());
  }

  private onBite(): void {
    this.timeoutTimer?.remove();
    this.statusText.setText("Bite!");

    if (this.bobber) {
      this.tweens.add({ targets: this.bobber, scale: 1.6, yoyo: true, duration: 150, repeat: 2 });
    }

    this.cameras.main.zoomTo(1.15, 400);

    this.time.delayedCall(500, () => {
      this.scene.launch("ReelingScene");
      this.scene.pause();
    });
  }

  private onCastTimeout(): void {
    this.biteTimer?.remove();
    this.statusText.setText("Nothing biting — reeled back in.");
    this.time.delayedCall(700, () => this.endCast());
  }

  endCast(): void {
    this.castLine?.destroy();
    this.bobber?.destroy();
    this.castLine = undefined;
    this.bobber = undefined;
    this.biteTimer = undefined;
    this.timeoutTimer = undefined;
    this.isCasting = false;
    this.statusText.setText("");
    this.cameras.main.zoomTo(1, 400);
  }
}
