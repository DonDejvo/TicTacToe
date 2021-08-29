export class Interactive {
    _params: any;
    _listeners: any;
    constructor(params: any) {
        this._params = params;
        this._listeners = {};
    }
    _HandleListeners(ev: string, params: any) {
        if(this._listeners[ev]) {
            for(let f of this._listeners[ev]) {
                f(params);
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
}