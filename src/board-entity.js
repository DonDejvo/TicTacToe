import { Component } from "./component.js";
import { Vector } from "./vector.js";
class BoardController extends Component {
    constructor() {
        super();
        this.mouseMoved = false;
        this.mousedownPosition = new Vector();
        this._Init();
    }
    _Init() {
        this._size = 15;
        this._board = [...new Array(this._size)].map((_, i) => [...new Array(this._size)].map((_, j) => new Tile(j, i)));
        this._selectedTile = null;
        this._gameState = {
            winner: -1,
            winningTiles: []
        };
        this._moves = [];
        this._players = [null, null];
        this._startingPlayer = 1;
        this._playerOn = this._startingPlayer;
        for (let i = 0; i < this._size; ++i) {
            for (let j = 0; j < this._size; ++j) {
                const tile = this._board[i][j];
                if (j > 0 && i > 0)
                    tile._nb[0] = this._board[i - 1][j - 1];
                if (i > 0)
                    tile._nb[1] = this._board[i - 1][j];
                if (j < this._size - 1 && i > 0)
                    tile._nb[2] = this._board[i - 1][j + 1];
                if (j < this._size - 1)
                    tile._nb[3] = this._board[i][j + 1];
                if (j < this._size - 1 && i < this._size - 1)
                    tile._nb[4] = this._board[i + 1][j + 1];
                if (i < this._size - 1)
                    tile._nb[5] = this._board[i + 1][j];
                if (j > 0 && i < this._size - 1)
                    tile._nb[6] = this._board[i + 1][j - 1];
                if (j > 0)
                    tile._nb[7] = this._board[i][j - 1];
            }
        }
    }
    _Insert(x, y, player) {
        const otherPlayer = player == 0 ? 1 : 0;
        const tile = this._board[y][x];
        this._selectedTile = tile;
        tile.owner = player;
        for (let k = 0; k < 8; ++k) {
            const l = (k + 4) % 8;
            tile._data[player].free[k] = 0;
            tile._data[otherPlayer].free[k] = 0;
            let nextTile = tile._nb[k];
            while (nextTile && nextTile.owner != otherPlayer) {
                nextTile._data[player].connected[l] += 1 + tile._data[player].connected[l];
                if (nextTile.owner == -1) {
                    break;
                }
                nextTile = nextTile._nb[k];
            }
            nextTile = tile._nb[k];
            let n = 0;
            while (nextTile && nextTile.owner != player) {
                nextTile._data[otherPlayer].free[l] = n;
                ++n;
                nextTile = nextTile._nb[k];
            }
        }
        this._AddMove(x, y, player);
        this._gameState = this._CheckWinner(x, y);
    }
    _AddMove(x, y, player) {
        this._moves.push({ x: x, y: y, player: player });
    }
    _CheckWinner(x, y) {
        const tile = this._board[y][x];
        const player = tile.owner;
        const winningCount = 5;
        for (let k = 0; k < 4; ++k) {
            const l = (k + 4) % 8;
            const count = 1 + tile._data[player].connected[k] + tile._data[player].connected[l];
            if (count >= winningCount) {
                const winningTiles = [tile];
                let nextTile = tile._nb[k];
                while (nextTile && nextTile.owner == tile.owner) {
                    winningTiles.push(nextTile);
                    nextTile = nextTile._nb[k];
                }
                nextTile = tile._nb[l];
                while (nextTile && nextTile.owner == tile.owner) {
                    winningTiles.push(nextTile);
                    nextTile = nextTile._nb[l];
                }
                return {
                    winner: tile.owner,
                    winningTiles: winningTiles
                };
            }
        }
        return {
            winner: -1,
            winningTiles: []
        };
    }
    _IsGameOver() {
        return this._gameState.winner != -1 && this._moves.length < Math.pow(this._size, 2);
    }
    _Play(x, y) {
        if (this._players[this._playerOn] == null) {
            return;
        }
        this._Insert(x, y, this._playerOn);
        if (!this._IsGameOver()) {
            this.playerOn = (this._playerOn + 1) % 2;
            this.NextPlayer();
        }
        else {
            ++this._players[this._playerOn].score;
            const camera = this._parent._scene._camera;
            camera.ScaleTo(1, 500);
            camera.MoveTo(new Vector(), 500);
        }
    }
    NextPlayer() {
        this._players[this._playerOn].player.Play();
    }
    SetPlayerX(player) {
        this._players[0] = { player: player, score: 0 };
        player._symbol = "x";
        player._board = this;
        document.getElementById("playerX").textContent = player._name;
    }
    SetPlayerO(player) {
        this._players[1] = { player: player, score: 0 };
        player._symbol = "o";
        player._board = this;
        document.getElementById("playerO").textContent = player._name;
    }
    Reset() {
        this._TogglePlayers();
        this.playerOn = this._startingPlayer;
        this._selectedTile = null;
        this._moves = [];
        this._gameState = {
            winner: -1,
            winningTiles: []
        };
        for (let i = 0; i < this._size; ++i) {
            for (let j = 0; j < this._size; ++j) {
                const tile = this._board[i][j];
                tile.owner = -1;
                for (let data of tile._data) {
                    for (let k = 0; k < 8; ++k) {
                        data.connected[k] = 0;
                        let n = 0;
                        let nextTile = tile._nb[k];
                        while (nextTile) {
                            ++n;
                            nextTile = nextTile._nb[k];
                        }
                        data.free[k] = n;
                    }
                }
            }
        }
    }
    _TogglePlayers() {
        this._startingPlayer = (this._startingPlayer + 1) % 2;
    }
    OnMouseup(mouseX, mouseY) {
        if (this._players[this._playerOn] == null) {
            return;
        }
        if (this._players[this._playerOn].player.constructor.name == "Human") {
            const body = this.GetComponent("body");
            const x = Math.floor((mouseX + body._width / 2 - body._pos.x) / body._width * this._size);
            const y = Math.floor((mouseY + body._height / 2 - body._pos.y) / body._height * this._size);
            const tile = this._board[y][x];
            if (tile.owner != -1) {
                return;
            }
            if (this._selectedTile === null || this._selectedTile != tile) {
                this._selectedTile = tile;
            }
            else {
                this._players[this._playerOn].player.OnInput(x, y);
                const camera = this._parent._scene._camera;
                camera.ScaleTo(1, 300);
            }
        }
    }
    set playerOn(player) {
        this._playerOn = player;
        const [symbol, otherSymbol] = player == 0 ? ["x", "o"] : ["o", "x"];
        document.getElementById("player" + symbol.toUpperCase()).parentElement.classList.add("player_active");
        document.getElementById("player" + otherSymbol.toUpperCase()).parentElement.classList.remove("player_active");
    }
}
class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.owner = -1;
        this._nb = [...new Array(8)].fill(null);
        this._data = [...new Array(2)].map((_) => {
            return {
                free: [...new Array(8)].fill(0),
                connected: [...new Array(8)].fill(0)
            };
        });
    }
}
export { BoardController, Tile };
