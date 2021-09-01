import { math } from "./math.js";
class Player {
    constructor(n) {
        this._name = n;
        this._symbol = "-";
        this._board = null;
    }
    Play() { }
}
class Human extends Player {
    constructor(n) {
        super(n);
    }
    OnInput(x, y) {
        this._board._Play(x, y);
    }
}
class Bot extends Player {
    constructor(n) {
        super(n);
    }
    Play() {
        const moves = this._Think();
        if (!moves.length) {
            return;
        }
        const selected = moves[math.randint(0, moves.length - 1)];
        this._board._Play(selected.x, selected.y);
    }
    _Think() {
        let bestMoves = [];
        let currentValue = 0;
        const winningCount = 5;
        for (let i = 0; i < this._board._size; ++i) {
            for (let j = 0; j < this._board._size; ++j) {
                const tile = this._board._board[i][j];
                const tileValue = {
                    "own4": 0,
                    "other4": 0,
                    "own3open": 0,
                    "own3": 0,
                    "own2open": 0,
                    "other3open": 0,
                    "other3": 0,
                    "other2open": 0,
                    "rest": 0,
                    "free": 0
                };
                if (tile.owner == -1) {
                    for (let pl = 0; pl < 2; ++pl) {
                        const symbol = pl == 0 ? "x" : "o";
                        for (let k = 0; k < 4; ++k) {
                            const l = (k + 4) % 8;
                            const free1 = tile._data[pl].free[k];
                            const free2 = tile._data[pl].free[l];
                            if (free1 + free2 + 1 >= winningCount) {
                                const connected1 = tile._data[pl].connected[k];
                                const connected2 = tile._data[pl].connected[l];
                                const connected = connected1 + connected2;
                                const bothSidesOpen = free1 > connected1 && free2 > connected2;
                                let count1 = 0, count2 = 0, count = 0;
                                let newBothSidesOpen = false;
                                if (connected1 < 3 && free1 > connected1 + 1) {
                                    let nextTile = tile._nb[k];
                                    while (nextTile && nextTile.owner == pl) {
                                        nextTile = nextTile._nb[k];
                                    }
                                    count1 = connected1 + nextTile._data[pl].connected[k];
                                }
                                if (connected2 < 3 && free2 > connected2 + 1) {
                                    let nextTile = tile._nb[l];
                                    while (nextTile && nextTile.owner == pl) {
                                        nextTile = nextTile._nb[l];
                                    }
                                    count2 = connected2 + nextTile._data[pl].connected[l];
                                }
                                if (connected1 + count2 > connected2 + count1) {
                                    count = connected1 + count2;
                                    newBothSidesOpen = bothSidesOpen && free2 > count2 + 1;
                                }
                                else {
                                    count = connected2 + count1;
                                    newBothSidesOpen = bothSidesOpen && free1 > count1 + 1;
                                }
                                if (connected >= 4)
                                    symbol == this._symbol ? ++tileValue["own4"] : ++tileValue["other4"];
                                else if (connected == 3 && bothSidesOpen)
                                    symbol == this._symbol ? ++tileValue["own3open"] : ++tileValue["other3open"];
                                else if (connected == 3 || (count >= 3))
                                    symbol == this._symbol ? ++tileValue["own3"] : ++tileValue["other3"];
                                else if ((connected == 2 && bothSidesOpen) || (count >= 2 && newBothSidesOpen))
                                    symbol == this._symbol ? ++tileValue["own2open"] : ++tileValue["other2open"];
                                let value = 0;
                                if (connected >= 4)
                                    value = 1000000;
                                else if (connected == 3 && bothSidesOpen)
                                    value = 500000;
                                else if (connected == 3 && symbol == this._symbol)
                                    value = 150000;
                                else if (connected == 3 && symbol != this._symbol)
                                    value = 100000;
                                else if (connected == 2 && bothSidesOpen)
                                    value = 80000;
                                else if (count >= 3)
                                    value = 75000;
                                else if (count == 2 && newBothSidesOpen)
                                    value = 50000;
                                else if (count == 2)
                                    value = 35000;
                                else if (connected == 1 && bothSidesOpen)
                                    value = 20000;
                                else if (count == 1 && newBothSidesOpen)
                                    value = 19000;
                                else if (connected == 2)
                                    value = 10000;
                                else if (count == 2)
                                    value = 5000;
                                else if (connected == 1)
                                    value = 200;
                                else if (count == 1)
                                    value = 100;
                                tileValue["rest"] += symbol == this._symbol ? value * 1.2 : value;
                                if (symbol == this._symbol)
                                    tileValue["free"] += free1 + free2;
                            }
                        }
                    }
                    const player = this._symbol == "x" ? 0 : 1;
                    let resultValue = 0;
                    if (tileValue["own4"] > 0)
                        resultValue = 5000000;
                    else if (tileValue["other4"] > 0)
                        resultValue = 4000000;
                    else if (tileValue["own3open"] > 0)
                        resultValue = 3000000;
                    else if (tileValue["own3"] > 0 && (tileValue["own3"] > 1 || tileValue["own2open"] > 0))
                        resultValue = 2000000;
                    else if ((tileValue["own3"] > 0 && tileValue["other3"] > 0) || ((tileValue["own3"] > 0 || tileValue["other3"] > 0) && (tileValue["own2open"] > 0 || tileValue["other2open"] > 0)))
                        resultValue = 40000;
                    else if (tileValue["own2open"] > 1)
                        resultValue = 20000;
                    else if (tileValue["other2open"] > 1)
                        resultValue = 16000;
                    else if (tileValue["own2open"] > 0 && tileValue["other2open"] > 0)
                        resultValue = 12000;
                    resultValue += tileValue["rest"];
                    resultValue += Math.floor(tileValue["free"] / 5);
                    if (!bestMoves.length || resultValue > currentValue) {
                        currentValue = resultValue;
                        bestMoves = [tile];
                    }
                    else if (resultValue == currentValue) {
                        bestMoves.push(tile);
                    }
                }
            }
        }
        return bestMoves;
    }
}
export { Player, Human, Bot };
