import { Vector } from "./vector.js";
export class Entity {
    constructor() {
        this._pos = new Vector(0, 0);
        this._components = new Map();
        this._parent = null;
        this._name = null;
        this._scene = null;
        this.groupList = new Set();
    }
    Update(elapsedTimeS) {
        this._components.forEach((c) => {
            c.Update(elapsedTimeS);
        });
    }
    AddComponent(c, n) {
        if (n === undefined) {
            n = c.constructor.name;
        }
        this._components.set(n, c);
        c._parent = this;
        c.InitComponent();
    }
    GetComponent(n) {
        return this._components.get(n);
    }
    SetPosition(p) {
        this._pos.Copy(p);
    }
    FindEntity(n) {
        return this._parent.Get(n);
    }
}
