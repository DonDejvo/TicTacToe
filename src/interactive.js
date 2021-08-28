export class Interactive {
    constructor(params) {
        this._listeners = {};
    }
    _HandleListeners(ev, params) {
        if(this._listeners[ev]) {
            for(let f of this._listeners[ev]) {
                f(params);
            }
        }
    }
    AddListener(e, f) {
        if(!this._listeners[e]) {
            this._listeners[e] = [];
        }
        this._listeners[e].push(f);
    }
    RemoveListener(e, f) {
        const i = this._listeners[e].indexOf(f);
        if(i < 0) {
            return;
        }
        this._listeners[e].splice(i, 1);
    }
}