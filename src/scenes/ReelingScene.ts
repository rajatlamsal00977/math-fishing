import Phaser from "phaser";
import { PondScene } from "./PondScene";

// Phase 1.4: a single hardcoded problem. Real generation arrives in Phase 2.
const HARDCODED_PROBLEM = { question: "6 + 7", answer: 13 };

const PANEL_WIDTH = 460;
const PANEL_HEIGHT = 460;
const MAX_ANSWER_LENGTH = 3;
const BUTTON_SIZE = 64;
const BUTTON_GAP = 12;

type PadKey = { label: string; action: "digit" | "backspace" | "submit"; digit?: number };

const PAD_LAYOUT: PadKey[] = [
  { label: "1", action: "digit", digit: 1 },
  { label: "2", action: "digit", digit: 2 },
  { label: "3", action: "digit", digit: 3 },
  { label: "4", action: "digit", digit: 4 },
  { label: "5", action: "digit", digit: 5 },
  { label: "6", action: "digit", digit: 6 },
  { label: "7", action: "digit", digit: 7 },
  { label: "8", action: "digit", digit: 8 },
  { label: "9", action: "digit", digit: 9 },
  { label: "⌫", action: "backspace" },
  { label: "0", action: "digit", digit: 0 },
  { label: "✓", action: "submit" },
];

export class ReelingScene extends Phaser.Scene {
  private answer = "";
  private answerText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;

  constructor() {
    super("ReelingScene");
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.add.rectangle(cx, cy, width, height, 0x000000, 0.45).setScrollFactor(0);

    this.add
      .rectangle(cx, cy, PANEL_WIDTH, PANEL_HEIGHT, 0x8b5a2b)
      .setStrokeStyle(4, 0x5c3a1a)
      .setScrollFactor(0);

    const panelTop = cy - PANEL_HEIGHT / 2;

    this.add
      .text(cx, panelTop + 36, `${HARDCODED_PROBLEM.question} = ?`, {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        color: "#f4e9d8",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.answerText = this.add
      .text(cx, panelTop + 84, "_", {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.feedbackText = this.add
      .text(cx, panelTop + 116, "", {
        fontFamily: "Georgia, serif",
        fontSize: "16px",
        color: "#cfe8d8",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.createNumberPad(cx, panelTop + 190);
  }

  private createNumberPad(centerX: number, top: number): void {
    const cols = 3;
    const gridWidth = cols * BUTTON_SIZE + (cols - 1) * BUTTON_GAP;
    const startX = centerX - gridWidth / 2 + BUTTON_SIZE / 2;

    PAD_LAYOUT.forEach((key, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (BUTTON_SIZE + BUTTON_GAP);
      const y = top + row * (BUTTON_SIZE + BUTTON_GAP);

      const fillColor = key.action === "submit" ? 0x7fae6a : key.action === "backspace" ? 0xb08968 : 0xf4e9d8;
      const textColor = key.action === "digit" ? "#3d2b1a" : "#f4e9d8";

      const button = this.add
        .rectangle(x, y, BUTTON_SIZE, BUTTON_SIZE, fillColor)
        .setStrokeStyle(2, 0x5c3a1a)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(x, y, key.label, {
          fontFamily: "Georgia, serif",
          fontSize: "26px",
          color: textColor,
        })
        .setOrigin(0.5)
        .setScrollFactor(0);

      button.on("pointerdown", () => this.handlePadPress(key));
    });
  }

  private handlePadPress(key: PadKey): void {
    if (key.action === "digit") {
      if (this.answer.length < MAX_ANSWER_LENGTH) {
        this.answer += String(key.digit);
        this.answerText.setText(this.answer);
      }
    } else if (key.action === "backspace") {
      this.answer = this.answer.slice(0, -1);
      this.answerText.setText(this.answer || "_");
    } else if (key.action === "submit") {
      this.submitAnswer();
    }
  }

  private submitAnswer(): void {
    if (this.answer.length === 0) return;

    const isCorrect = Number(this.answer) === HARDCODED_PROBLEM.answer;

    if (isCorrect) {
      this.feedbackText.setText("Correct!");
      this.time.delayedCall(800, () => this.finish());
    } else {
      this.feedbackText.setText("Not quite — try again!");
      this.time.delayedCall(600, () => {
        this.answer = "";
        this.answerText.setText("_");
        this.feedbackText.setText("");
      });
    }
  }

  private finish(): void {
    const pond = this.scene.get("PondScene") as PondScene;
    this.scene.stop();
    this.scene.resume("PondScene");
    pond.endCast();
  }
}
