export class Component {
    constructor() {
        this._type = "normal";
        this._parent = null;
    }
    InitComponent() { }
    GetComponent(n) {
        return this._parent.GetComponent(n);
    }
    FindEntity(n) {
        return this._parent.FindEntity(n);
    }
    Update(_) { }
}
