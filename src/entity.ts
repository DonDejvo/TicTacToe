import { Vector } from "./vector.js";
import { EntityManager } from "./entity-manager.js";
import { Component } from "./component.js";
import { Interactive } from "./interactive.js";

export class Entity {
    _pos: Vector;
    _components: Map<string, Component>;
    _parent: EntityManager;
    _name: string;
    _scene: any;
    groupList: Set<string>;
    interactive: Interactive;
    constructor() {
        this._pos = new Vector(0, 0);
        this._components = new Map();
        this._parent = null;
        this._name = null;
        this._scene = null;
        this.groupList = new Set();
    }
    Update(elapsedTimeS: number) {
        this._components.forEach((c) => {
            c.Update(elapsedTimeS);
        });
    }
    AddComponent(c: Component, n?: (string | undefined)) {
        if(n === undefined) {
            n = c.constructor.name;
        }
        this._components.set(n, c);
        c._parent = this;
        c.InitComponent();
    }
    GetComponent(n: string) {
        return this._components.get(n);
    }
    SetPosition(p: Vector) {
        this._pos.Copy(p);
    }
    FindEntity(n: string) {
        return this._parent.Get(n);
    }
}



    

    
