import { Entity } from "./entity.js";

export class EntityManager {
    _entities: Entity[];
    _entitiesMap: Map<string, Entity>;
    _ids: number;
    constructor() {
        this._entities = [];
        this._entitiesMap = new Map();
        this._ids = 0;
    }
    _GenerateName() {
        ++this._ids;
        return "__entity__" + this._ids;
    }
    Add(e: Entity, n?: (string | undefined)) {
        if(n === undefined) {
            n = this._GenerateName();
        }
        this._entities.push(e);
        this._entitiesMap.set(n, e);
        e._parent = this;
        e._name = n;
    }
    Get(n: string) {
        return this._entitiesMap.get(n);
    }
    Remove(e: Entity) {
        const i = this._entities.indexOf(e);
        if(i < 0) {
            return;
        }
        this._entities.splice(i, 1);
    }
    Filter(cb: (_: Entity) => boolean) {
        return this._entities.filter(cb);
    }
    Update(elapsedTimeS: number) {
        for(let e of this._entities) {
            e.Update(elapsedTimeS);
        }
    }
}