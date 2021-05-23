import AppData from "./Data/AppData";
import Input from "./System/Input"
import View from "./View.svelte"

export default class System {

    static qryPlayer = "head meta[name='wysiwyg-novel-type'][content='player']"

    static isPlayer = false
    static prevDate = window.performance.now();
    static currentFrame = 0;
    static delta = 0;
    static loops: Array<() => void> = []

    static view: View | undefined;
    static imgCalc: HTMLImageElement | undefined;

    static async start() {

        // プレイヤーか判定
        this.isPlayer = document.querySelector(this.qryPlayer) != null

        // UI 作成
        System.view = new View({
            target: document.body,
        });

        Input.initialize()

        this.loop()
    }

    static loop() {
        System.currentFrame = System.currentFrame + 1;

        const now = window.performance.now();
        System.delta = (now - System.prevDate) / 1000;
        System.prevDate = now;

        Input.update();
        for (const e of System.loops) {
            e();
        }

        requestAnimationFrame(System.loop);
    }

    static addRequestAnimationFrame(loop: () => void): void {
        System.loops.push(loop);
    }
}