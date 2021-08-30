import { SceneManager } from "./scene-manager.js";
import { Scene } from "./scene.js";

export class Renderer {
    _width: number;
    _height: number;
    _container: HTMLDivElement;
    _canvas: HTMLCanvasElement;
    _bgColor: string;
    scenes: SceneManager;
    _aspect: number;
    _scale: number;
    _context: CanvasRenderingContext2D;
    mouse: { x: number, y: number, pressed: boolean };
    constructor(width: number, height: number, container: HTMLDivElement, canvas: HTMLCanvasElement) {
        this._width = width;
        this._height = height;
        this._container = container;
        this._canvas = canvas;
        this._bgColor = "black";
        this.scenes = new SceneManager();
        this._Init();
    }
    _Init() {
        this._aspect = this._width / this._height;
        this._scale = 1.0;
        this._canvas.width = this._width;
        this._container.style.width = this._width + "px";
        this._canvas.height = this._height;
        this._container.style.height = this._height + "px";
        this._context = this._canvas.getContext("2d");
        
        this._OnResize();
        window.addEventListener("resize", () => {
            this._OnResize();
        });

        this.mouse = {x: null, y: null, pressed: false};

        this._InitEventListeners();

    }
    _HandleMouseEvent(x: number, y: number, type: string) {
        const boundingRect = this.dimension;
        this.mouse.x = (x - boundingRect.left) / this._scale;
        this.mouse.y = (y - boundingRect.top) / this._scale;

        if (this.scenes.currentScene) {
            const pos = this._ApplyCamera(this.scenes.currentScene, this.mouse.x, this.mouse.y);
            this.scenes.currentScene._HandleListeners(type, {
                x: pos.x,
                y: pos.y,
                mousePressed: this.mouse.pressed
            });
        }
    }
    _InitEventListeners() {

        const isTouchDevice = "ontouchstart" in document;
        const eventByDevice = navigator.userAgent.match(/ipod|ipad|iphone/i) ? "touchstart" : "click";

        this._canvas.addEventListener(isTouchDevice ? "touchstart" : "mousedown", (e) => {
            let x, y;
            if(e instanceof TouchEvent) {
                e = e as TouchEvent;
                x = e.changedTouches[0].pageX;
                y = e.changedTouches[0].pageY;
            } else {
                e = e as MouseEvent;
                x = e.pageX;
                y = e.pageY;
            }

            this.mouse.pressed = true;
            this._HandleMouseEvent(x, y, "mousedown");
            
        });

        this._canvas.addEventListener(isTouchDevice ? "touchmove" : "mousemove", (e) => {
            let x, y;
            if(e instanceof TouchEvent) {
                e = e as TouchEvent;
                x = e.changedTouches[0].pageX;
                y = e.changedTouches[0].pageY;
            } else {
                e = e as MouseEvent;
                x = e.pageX;
                y = e.pageY;
            }

            this._HandleMouseEvent(x, y, "mousemove");
        });

        this._canvas.addEventListener(isTouchDevice ? "touchend" : "mouseup", (e) => {
            let x, y;
            if(e instanceof TouchEvent) {
                e = e as TouchEvent;
                x = e.changedTouches[0].pageX;
                y = e.changedTouches[0].pageY;
            } else {
                e = e as MouseEvent;
                x = e.pageX;
                y = e.pageY;
            }

            this.mouse.pressed = false;
            this._HandleMouseEvent(x, y, "mouseup");
        });

        this._container.addEventListener(eventByDevice, () => {
            if(this.scenes.currentScene) {
                this.scenes.currentScene.OnClick();
            }
        });
    }
    _OnResize() {
        const [width, height] = [document.body.clientWidth, document.body.clientHeight];
        if(width / height > this._aspect) {
            this._scale = height / this._height;
        } else {
            this._scale = width / this._width;
        }
        this._container.style.transform = `translate(-50%, -50%) scale(${this._scale})`;
        this._context.imageSmoothingEnabled = false;
    }
    set bgColor(c: string) {
        this._bgColor = c;
    }
    Render() {
        const scene = this.scenes.currentScene;
        if(!scene) {
            return;
        }
        this._context.beginPath();
        this._context.fillStyle = this._bgColor;
        this._context.fillRect(0, 0, this._width, this._height);
        this._context.save();
        this._context.translate(-scene._camera._pos.x * scene._camera._scale + this._width / 2, -scene._camera._pos.y * scene._camera._scale + this._height / 2);
        this._context.scale(scene._camera._scale, scene._camera._scale);
        for(let elem of scene._drawable) {
            const pos = elem._pos.Clone();
            pos.Sub(scene._camera._pos);
            pos.Mult(scene._camera._scale);
            const [width, height] = [elem._width, elem._height].map((_) => _ * scene._camera._scale);
            if(
                pos.x + width / 2 < -this._width * 0.5 ||
                pos.x - width / 2 > this._width * 0.5 ||
                pos.y + height / 2 < -this._height * 0.5 ||
                pos.y - height / 2 > this._height * 0.5
            ) {
                continue;
            }
            elem.Draw(this._context);
        }
        this._context.restore();
    }
    get dimension() {
        return this._canvas.getBoundingClientRect();
    }
    get scale() {
        return this._scale;
    }
    _ApplyCamera(scene: Scene, x: number, y: number) {
        return {
            x: (x - this._width / 2) / scene._camera._scale + scene._camera._pos.x,
            y: (y - this._height / 2) / scene._camera._scale + scene._camera._pos.y
        };
    }
}