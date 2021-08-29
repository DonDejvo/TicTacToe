type loadObj = { name: string, path: string, type: string };

export class Loader {
    _toLoad: loadObj[];
    _size: number;
    _counter: number;
    _path: string;
    constructor() {
        this._toLoad = [];
        this._size = 0;
        this._counter = 0;
        this._path = "";
    }
    _Add(n: string, p: string, type: string) {
        this._toLoad.push({
            name: n,
            path: this._path + "/" + p,
            type: type
        });
        ++this._size;
    }
    AddImage(n: string, p: string) {
        this._Add(n, p, "image");
        return this;
    }
    AddAudio(n: string, p: string) {
        this._Add(n, p, "audio");
        return this;
    }
    AddJSON(n: string, p: string) {
        this._Add(n, p, "json");
        return this;
    }
    AddFont(n: string, p: string) {
        this._Add(n, p, "font");
        return this;
    }
    _HandleCallback(loaded: Map<string, any>, obj: loadObj, e: any, cb: (_: Map<string, any>) => void) {
        loaded.set(obj.name, e);
        ++this._counter;
        this._HandleOnProgress(obj);
        if(this._counter === this._size) {
            this._counter = this._size = 0;
            this._toLoad = [];
            cb(loaded);
        }
    }
    _OnProgressHandler(value: number, obj: loadObj) {}
    OnProgress(f: (value: number, obj: loadObj) => void) {
        this._OnProgressHandler = f;
        return this;
    }
    SetPath(p: string) {
        this._path = p;
        return this;
    }
    _HandleOnProgress(obj: loadObj) {
        const value = this._counter / this._size;
        this._OnProgressHandler(value, obj);
    }
    Load(cb: (_: Map<string, any>) => void) {
        const loaded:Map<string, any> = new Map();
        for(let e of this._toLoad) {
            switch(e.type) {
                case "image":
                    Loader.LoadImage(e.path, (elem) => {
                        this._HandleCallback(loaded, e, elem, cb);
                    });
                    break;
                case "audio":
                    Loader.LoadAudio(e.path, (elem) => {
                        this._HandleCallback(loaded, e, elem, cb);
                    });
                    break;
                case "json":
                    Loader.LoadJSON(e.path, (elem) => {
                        this._HandleCallback(loaded, e, elem, cb);
                    });
                    break;
                case "font":
                    Loader.LoadFont(e.name, e.path, (elem) => {
                        this._HandleCallback(loaded, e, elem, cb);
                    });
            }
        }
    }
    static LoadImage(p: string, cb: (_: HTMLImageElement) => void) {
        const image = new Image();
        image.src = p;
        image.addEventListener("load", () => {
            cb(image);
        }, {once: true});
    }
    static LoadAudio(p: string, cb: (_: HTMLAudioElement) => void) {
        const audio = new Audio(p);
        audio.load();        
        audio.addEventListener("canplaythrough", () => {
            cb(audio);
        }, {once: true});
    }
    static LoadJSON(p: string, cb: (_: JSON) => void) {
        fetch(p)
            .then(response => response.json())
            .then(json => cb(json));
    }
    static LoadFont(n: string, p: string, cb: (name: string) => void) {
        const font = new FontFace(n, `url(${p})`);
        font
            .load()
            .then((loadedFont: any) => {
                (document as any).fonts.add(loadedFont);
                cb(n);
            });
    }
}