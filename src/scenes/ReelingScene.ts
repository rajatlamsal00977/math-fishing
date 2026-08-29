import Phaser from "phaser";
import { PondScene } from "./PondScene";

// Phase 1.4: a single hardcoded problem. Real generation arrives in Phase 2.
const HARDCODED_PROBLEM = { question: "6 + 7", answer: 13 };

const PANEL_WIDTH = 460;
const PANEL_HEIGHT = 460;
const MAX_ANSWER_LENGTH = 3;
const BUTTON_SIZE = 64;
const BUTTON_GAP = 12;

const TENSION_MAX = 100;
const TENSION_RISE_PER_MS = TENSION_MAX / 15000; // fills in ~15s if left idle
const TENSION_DROP_ON_CORRECT = 40;
const TENSION_SPIKE_ON_WRONG = 25;
const TENSION_BAR_WIDTH = 22;
const TENSION_BAR_HEIGHT = 300;
const TENSION_LOW_COLOR = { r: 0x8b, g: 0xc9, b: 0x8a };
const TENSION_HIGH_COLOR = { r: 0xd0, g: 0x60, b: 0x60 };

const CORRECT_TO_CATCH = 3;
const WRONG_TO_ESCAPE = 3;
const ESCAPE_MESSAGE = "Nice try! That one got away.";

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

  private tension = 0;
  private tensionFill!: Phaser.GameObjects.Graphics;
  private tensionBarX = 0;
  private tensionBarTop = 0;

  private correctCount = 0;
  private wrongCount = 0;
  private isResolved = false;

  constructor() {
    super("ReelingScene");
  }

  create(): void {
    this.answer = "";
    this.tension = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.isResolved = false;

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
    this.createTensionBar(cx + PANEL_WIDTH / 2 - 60, panelTop + 60);
  }

  update(_time: number, delta: number): void {
    if (this.isResolved) return;

    this.tension = Phaser.Math.Clamp(this.tension + TENSION_RISE_PER_MS * delta, 0, TENSION_MAX);
    this.drawTensionBar();

    if (this.tension >= TENSION_MAX) {
      this.resolve(ESCAPE_MESSAGE);
    }
  }

  private createTensionBar(x: number, top: number): void {
    this.tensionBarX = x;
    this.tensionBarTop = top;

    this.add
      .text(x, top - 22, "Tension", {
        fontFamily: "Georgia, serif",
        fontSize: "13px",
        color: "#f4e9d8",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.add
      .rectangle(x, top + TENSION_BAR_HEIGHT / 2, TENSION_BAR_WIDTH, TENSION_BAR_HEIGHT, 0x3d2b1a)
      .setStrokeStyle(2, 0x5c3a1a)
      .setScrollFactor(0);

    this.tensionFill = this.add.graphics().setScrollFactor(0);
    this.drawTensionBar();
  }

  private drawTensionBar(): void {
    const fillHeight = (this.tension / TENSION_MAX) * TENSION_BAR_HEIGHT;
    const t = this.tension / TENSION_MAX;
    const r = Phaser.Math.Linear(TENSION_LOW_COLOR.r, TENSION_HIGH_COLOR.r, t);
    const g = Phaser.Math.Linear(TENSION_LOW_COLOR.g, TENSION_HIGH_COLOR.g, t);
    const b = Phaser.Math.Linear(TENSION_LOW_COLOR.b, TENSION_HIGH_COLOR.b, t);

    this.tensionFill.clear();
    this.tensionFill.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
    this.tensionFill.fillRect(
      this.tensionBarX - TENSION_BAR_WIDTH / 2 + 2,
      this.tensionBarTop + TENSION_BAR_HEIGHT - fillHeight,
      TENSION_BAR_WIDTH - 4,
      fillHeight,
    );
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
    if (this.isResolved) return;

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
    if (this.isResolved || this.answer.length === 0) return;

    const isCorrect = Number(this.answer) === HARDCODED_PROBLEM.answer;

    if (isCorrect) {
      this.tension = Phaser.Math.Clamp(this.tension - TENSION_DROP_ON_CORRECT, 0, TENSION_MAX);
      this.correctCount++;
      this.feedbackText.setText("Correct!");

      if (this.correctCount >= CORRECT_TO_CATCH) {
        this.time.delayedCall(800, () => this.resolve("Caught it!"));
      } else {
        this.time.delayedCall(800, () => this.resetForNextAttempt());
      }
    } else {
      this.tension = Phaser.Math.Clamp(this.tension + TENSION_SPIKE_ON_WRONG, 0, TENSION_MAX);
      this.wrongCount++;
      this.feedbackText.setText("Not quite — try again!");

      if (this.wrongCount >= WRONG_TO_ESCAPE) {
        this.time.delayedCall(600, () => this.resolve(ESCAPE_MESSAGE));
      } else {
        this.time.delayedCall(600, () => this.resetForNextAttempt());
      }
    }
  }

  private resetForNextAttempt(): void {
    this.answer = "";
    this.answerText.setText("_");
    this.feedbackText.setText("");
  }

  private resolve(message: string): void {
    if (this.isResolved) return;
    this.isResolved = true;
    this.feedbackText.setText(message);
    this.time.delayedCall(1000, () => this.returnToPond());
  }

  private returnToPond(): void {
    const pond = this.scene.get("PondScene") as PondScene;
    this.scene.stop();
    this.scene.resume("PondScene");
    pond.endCast();
  }
}
