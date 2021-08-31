import { Renderer, Scene, physics, Entity, drawable, BoardController, Vector, Loader, player } from "./exporter.js";
class Game {
    constructor() {
        this._Init();
    }
    _InitBoard() {
        const gameScene = new Scene({
            resources: this._resources
        });
        const board = new Entity();
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
        const boardController = new BoardController();
        board.AddComponent(boardController);
        gameScene.SetInteractive(board);
        board.interactive.AddListener("mouseup", (params) => {
            if (boardController.mouseMoved) {
                return;
            }
            if (gameScene._camera._scale != 2 && !gameScene._camera.scaling) {
                gameScene._camera.MoveTo(boardController.mousedownPosition, 500);
                gameScene._camera.ScaleTo(2, 500);
            }
            boardController.OnMouseup(params.x, params.y);
        });
        gameScene.Add(board, "board");
        gameScene.AddListener("mousedown", (params) => {
            boardController.mouseMoved = false;
            boardController.mousedownPosition = new Vector(params.x, params.y);
        });
        gameScene.AddListener("mousemove", (params) => {
            if (params.mousePressed) {
                boardController.mouseMoved = true;
                gameScene._camera.SetPosition(boardController.mousedownPosition.Clone().Add(gameScene._camera._pos.Clone().Sub(new Vector(params.x, params.y))));
            }
        });
        this._renderer.scenes.AddScene("main", gameScene);
    }
    _Preload() {
        const loader = new Loader();
        loader
            .OnProgress((progress, obj) => {
            const percents = progress * 100;
            document.querySelector(".progressBar_progress").style.width = percents + "%";
            document.getElementById("loadingProgress").textContent = percents + "%";
        })
            .SetPath("res")
            .AddFont("mainFont", "fonts/Dylema.otf")
            .Load((data) => {
            this._resources = data;
            document.body.style.fontFamily = this._resources.get("mainFont");
            document.body.style.fontSize = "24px";
            document.querySelector(".loadingText").textContent = "Done";
            document.querySelector(".loadingIntro").style.opacity = "0.25";
            setTimeout(() => {
                document.querySelector(".loadingIntro").style.display = "none";
            }, 1000);
            this._RAF();
        });
    }
    _Init() {
        const eventByDevice = navigator.userAgent.match(/ipod|ipad|iphone/i) ? "touchstart" : "click";
        document.querySelector(".credit").style.display = "none";
        document.querySelector(".info").style.display = "none";
        this._renderer = new Renderer(480, 720, document.querySelector(".gameContainer"), document.getElementById("game"));
        this._renderer.bgColor = "rgb(255, 255, 255)";
        this._InitBoard();
        this._renderer._container.addEventListener(eventByDevice, () => {
            document.querySelector(".loadingText").textContent = "Loading...";
            this._Preload();
        }, { once: true });
        const StartGame = (playerX, playerY) => {
            document.querySelector(".mainMenu").style.display = "none";
            this._renderer.scenes.PlayScene("main");
            this._renderer.scenes.currentScene._camera.Reset();
            const boardController = this._renderer.scenes.currentScene.Get("board").GetComponent("BoardController");
            boardController.Reset();
            boardController.SetPlayerX(playerX);
            boardController.SetPlayerO(playerY);
            boardController.NextPlayer();
        };
        document.getElementById("playBtn").addEventListener(eventByDevice, () => {
            StartGame(new player.Human("Player"), new player.Bot("Bot"));
        });
        document.getElementById("playBtn2").addEventListener(eventByDevice, () => {
            StartGame(new player.Human("Player 1"), new player.Human("Player 2"));
        });
        document.getElementById("creditBtn").addEventListener(eventByDevice, () => {
            document.querySelector(".menuList").style.display = "none";
            document.querySelector(".credit").style.display = "block";
        });
        document.getElementById("infoBtn").addEventListener(eventByDevice, () => {
            document.querySelector(".info").style.display = "block";
        });
        document.getElementById("backBtn-info").addEventListener(eventByDevice, () => {
            document.querySelector(".info").style.display = "none";
        });
        document.getElementById("backBtn").addEventListener(eventByDevice, () => {
            document.querySelector(".menuList").style.display = "block";
            document.querySelector(".credit").style.display = "none";
        });
        document.getElementById("zoom_out-btn").addEventListener(eventByDevice, () => {
            const camera = this._renderer.scenes.currentScene._camera;
            if (!camera.scaling) {
                camera.ScaleTo(1, 500);
            }
        });
        document.getElementById("zoom_in-btn").addEventListener(eventByDevice, () => {
            const camera = this._renderer.scenes.currentScene._camera;
            if (!camera.scaling) {
                camera.ScaleTo(2, 500);
            }
        });
        document.getElementById("give_up-btn").addEventListener(eventByDevice, () => {
            const boardController = this._renderer.scenes.currentScene.Get("board").GetComponent("BoardController");
            boardController.Reset();
            boardController.NextPlayer();
            this._renderer.scenes.currentScene._camera.Reset();
        });
        document.getElementById("back-btn").addEventListener(eventByDevice, () => {
            document.querySelector(".mainMenu").style.display = "block";
            this._renderer.scenes.PauseScene();
            const boardController = this._renderer.scenes.currentScene.Get("board").GetComponent("BoardController");
            boardController._players = [null, null];
        });
    }
    _RAF() {
        window.requestAnimationFrame((timestep) => {
            if (!this._previousRAF) {
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
