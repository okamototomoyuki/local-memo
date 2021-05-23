import Vector2 from "./Struct/Vector2";
import System from "../System";
import KeyCode from "./Input/KeyCode";

/**
 * 入力
 */
export default class Input {
    static _MOUSE_LEFT = "_MOUSE_LEFT";
    static _MOUSE_RIGHT = "_MOUSE_RIGHT";
    static _MOUSE_MIDDLE = "_MOUSE_MIDDLE";

    static keyToCode = new Map([
        ["Escape", new KeyCode("Escape")],
        ["D0", new KeyCode("D0")],
        ["D1", new KeyCode("D1")],
        ["D2", new KeyCode("D2")],
        ["D3", new KeyCode("D3")],
        ["D4", new KeyCode("D4")],
        ["D5", new KeyCode("D5")],
        ["D6", new KeyCode("D6")],
        ["D7", new KeyCode("D7")],
        ["D8", new KeyCode("D8")],
        ["D9", new KeyCode("D9")],
        ["Minus", new KeyCode("Minus")],
        ["Equal", new KeyCode("Equal")],
        ["Backspace", new KeyCode("Backspace")],
        ["Tab", new KeyCode("Tab")],
        ["KeyQ", new KeyCode("KeyQ")],
        ["KeyW", new KeyCode("KeyW")],
        ["KeyE", new KeyCode("KeyE")],
        ["KeyR", new KeyCode("KeyR")],
        ["KeyT", new KeyCode("KeyT")],
        ["KeyY", new KeyCode("KeyY")],
        ["KeyU", new KeyCode("KeyU")],
        ["KeyI", new KeyCode("KeyI")],
        ["KeyO", new KeyCode("KeyO")],
        ["KeyP", new KeyCode("KeyP")],
        ["BracketLeft", new KeyCode("BracketLeft")],
        ["BracketRight", new KeyCode("BracketRight")],
        ["Enter", new KeyCode("Enter")],
        ["ControlLeft", new KeyCode("ControlLeft")],
        ["KeyA", new KeyCode("KeyA")],
        ["KeyS", new KeyCode("KeyS")],
        ["KeyD", new KeyCode("KeyD")],
        ["KeyF", new KeyCode("KeyF")],
        ["KeyG", new KeyCode("KeyG")],
        ["KeyH", new KeyCode("KeyH")],
        ["KeyJ", new KeyCode("KeyJ")],
        ["KeyK", new KeyCode("KeyK")],
        ["KeyL", new KeyCode("KeyL")],
        ["Semicolon", new KeyCode("Semicolon")],
        ["Quote", new KeyCode("Quote")],
        ["Backquote", new KeyCode("Backquote")],
        ["ShiftLeft", new KeyCode("ShiftLeft")],
        ["Backslash", new KeyCode("Backslash")],
        ["KeyZ", new KeyCode("KeyZ")],
        ["KeyX", new KeyCode("KeyX")],
        ["KeyC", new KeyCode("KeyC")],
        ["KeyV", new KeyCode("KeyV")],
        ["KeyB", new KeyCode("KeyB")],
        ["KeyN", new KeyCode("KeyN")],
        ["KeyM", new KeyCode("KeyM")],
        ["Comma", new KeyCode("Comma")],
        ["Period", new KeyCode("Period")],
        ["Slash", new KeyCode("Slash")],
        ["ShiftRight", new KeyCode("ShiftRight")],
        ["NumpadMultiply", new KeyCode("NumpadMultiply")],
        ["AltLeft", new KeyCode("AltLeft")],
        ["Space", new KeyCode("Space")],
        ["F1", new KeyCode("F1")],
        ["F2", new KeyCode("F2")],
        ["F3", new KeyCode("F3")],
        ["F4", new KeyCode("F4")],
        ["F5", new KeyCode("F5")],
        ["F6", new KeyCode("F6")],
        ["F7", new KeyCode("F7")],
        ["F8", new KeyCode("F8")],
        ["F9", new KeyCode("F9")],
        ["F10", new KeyCode("F10")],
        ["F11", new KeyCode("F11")],
        ["F12", new KeyCode("F12")],
        ["Delete", new KeyCode("Delete")],
        ["ArrowUp", new KeyCode("ArrowUp")],
        ["ArrowLeft", new KeyCode("ArrowLeft")],
        ["ArrowRight", new KeyCode("ArrowRight")],
        ["ArrowDown", new KeyCode("ArrowDown")],
        ["PageUp", new KeyCode("PageUp")],
        ["PageDown", new KeyCode("PageDown")],
        ["Home", new KeyCode("Home")],
        ["End", new KeyCode("End")]]);

