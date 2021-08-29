import { Scene } from "./scene.js";

export class SceneManager {
    _currentScene: Scene;
    _scenes: Map<string, Scene>;
    constructor() {
        this._currentScene = null;
        this._scenes = new Map();
    }
    AddScene(n: string, s: Scene) {
        this._scenes.set(n, s);
    }
    PlayScene(n: string) {
        this._currentScene = this._scenes.get(n);
        this._currentScene.Play();

    }
    PauseScene() {
        if(this._currentScene) {
            this._currentScene.Pause();
        }
    }
    Update(elapsedTimeS: number) {
        if(this._currentScene) {
            this._currentScene.Update(elapsedTimeS);
        }
    }
    get currentScene() {
        return this._currentScene;
    }
}