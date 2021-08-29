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
            if(board.mouseMoved) {
                return;
            }

            if(gameScene._camera._scale != 2 && !gameScene._camera.scaling) {
                gameScene._camera.MoveTo(board.mousedownPosition, 500);
                gameScene._camera.ScaleTo(2, 500);
            }

            const controller = board.GetComponent("BoardController");
            controller.OnMouseup(params.x, params.y);
        });

        gameScene.Add(board, "board");

        gameScene.AddListener("mousedown", (params) => {
            board.mouseMoved = false;
            board.mousedownPosition = new Vector(params.x, params.y);
        });
        gameScene.AddListener("mousemove", (params) => {
            if(params.mousePressed) {
                board.mouseMoved = true;
                gameScene._camera.SetPosition(board.mousedownPosition.Clone().Add(gameScene._camera._pos.Clone().Sub(new Vector(params.x, params.y))));
            }
        });

        this._renderer.scenes.AddScene("main", gameScene);
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

        this._eventByDevice = navigator.userAgent.match(/ipod|ipad|iphone/i) ? "touchstart" : "click";

        document.querySelector(".credit").style.display = "none";

        this._renderer = new Renderer(480, 720, document.querySelector(".gameContainer"), document.getElementById("game"));
        this._renderer.bgColor = "rgb(255, 255, 255)";

        this._InitBoard();

        this._renderer._container.addEventListener(this._eventByDevice, () => {
            document.querySelector(".loadingText").textContent = "Loading...";
            this._Preload();
        }, {once: true});

        document.getElementById("playBtn").addEventListener(this._eventByDevice, () => {
            document.querySelector(".mainMenu").style.display = "none";
            this._renderer.scenes.PlayScene("main");
            this._renderer.scenes.currentScene._camera.Reset();
            const board = this._renderer.scenes.currentScene.Get("board");
            board.GetComponent("BoardController").Reset();
            board.GetComponent("BoardController").SetPlayerX(new player.Human("Player"));
            board.GetComponent("BoardController").SetPlayerO(new player.Bot("Bot"));
            board.GetComponent("BoardController").NextPlayer();
        });
        document.getElementById("playBtn2").addEventListener(this._eventByDevice, () => {
            document.querySelector(".mainMenu").style.display = "none";
            this._renderer.scenes.PlayScene("main");
            this._renderer.scenes.currentScene._camera.Reset();
            const board = this._renderer.scenes.currentScene.Get("board");
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
            const camera = this._renderer.scenes.currentScene._camera;
            if(!camera.scaling) {
                camera.ScaleTo(1, 500);
            }
        });
        document.getElementById("zoom_in-btn").addEventListener(this._eventByDevice, () => {
            const camera = this._renderer.scenes.currentScene._camera;
            if(!camera.scaling) {
                camera.ScaleTo(2, 500);
            }
        });
        document.getElementById("give_up-btn").addEventListener(this._eventByDevice, () => {
            const board = this._renderer.scenes.currentScene.Get("board");
            board.GetComponent("BoardController").Reset();
            board.GetComponent("BoardController").NextPlayer();
        });
        document.getElementById("back-btn").addEventListener(this._eventByDevice, () => {
            document.querySelector(".mainMenu").style.display = "block";
            const board = this._renderer.scenes.PauseScene();
        });

    }
    _RAF() {
        window.requestAnimationFrame((timestep) => {
            if(!this._previousRAF) {
                this._previousRAF = timestep;
            }
            this._RAF();
            this._Step(timestep - this._previousRAF);
            this._renderer.Render();
            this._previousRAF = timestep;
        });
    }
    _Step(elapsedTime) {
        const elapsedTimeS = Math.min(1 / 30, elapsedTime * 0.001);
        this._renderer.scenes.Update(elapsedTimeS);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    new Game();
});