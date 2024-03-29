import { Component } from "./component.js";
import { Vector } from "./vector.js";

class Body extends Component {
    _params: any;
    _pos: Vector;
    _oldPos: Vector;
    _vel: Vector;
    _friction: { x: number, y: number }
    _collide: { left: Set<Body>, right: Set<Body>, top: Set<Body>, bottom: Set<Body> }
    constructor(params: any) {
        super();
        this._params = params;
        this._pos = new Vector(0, 0);
        this._oldPos = new Vector(0, 0);
        this._vel = new Vector(0, 0);
        this._friction = {
            x: (this._params.frictionX || 0),
            y: (this._params.frictionY || 0)
        };
        this._collide = {left: new Set(), right: new Set(), top: new Set(), bottom: new Set()};
    }
    InitComponent() {
        this._pos = this._parent._pos;
        this._oldPos = this._pos.Clone();
    }
    SetPosition(p: Vector) {
        this._pos.Copy(p);
        this._oldPos.Copy(p);
    }
    Update(_: number) {
        
    }
    Contains(_: Vector) {
        return false;
    }
}

class Box extends Body {
    _width: number;
    _height: number;
    _edges: number[];
    constructor(params: any) {
        super(params);
        this._width = params.width;
        this._height = params.height;
        this._edges = (params.edges || [1, 1, 1, 1]);
    }
    get left() {
        return this._pos.x - this._width / 2;
    }
    get right() {
        return this._pos.x + this._width / 2;
    }
    get top() {
        return this._pos.y - this._height / 2;
    }
    get bottom() {
        return this._pos.y + this._height / 2;
    }
    Contains(p1: Vector) {
        return Math.abs(p1.x - this._pos.x) < this._width / 2 && Math.abs(p1.y - this._pos.y) < this._height / 2;
    }
}

const ResolveCollision = (mover: Body, platform: Body) => {
    switch(platform.constructor.name) {
        case "Box":
            ResolveCollisionBox(mover as Box, platform as Box);
            break;
    }
};

const ResolveCollisionBox = (mover: Box, platform: Box) => {

    const vec = mover._pos.Clone().Sub(mover._oldPos);
    
    let collided = false;

    if(vec.y != 0) {
        let y;
        y = (vec.y > 0 ? platform.top - mover._height / 2 : platform.bottom + mover._height / 2);
    
        let a = vec.y / (y - mover._oldPos.y);
        if(a >= 1) {
            collided = true;
            let x = vec.x / a + mover._oldPos.x;
            if(Math.abs(x - platform._pos.x) < (mover._width + platform._width) / 2) {
                if(vec.y > 0) {
                    if(platform._edges[0]) {
                        mover._pos.y = y - 0.001;
                        mover._collide.bottom.add(platform);
                    }
                } else {
                    if(platform._edges[2]) {
                        mover._pos.y = y + 0.001;
                        mover._collide.top.add(platform);
                    }
                }
            }
        }
    }

    if(!collided && vec.x != 0 && (platform._edges[3] || platform._edges[1])) {
        let x;
        x = (vec.x > 0 ? platform.left - mover._width / 2 : platform.right + mover._width / 2);

        let a = vec.x / (x - mover._oldPos.x);
        if(a >= 1) {
            let y = vec.y / a + mover._oldPos.y;
            if(Math.abs(y - platform._pos.y) < (mover._height + platform._height) / 2) {
                if(vec.x > 0) {
                    if(platform._edges[3]) {
                        mover._pos.x = x - 0.001;
                        mover._collide.right.add(platform);
                    }
                } else {
                    if(platform._edges[1]) {
                        mover._pos.x = x + 0.001;
                        mover._collide.left.add(platform);
                    }
                }
            }
        }
    }

    
};

const DetectCollision = (body1: Body, body2: Body) => {
    if(body1.constructor.name == "Box" && body2.constructor.name == "Box") {
        return DetectCollisionBoxVsBox(body1 as Box, body2 as Box);
    }
    return false;
};

const DetectCollisionBoxVsBox = (body1: Box, body2: Box) => {
    return Math.abs(body1._pos.x - body2._pos.x) < (body1._width + body2._width) / 2 &&
    Math.abs(body1._pos.y - body2._pos.y) < (body1._height + body2._height) / 2;
}

export { 
    Box,
    ResolveCollision,
    DetectCollision
}
