import { Camera } from "./camera.js";
import { EntityManager } from "./entity-manager.js";
import { Entity } from "./entity.js";
import { Drawable } from "./drawable.js";
import { Interactive } from "./interactive.js";
import { Box } from "./physics.js";
import { Vector } from "./vector.js";

export class Scene {
    _params: any;
    _entityManager: EntityManager;
    _drawable: Drawable[];
    _camera: Camera;
    _paused: boolean;
    _resources: Map<string, any>;
    _interactive: Entity[];
    _listeners: any;

    constructor(params: any) {
        this._params = params;
        this._entityManager = new EntityManager();
        this._drawable = [];
        this._camera = new Camera();
        this._paused = true;
        this._resources = this._params.resources;
        this._interactive = [];
        this._listeners = {};
    }
    Add(e: Entity, n: string) {
        e._scene = this;
        this._entityManager.Add(e, n);
        e._components.forEach((c) => {
            if(c._type == "drawable") this._AddDrawable(c as Drawable);
        });
    }
    Remove(e: Entity) {
        this._entityManager.Remove(e);
        e._components.forEach((c) => {
            if(c._type == "drawable") this._RemoveDrawable(c as Drawable);
        });
    }
    Get(n: string) {
        return this._entityManager.Get(n);
    }
    Filter(cb: (_: Entity) => boolean) {
        return this._entityManager.Filter(cb);
    }
    _AddDrawable(e: Drawable) {
        this._drawable.push(e);
        for(let i = this._drawable.length - 1; i > 0; --i) {
            if(e._zIndex >= this._drawable[i - 1]._zIndex) {
                break;
            }
            [this._drawable[i], this._drawable[i - 1]] = [this._drawable[i - 1], this._drawable[i]];
        }
    }
    _RemoveDrawable(e: Drawable) {
        const i = this._drawable.indexOf(e);
        if(i > 0) {
            this._drawable.splice(i, 1);
        }
    }
    Play() {
        this._paused = false;
    }
    Pause() {
        this._paused = true;
    }
    Update(elapsedTimeS: number) {
        if(this._paused) {
            return;
        }
        this._entityManager.Update(elapsedTimeS);
        this._camera.Update(elapsedTimeS);
    }
    SetInteractive(e: Entity, params?: any) {
        this._interactive.push(e);
        e.interactive = new Interactive(params);
    }
    _HandleListeners(ev: string, params: any) {
        if(this._listeners[ev]) {
            for(let f of this._listeners[ev]) {
                f(params);
            }
        }
        for(let e of this._interactive) {
            if(e.GetComponent("body") && (e.GetComponent("body") as Box).Contains(new Vector(params.x, params.y))) {
                e.interactive._HandleListeners(ev, params);
            }
        }
    }
    AddListener(e: string, f: (params: any) => void) {
        if(!this._listeners[e]) {
            this._listeners[e] = [];
        }
        this._listeners[e].push(f);
    }
    RemoveListener(e: string, f: (params: any) => void) {
        const i = this._listeners[e].indexOf(f);
        if(i < 0) {
            return;
        }
        this._listeners[e].splice(i, 1);
    }
    OnClick() {}
}