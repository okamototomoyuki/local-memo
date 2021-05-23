
import Input from "../Input";

export default class KeyCode {
    code: string = "";

    constructor(keyCode: string) {
        this.code = keyCode
    }

    get up(): boolean {
        if (Input.keyToState.has(this.code)) {
            return Input.keyToState.get(this.code) == -1;
        }
        return false;
    }

    get notPress(): boolean {
        const v = Input.keyToState.get(this.code);
        return v == 0 || v == -1;
    }

    get down(): boolean {
        return Input.keyToState.get(this.code) == 2;
    }

    get pressing(): boolean {
        const v = Input.keyToState.get(this.code)
        return v == 1 || v == 2;
    }
}