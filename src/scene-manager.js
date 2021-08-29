export class SceneManager {
    constructor() {
        this._currentScene = null;
        this._scenes = new Map();
    }
    AddScene(n, s) {
        this._scenes.set(n, s);
    }
    PlayScene(n) {
        this._currentScene = this._scenes.get(n);
        this._currentScene.Play();

    }
    PauseScene() {
        if(this._currentScene) {
            this._currentScene.Pause();
        }
    }
    Update(elapsedTimeS) {
        if(this._currentScene) {
            this._currentScene.Update(elapsedTimeS);
        }
    }
    get currentScene() {
        return this._currentScene;
    }
}