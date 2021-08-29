import { Component } from "./component.js";
import { Box } from "./physics.js";
import { Player } from "./player.js";
import { Vector } from "./vector.js";

type player = { player: Player, score: number }

class BoardController extends Component {
    mouseMoved: boolean;
    mousedownPosition: Vector;
    _size: number;
    _board: Tile[][];
    _selectedTile: Tile;
    _gameState: { winner: string, tiles: Tile[] }
    _players: player[];
    _startingPLayer: string;
    _playerOn: number;
    _moves: number;
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
            winner: "-",
            tiles: []
        };
        this._players = [null, null];
        this._startingPLayer = "o";
        this.playerOn = this._startingPLayer;
        this._moves = 0;

        for(let i = 0; i < this._size; ++i) {
            for(let j = 0; j < this._size; ++j) {
                const tile = this._board[i][j];
                if(j > 0 && i > 0) tile._nb[0] = this._board[i - 1][j - 1];
                if(i > 0) tile._nb[1] = this._board[i - 1][j];
                if(j < this._size - 1 && i > 0) tile._nb[2] = this._board[i - 1][j + 1];
                if(j < this._size - 1) tile._nb[3] = this._board[i][j + 1];
                if(j < this._size - 1 && i < this._size - 1) tile._nb[4] = this._board[i + 1][j + 1];
                if(i < this._size - 1) tile._nb[5] = this._board[i + 1][j];
                if(j > 0 && i < this._size - 1) tile._nb[6] = this._board[i + 1][j - 1];
                if(j > 0) tile._nb[7] = this._board[i][j - 1];
            }
        }

    }
    SetPlayerX(player: Player) {
        this._players[0] = {player: player, score: 0};
        player._symbol = "x";
        player._board = this;
        document.getElementById("playerX").textContent = player._name;
    }
    SetPlayerO(player: Player) {
        this._players[1] = {player: player, score: 0};
        player._symbol = "o";
        player._board = this;
        document.getElementById("playerO").textContent = player._name;
    }
    Insert(x: number, y: number, player: number) {
        const symbol = player == 0 ? "x" : "o";
        const otherSymbol = symbol == "x" ? "o" : "x";
        const otherPlayer = player == 0 ? 1 : 0;
        const tile = this._board[y][x];

        this._selectedTile = tile;

        tile.owner = symbol;
        for(let k = 0; k < 8; ++k) {
            const l = (k + 4) % 8;
        
            tile._data[player].free[k] = 0;
            tile._data[otherPlayer].free[k] = 0;

            let nextTile = tile._nb[k];
            while(nextTile && nextTile.owner != otherSymbol) {
                nextTile._data[player].connected[l] += 1 + tile._data[player].connected[l];
                if(nextTile.owner == "-") {
                    break;
                }
                nextTile = nextTile._nb[k];
            }
            nextTile = tile._nb[k];
            let n = 0;
            while(nextTile && nextTile.owner != symbol) {
                nextTile._data[otherPlayer].free[l] = n;
                ++n;
                nextTile = nextTile._nb[k];
            }
        }
        this._gameState = this._CheckWinner(x, y);
    }
    _CheckWinner(x: number, y: number) {
        const tile = this._board[y][x];
        const player = tile.owner == "x" ? 0 : 1;
        const winningCount = 5;
        for(let k = 0; k < 4; ++k) {
            const l = (k + 4) % 8;
            const count = 1 + tile._data[player].connected[k] + tile._data[player].connected[l];
            
            if(count >= winningCount) {
                const winningTiles = [tile];
                let nextTile = tile._nb[k];
                while(nextTile && nextTile.owner == tile.owner) {
                    winningTiles.push(nextTile);
                    nextTile = nextTile._nb[k];
                }
                nextTile = tile._nb[l];
                while(nextTile && nextTile.owner == tile.owner) {
                    winningTiles.push(nextTile);
                    nextTile = nextTile._nb[l];
                }
                return {
                    winner: tile.owner,
                    tiles: winningTiles
                }
            }
        }
        return {
            winner: "-",
            tiles: []
        };
    }
    Reset() {
        this._moves = 0;
        this._selectedTile = null;
        this._gameState = {
            winner: "-",
            tiles: []
        };

        for(let i = 0; i < this._size; ++i) {
            for(let j = 0; j < this._size; ++j) {
                const tile = this._board[i][j];
                tile.owner = "-";
                for(let data of tile._data) {
                    for(let k = 0; k < 8; ++k) {
                        data.connected[k] = 0;
                        let n = 0;
                        let nextTile = tile._nb[k];
                        while(nextTile) {
                            ++n;
                            nextTile = nextTile._nb[k];
                        }
                        data.free[k] = n;
                    }
                }
            }
        }
        this.TogglePlayers();
    }
    OnMouseup(mouseX: number, mouseY: number) {
        
        if(this._players[this._playerOn].player.constructor.name == "Bot" || this._gameState.winner != "-") {
            return;
        }
        const body = this.GetComponent("body") as Box;

        const x = Math.floor((mouseX + body._width / 2 - body._pos.x) / body._width * this._size);
        const y = Math.floor((mouseY + body._height / 2 - body._pos.y) / body._height * this._size);
        
        const tile = this._board[y][x];
        if(tile.owner != "-") {
            return;
        }
        if(this._selectedTile === null || this._selectedTile != tile) {
            this._selectedTile = tile;
        } else {
            this.Play(x, y);
        }
    }
    Play(x: number, y: number) {
        if(this._moves >= this._size * this._size) {
            return;
        }

        this.Insert(x, y, this._playerOn);
        ++this._moves;
        
        if(this._gameState.winner != "-") {
            return;
        }
        this.playerOn = this._playerOn == 0 ? "o" : "x";

        this.NextPlayer();
    }
    NextPlayer() {    
        this._players[this._playerOn].player.Play();
    }
    TogglePlayers() {
        this._startingPLayer = this._startingPLayer == "x" ? "o" : "x";
        this.playerOn = this._startingPLayer;
    }
    set playerOn(player: string) {
        this._playerOn = player == "x" ? 0 : 1;
        const otherPlayer = player == "x" ? "o" : "x";
        document.getElementById("player" + player.toUpperCase()).parentElement.classList.add("player_active");
        document.getElementById("player" + otherPlayer.toUpperCase()).parentElement.classList.remove("player_active");
    }
}

type data = {
    free: number[],
    connected: number[]
}

class Tile {
    x: number;
    y: number;
    owner: string;
    _data: data[];
    _nb: Tile[];
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.owner = "-";
        this._nb = [...new Array(8)].fill(null);
        this._data = [...new Array(2)].map((_: any) => {
            return {
                free: [...new Array(8)].fill(0),
                connected: [...new Array(8)].fill(0)
            };
        });
        
    }
}

export {
    BoardController,
    Tile
}