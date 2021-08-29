import { math } from "./math.js";
import { Vector } from "./vector.js";

export class Camera {
    constructor() {
        this._pos = new Vector(0, 0);
        this._scale = 1.0;
        this._target = null;
        this._vel = new Vector(0, 0);
        this._scaling = [];
        this._moving = [];
    }
    Follow(target) {
        this._target = target;
    }
    Unfollow() {
        this._target = null;
    }
    SetPosition(p) {
        this._pos.Copy(p);
    }
    SetScale(s) {
        this._scale = s;
    }
    ScaleTo(s, dur, timing = "linear") {
        this._scaling.push({
            counter: 0,
            dur: dur,
            from: this._scale,
            to: s,
            timing: timing
        });
    }
    MoveTo(p, dur, timing = "linear") {
        this._moving.push({
            counter: 0,
            dur: dur,
            from: this._pos.Clone(),
            to: p,
            timing: timing
        });
    }
    Reset() {
        this._pos = new Vector(0, 0);
        this._scale = 1;
        this._scaling = [];
        this._moving = [];
    }
    get scaling() {
        return this._scaling.length;
    }
    get moving() {
        return this._moving.length;
    }
    Update(elapsedTimeS) {
        if(this._target) {
            if(Vector.Dist(this._pos, this._target._pos) < 1) {
                this._pos.Copy(this._target._pos);
            } else {
                const t = 4 * elapsedTimeS;
                this._pos.Lerp(this._target._pos, t);
            }
        } else {
            const vel = this._vel.Clone();
            vel.Mult(elapsedTimeS);
            this._pos.Add(vel);
        }
        if(this._scaling.length) {
            const anim = this._scaling[0];
            anim.counter += elapsedTimeS * 1000;
            const progress = Math.min(anim.counter / anim.dur, 1);
            let value;
            switch(anim.timing) {
                case "linear":
                    value = progress;
                    break;
                case "ease-in":
                    value = math.ease_in(progress);
                    break;
                case "ease-out":
                    value = math.ease_out(progress);
                    break;
            }
            this._scale = math.lerp(value, anim.from, anim.to);
            if(progress == 1) {
                this._scaling.shift();
            }
        }
        if(this._moving.length) {
            const anim = this._moving[0];
            anim.counter += elapsedTimeS * 1000;
            const progress = Math.min(anim.counter / anim.dur, 1);
            let value;
            switch(anim.timing) {
                case "linear":
                    value = progress;
                    break;
                case "ease-in":
                    value = math.ease_in(progress);
                    break;
                case "ease-out":
                    value = math.ease_out(progress);
                    break;
            }
            this._pos = anim.from.Clone().Lerp(anim.to, value);
            if(progress == 1) {
                this._moving.shift();
            }
        }
    }
}