    static keyToState = new Map<string, number>();
    static keyToDownFrame = new Map<string, number>();
    static keyToUpFrame = new Map<string, number>();
    static mousePosition = new Vector2(0, 0);
    static wheelFrame = 0
    static wheel = 0

    static initialize() {
        document.addEventListener("keydown", Input._onKeyDown);
        document.addEventListener("keyup", Input._onKeyUp);
        document.addEventListener("mousemove", Input._onMouseMove)
        document.body.addEventListener("mousedown", Input._onMouseDown)
        document.body.addEventListener("mouseup", Input._onMouseUp)
        document.body.addEventListener("wheel", Input._onMouseWheel)

        Input.update();
    }

    static update() {
        for (let key of Input.keyToState.keys()) {
            let state = Input.keyToState.get(key);
            let downFrame = Input.keyToDownFrame.get(key);
            let upFrame = Input.keyToUpFrame.get(key);

            if (state == 2 && downFrame && downFrame <= System.currentFrame - 2) {
                Input.keyToState.set(key, 1);
            } else if (state == -1 && upFrame && upFrame <= System.currentFrame - 2) {
                Input.keyToState.set(key, 0);
            }
        }
        if (Input.wheelFrame < System.currentFrame - 1) {
            Input.wheel = 0;
        }
    }

    static _onKeyDown(e: KeyboardEvent) {
        Input.keyToDownFrame.set(e.code, System.currentFrame);
        Input.keyToState.set(e.code, 2);
    }

    static _onKeyUp(e: KeyboardEvent) {
        Input.keyToUpFrame.set(e.code, System.currentFrame);
        Input.keyToState.set(e.code, -1);
    }

    static _onMouseMove(e: MouseEvent) {
        Input.mousePosition = new Vector2(e.clientX, e.clientY);
    }

    static _onMouseDown(e: MouseEvent) {
        switch (e.button) {
            case 0:
                Input.keyToDownFrame.set(Input._MOUSE_LEFT, System.currentFrame);
                Input.keyToState.set(Input._MOUSE_LEFT, 2);
            case 1:
                Input.keyToDownFrame.set(Input._MOUSE_MIDDLE, System.currentFrame);
                Input.keyToState.set(Input._MOUSE_MIDDLE, 2);
            case 2:
                Input.keyToDownFrame.set(Input._MOUSE_RIGHT, System.currentFrame);
                Input.keyToState.set(Input._MOUSE_RIGHT, 2);
        }
    }

    static _onMouseUp(e: MouseEvent) {
        switch (e.button) {
            case 0:
                Input.keyToUpFrame.set(Input._MOUSE_LEFT, System.currentFrame);
                Input.keyToState.set(Input._MOUSE_LEFT, -1);
            case 1:
                Input.keyToUpFrame.set(Input._MOUSE_MIDDLE, System.currentFrame);
                Input.keyToState.set(Input._MOUSE_MIDDLE, -1);
            case 2:
                Input.keyToUpFrame.set(Input._MOUSE_RIGHT, System.currentFrame);
                Input.keyToState.set(Input._MOUSE_RIGHT, -1);
        }
    }

    static _onMouseWheel(e: WheelEvent) {
        Input.wheelFrame = System.currentFrame;
        Input.wheel = e.deltaY;
    }

    static isUp(code: string): boolean {
        if (Input.keyToState.has(code)) {
            return Input.keyToState.get(code) == -1;
        }
        return false;
    }

    static isNotPress(code: string): boolean {
        const v = Input.keyToState.get(code);
        return v == 0 || v == -1;
    }

    static isDown(code: string): boolean {
        return Input.keyToState.get(code) == 2;
    }

    static isPressing(code: string): boolean {
        const v = Input.keyToState.get(code)
        return v == 1 || v == 2;
    }


    static get isUpMouseLeft(): boolean {
        return Input.keyToState.get(Input._MOUSE_LEFT) == -1
    }

    static get isNotPressMouseLeft(): boolean {
        const v = Input.keyToState.get(Input._MOUSE_LEFT);
        return v == -1 || v == 0
    }

