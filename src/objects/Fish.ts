import Phaser from "phaser";

export interface FishConfig {
  color: number;
  radius: number;
  speed: number;
  bounds: Phaser.Geom.Rectangle;
}

/** Placeholder fish: a colored circle that wanders gently within `bounds`. */
export class Fish {
  readonly gameObject: Phaser.GameObjects.Arc;

  private target: Phaser.Math.Vector2;
  private readonly speed: number;
  private readonly bounds: Phaser.Geom.Rectangle;
  private readonly bobPhase: number;
  private idleUntil = 0;
  private active = true;

  constructor(scene: Phaser.Scene, x: number, y: number, config: FishConfig) {
    this.speed = config.speed;
    this.bounds = config.bounds;
    this.bobPhase = Math.random() * Math.PI * 2;

    this.gameObject = scene.add.circle(x, y, config.radius, config.color, 0.9);
    this.gameObject.setDepth(0);

    this.target = this.pickNewTarget();
  }

  get x(): number {
    return this.gameObject.x;
  }

  get y(): number {
    return this.gameObject.y;
  }

  /** Hides the fish after it's caught; it stops patrolling until `respawnAt`. */
  hide(): void {
    this.active = false;
    this.gameObject.setVisible(false);
  }

  respawnAt(x: number, y: number): void {
    this.gameObject.setPosition(x, y);
    this.gameObject.setScale(1);
    this.gameObject.setAlpha(0.9);
    this.gameObject.setVisible(true);
    this.active = true;
    this.target = this.pickNewTarget();
  }

  update(time: number, delta: number): void {
    if (!this.active || time < this.idleUntil) return;

    const dx = this.target.x - this.gameObject.x;
    const dy = this.target.y - this.gameObject.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 4) {
      this.target = this.pickNewTarget();
      this.idleUntil = time + Phaser.Math.Between(400, 1500);
      return;
    }

    const moveDist = (this.speed * delta) / 1000;
    const bob = Math.sin(time / 450 + this.bobPhase) * 0.2;
    this.gameObject.x += (dx / distance) * moveDist;
    this.gameObject.y += (dy / distance) * moveDist + bob;
  }

  private pickNewTarget(): Phaser.Math.Vector2 {
    const x = Phaser.Math.Between(this.bounds.x, this.bounds.x + this.bounds.width);
    const y = Phaser.Math.Between(this.bounds.y, this.bounds.y + this.bounds.height);
    return new Phaser.Math.Vector2(x, y);
  }
}
