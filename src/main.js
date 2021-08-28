import { Renderer, SceneManager, Scene, Loader, entity, drawable, Vector, board_entity, physics, player } from "./exporter.js";

class Game {
    constructor() {
        this._Init();
    }
    _InitBoard() {
        const gameScene =  new Scene({
            resources: this._resources
        });
        
        const board = new entity.Entity();
        
        const grid = new drawable.TicTacToeGrid({
            width: 420,
            height: 420,
            size: 15
        });
        board.AddComponent(grid);
        board.AddComponent(new physics.Box({
            width: grid._width,
            height: grid._height
        }), "body");
        board.AddComponent(new board_entity.BoardController());

        gameScene.SetInteractive(board);
        board.interactive.AddListener("mouseup", (params) => {
            if(board._scene._mouseMoved) {
                return;
            }

            if(gameScene._camera._scale != 2 && !gameScene._camera._scaling) {
                gameScene._camera.MoveTo(gameScene.mousedownPos, 500);
                gameScene._camera.ScaleTo(2, 500);
            }

            const controller = board.GetComponent("BoardController");
            controller.OnMouseup(params.x, params.y);
        });

        gameScene.Add(board, "board");

        gameScene.AddListener("mousedown", (params) => {
            gameScene._mouseMoved = false;
            gameScene.mousedownPos = new Vector(params.x, params.y);
        });
        gameScene.AddListener("mousemove", (params) => {
            if(params.mousePressed) {
                gameScene._mouseMoved = true;
                gameScene._camera.SetPosition(gameScene.mousedownPos.Clone().Add(gameScene._camera._pos.Clone().Sub(new Vector(params.x, params.y))));
            }
        });

        this._sceneManager.AddScene("main", gameScene);
    }
    _HandleMouseEvent(x, y, type) {
        const boundingRect = this._renderer.dimension;
        this._mouse.x = (x - boundingRect.left) / this._renderer.scale;
        this._mouse.y = (y - boundingRect.top) / this._renderer.scale;

        if (this._sceneManager.currentScene) {
            const pos = this._renderer.ApplyCamera(this._sceneManager.currentScene, this._mouse.x, this._mouse.y);
            this._sceneManager.currentScene._HandleListeners(type, {
                x: pos.x,
                y: pos.y,
                mousePressed: this._mouse.pressed
            });
        }
    }
    _InitListeners() {
        this._renderer._canvas.addEventListener(this._isTouchDevice ? "touchstart" : "mousedown", (e) => {
            if(e.changedTouches) e = e.changedTouches[0];

            this._mouse.pressed = true;
            this._HandleMouseEvent(e.pageX, e.pageY, "mousedown");
            
        });

        this._renderer._canvas.addEventListener(this._isTouchDevice ? "touchmove" : "mousemove", (e) => {
            if(e.changedTouches) e = e.changedTouches[0];

            this._HandleMouseEvent(e.pageX, e.pageY, "mousemove");
        });

        this._renderer._canvas.addEventListener(this._isTouchDevice ? "touchend" : "mouseup", (e) => {
            if(e.changedTouches) e = e.changedTouches[0];

            this._mouse.pressed = false;
            this._HandleMouseEvent(e.pageX, e.pageY, "mouseup");
        });

        this._renderer._container.addEventListener(this._eventByDevice, () => {
            if(this._sceneManager.currentScene) {
                this._sceneManager.currentScene.OnClick();
            }
        });
    }
    _Preload() {
        const loader = new Loader();
        loader
            .OnProgress((progress, obj) => {
                const percents = parseInt(progress * 100);
                document.querySelector(".progressBar_progress").style.width = percents + "%";
                document.getElementById("loadingProgress").textContent = percents + "%";
                console.log(`${percents}% ... ${obj.path}`);
            })
            .SetPath("res")
            .AddFont("mainFont", "fonts/Dylema.otf")
            .Load((data) => {

                this._resources = data;
                document.body.style.fontFamily = this._resources["mainFont"];
                document.body.style.fontSize = "24px";

                document.querySelector(".loadingText").textContent = "Done";
                document.querySelector(".loadingIntro").style.opacity = 0.25;
                setTimeout(() => {
                    document.querySelector(".loadingIntro").style.display = "none";
                }, 1000);

                this._RAF();
            });
    }
    _Init() {

        document.querySelector(".credit").style.display = "none";

        this._renderer = new Renderer(480, 720, document.querySelector(".gameContainer"), document.getElementById("game"));
        this._renderer.SetBgColor("rgb(255, 255, 255)");

        this._sceneManager = new SceneManager();

        this._InitBoard();

        this._isTouchDevice = "ontouchstart" in document;
        this._eventByDevice = navigator.userAgent.match(/ipod|ipad|iphone/i) ? "touchstart" : "click";
        this._mouse = {x: null, y: null, pressed: false};

        this._InitListeners();

        this._renderer._container.addEventListener(this._eventByDevice, () => {
            document.querySelector(".loadingText").textContent = "Loading...";
            this._Preload();
        }, {once: true});

        document.getElementById("playBtn").addEventListener(this._eventByDevice, () => {
            document.querySelector(".mainMenu").style.display = "none";
            this._sceneManager.PlayScene("main");
            this._sceneManager.currentScene._camera.Reset();
            const board = this._sceneManager.currentScene.Get("board");
            board.GetComponent("BoardController").Reset();
            board.GetComponent("BoardController").SetPlayerX(new player.Human("Player"));
            board.GetComponent("BoardController").SetPlayerO(new player.Bot("Bot"));
            board.GetComponent("BoardController").NextPlayer();
        });
        document.getElementById("playBtn2").addEventListener(this._eventByDevice, () => {
            document.querySelector(".mainMenu").style.display = "none";
            this._sceneManager.PlayScene("main");
            this._sceneManager.currentScene._camera.Reset();
            const board = this._sceneManager.currentScene.Get("board");
            board.GetComponent("BoardController").Reset();
            board.GetComponent("BoardController").SetPlayerX(new player.Human("Player 1"));
            board.GetComponent("BoardController").SetPlayerO(new player.Human("Player 2"));
            board.GetComponent("BoardController").NextPlayer();
        });

        document.getElementById("creditBtn").addEventListener(this._eventByDevice, () => {
            document.querySelector(".menuList").style.display = "none";
            document.querySelector(".credit").style.display = "block";
        });
        document.getElementById("backBtn").addEventListener(this._eventByDevice, () => {
            document.querySelector(".menuList").style.display = "block";
            document.querySelector(".credit").style.display = "none";
        });

        document.getElementById("zoom_out-btn").addEventListener(this._eventByDevice, () => {
            const camera = this._sceneManager.currentScene._camera;
            if(!camera._scaling) {
                camera.ScaleTo(1, 500);
            }
        });
        document.getElementById("zoom_in-btn").addEventListener(this._eventByDevice, () => {
            const camera = this._sceneManager.currentScene._camera;
            if(!camera._scaling) {
                camera.ScaleTo(2, 500);
            }
        });
        document.getElementById("give_up-btn").addEventListener(this._eventByDevice, () => {
            const board = this._sceneManager.currentScene.Get("board");
            board.GetComponent("BoardController").Reset();
            board.GetComponent("BoardController").NextPlayer();
        });
        document.getElementById("back-btn").addEventListener(this._eventByDevice, () => {
            document.querySelector(".mainMenu").style.display = "block";
            const board = this._sceneManager.PauseScene();
        });

    }
    _RAF() {
        window.requestAnimationFrame((timestep) => {
            if(!this._previousRAF) {
                this._previousRAF = timestep;
            }
            this._RAF();
            this._Step(timestep - this._previousRAF);
            this._renderer.Render(this._sceneManager.currentScene);
            this._previousRAF = timestep;
        });
    }
    _Step(elapsedTime) {
        const elapsedTimeS = Math.min(1 / 30, elapsedTime * 0.001);
        this._sceneManager.Update(elapsedTimeS);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    new Game();
});