    static get isDownMouseLeft(): boolean {
        return Input.keyToState.get(Input._MOUSE_LEFT) == 2;
    }

    static get isPressingMouseLeft(): boolean {
        const v = Input.keyToState.get(Input._MOUSE_LEFT)
        return v == 1 || v == 2;
    }


    static get isUpMouseRight(): boolean {
        return Input.keyToState.get(Input._MOUSE_RIGHT) == -1;
    }

    static get isNotPressMouseRight(): boolean {
        const v = Input.keyToState.get(Input._MOUSE_RIGHT)
        return v == -1 || v == 0
    }

    static get isDownMouseRight(): boolean {
        return Input.keyToState.get(Input._MOUSE_RIGHT) == 2;
    }

    static get isPressingMouseRight(): boolean {
        const v = Input.keyToState.get(Input._MOUSE_RIGHT)
        return v == 1 || v == 2;
    }


    static get isUpMouseMiddle(): boolean {
        return Input.keyToState.get(Input._MOUSE_MIDDLE) == -1;
    }

    static get isNotPressMouseMiddle(): boolean {
        const v = Input.keyToState.get(Input._MOUSE_MIDDLE)
        return v == -1 || v == 0;
    }

    static get isDownMouseMiddle(): boolean {
        return Input.keyToState.get(Input._MOUSE_MIDDLE) == 2;
    }

    static get isPressingMouseMiddle(): boolean {
        const v = Input.keyToState.get(Input._MOUSE_MIDDLE)
        return v == 1 || v == 2;
    }

