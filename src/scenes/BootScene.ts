import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#3d6b7d");

    this.add
      .text(width / 2, height / 2, "Math Fishing Game", {
        fontFamily: "Georgia, serif",
        fontSize: "36px",
        color: "#f4e9d8",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 40, "hello, cozy pond", {
        fontFamily: "Georgia, serif",
        fontSize: "16px",
        color: "#cfe8d8",
      })
      .setOrigin(0.5);
  }
}
