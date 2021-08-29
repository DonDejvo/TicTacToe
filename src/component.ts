import { Entity } from "./entity.js";

export class Component {
    _type: string;
    _parent: Entity;
    constructor() {
        this._type = "normal";
        this._parent = null;
    }
    InitComponent() {}
    GetComponent(n: string) {
        return this._parent.GetComponent(n);
    }
    FindEntity(n: string) {
        return this._parent.FindEntity(n);
    }
    Update(_: number) {}
}