    static get escape(): KeyCode | undefined { return Input.keyToCode.get("Escape"); }
    static get d0(): KeyCode | undefined { return Input.keyToCode.get("D0"); }
    static get d1(): KeyCode | undefined { return Input.keyToCode.get("D1"); }
    static get d2(): KeyCode | undefined { return Input.keyToCode.get("D2"); }
    static get d3(): KeyCode | undefined { return Input.keyToCode.get("D3"); }
    static get d4(): KeyCode | undefined { return Input.keyToCode.get("D4"); }
    static get d5(): KeyCode | undefined { return Input.keyToCode.get("D5"); }
    static get d6(): KeyCode | undefined { return Input.keyToCode.get("D6"); }
    static get d7(): KeyCode | undefined { return Input.keyToCode.get("D7"); }
    static get d8(): KeyCode | undefined { return Input.keyToCode.get("D8"); }
    static get d9(): KeyCode | undefined { return Input.keyToCode.get("D9"); }
    static get minus(): KeyCode | undefined { return Input.keyToCode.get("Minus"); }
    static get equal(): KeyCode | undefined { return Input.keyToCode.get("Equal"); }
    static get backspace(): KeyCode | undefined { return Input.keyToCode.get("Backspace"); }
    static get tab(): KeyCode | undefined { return Input.keyToCode.get("Tab"); }
    static get q(): KeyCode | undefined { return Input.keyToCode.get("KeyQ"); }
    static get w(): KeyCode | undefined { return Input.keyToCode.get("KeyW"); }
    static get e(): KeyCode | undefined { return Input.keyToCode.get("KeyE"); }
    static get r(): KeyCode | undefined { return Input.keyToCode.get("KeyR"); }
    static get t(): KeyCode | undefined { return Input.keyToCode.get("KeyT"); }
    static get y(): KeyCode | undefined { return Input.keyToCode.get("KeyY"); }
    static get u(): KeyCode | undefined { return Input.keyToCode.get("KeyU"); }
    static get i(): KeyCode | undefined { return Input.keyToCode.get("KeyI"); }
    static get o(): KeyCode | undefined { return Input.keyToCode.get("KeyO"); }
    static get p(): KeyCode | undefined { return Input.keyToCode.get("KeyP"); }
    static get bracketLeft(): KeyCode | undefined { return Input.keyToCode.get("BracketLeft"); }
    static get bracketRight(): KeyCode | undefined { return Input.keyToCode.get("BracketRight"); }
    static get enter(): KeyCode | undefined { return Input.keyToCode.get("Enter"); }
    static get controlLeft(): KeyCode | undefined { return Input.keyToCode.get("ControlLeft"); }
    static get a(): KeyCode | undefined { return Input.keyToCode.get("KeyA"); }
    static get s(): KeyCode | undefined { return Input.keyToCode.get("KeyS"); }
    static get d(): KeyCode | undefined { return Input.keyToCode.get("KeyD"); }
    static get f(): KeyCode | undefined { return Input.keyToCode.get("KeyF"); }
    static get g(): KeyCode | undefined { return Input.keyToCode.get("KeyG"); }
    static get h(): KeyCode | undefined { return Input.keyToCode.get("KeyH"); }
    static get j(): KeyCode | undefined { return Input.keyToCode.get("KeyJ"); }
    static get k(): KeyCode | undefined { return Input.keyToCode.get("KeyK"); }
    static get l(): KeyCode | undefined { return Input.keyToCode.get("KeyL"); }
    static get semicolon(): KeyCode | undefined { return Input.keyToCode.get("Semicolon"); }
    static get quote(): KeyCode | undefined { return Input.keyToCode.get("Quote"); }
    static get backquote(): KeyCode | undefined { return Input.keyToCode.get("Backquote"); }
    static get shiftLeft(): KeyCode | undefined { return Input.keyToCode.get("ShiftLeft"); }
    static get backslash(): KeyCode | undefined { return Input.keyToCode.get("Backslash"); }
    static get z(): KeyCode | undefined { return Input.keyToCode.get("KeyZ"); }
    static get x(): KeyCode | undefined { return Input.keyToCode.get("KeyX"); }
    static get c(): KeyCode | undefined { return Input.keyToCode.get("KeyC"); }
    static get v(): KeyCode | undefined { return Input.keyToCode.get("KeyV"); }
    static get b(): KeyCode | undefined { return Input.keyToCode.get("KeyB"); }
    static get n(): KeyCode | undefined { return Input.keyToCode.get("KeyN"); }
    static get m(): KeyCode | undefined { return Input.keyToCode.get("KeyM"); }
    static get comma(): KeyCode | undefined { return Input.keyToCode.get("Comma"); }
    static get period(): KeyCode | undefined { return Input.keyToCode.get("Period"); }
    static get slash(): KeyCode | undefined { return Input.keyToCode.get("Slash"); }
    static get shiftRight(): KeyCode | undefined { return Input.keyToCode.get("ShiftRight"); }
    static get numpadMultiply(): KeyCode | undefined { return Input.keyToCode.get("NumpadMultiply"); }
    static get altLeft(): KeyCode | undefined { return Input.keyToCode.get("AltLeft"); }
    static get space(): KeyCode | undefined { return Input.keyToCode.get("Space"); }
    static get f1(): KeyCode | undefined { return Input.keyToCode.get("F1"); }
    static get f2(): KeyCode | undefined { return Input.keyToCode.get("F2"); }
    static get f3(): KeyCode | undefined { return Input.keyToCode.get("F3"); }
    static get f4(): KeyCode | undefined { return Input.keyToCode.get("F4"); }
    static get f5(): KeyCode | undefined { return Input.keyToCode.get("F5"); }
    static get f6(): KeyCode | undefined { return Input.keyToCode.get("F6"); }
    static get f7(): KeyCode | undefined { return Input.keyToCode.get("F7"); }
    static get f8(): KeyCode | undefined { return Input.keyToCode.get("F8"); }
    static get f9(): KeyCode | undefined { return Input.keyToCode.get("F9"); }
    static get f10(): KeyCode | undefined { return Input.keyToCode.get("F10"); }
    static get f11(): KeyCode | undefined { return Input.keyToCode.get("F11"); }
    static get f12(): KeyCode | undefined { return Input.keyToCode.get("F12"); }
    static get delete(): KeyCode | undefined { return Input.keyToCode.get("Delete"); }
    static get arrowUp(): KeyCode | undefined { return Input.keyToCode.get("ArrowUp"); }
    static get arrowLeft(): KeyCode | undefined { return Input.keyToCode.get("ArrowLeft"); }
    static get arrowRight(): KeyCode | undefined { return Input.keyToCode.get("ArrowRight"); }
    static get arrowDown(): KeyCode | undefined { return Input.keyToCode.get("ArrowDown"); }
    static get pageUp(): KeyCode | undefined { return Input.keyToCode.get("PageUp"); }
    static get pageDown(): KeyCode | undefined { return Input.keyToCode.get("PageDown"); }
    static get home(): KeyCode | undefined { return Input.keyToCode.get("Home"); }
    static get end(): KeyCode | undefined { return Input.keyToCode.get("End"); }
}