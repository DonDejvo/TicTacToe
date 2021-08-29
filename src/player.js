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
}
class Bot extends Player {
    constructor(n) {
        super(n);
    }
    Play() {
        if (this._board._moves >= this._board._size * this._board._size) {
            return;
        }
        let bestMoves = [];
        let currentValue = 0;
        const winningCount = 5;
        const otherSymbol = this._symbol == "x" ? "o" : "x";
        for (let i = 0; i < this._board._size; ++i) {
            for (let j = 0; j < this._board._size; ++j) {
                const tile = this._board._board[i][j];
                if (tile.owner == "-") {
                    const playerValues = [0, 0];
                    for (let pl = 0; pl < 2; ++pl) {
                        const symbol = pl == 0 ? "x" : "o";
                        for (let k = 0; k < 4; ++k) {
                            const l = (k + 4) % 8;
                            let value = 0;
                            const free1 = tile._data[pl].free[k];
                            const free2 = tile._data[pl].free[l];
                            if (free1 + free2 + 1 >= winningCount) {
                                const connected1 = tile._data[pl].connected[k];
                                const connected2 = tile._data[pl].connected[l];
                                const connected = connected1 + connected2;
                                const bothSidesOpen = free1 > connected1 && free2 > connected2;
                                let count1 = 0, count2 = 0, count = 0;
                                let newBothSidesOpen = false;
                                if (connected < 3) {
                                    if (connected1 < 3 && free1 > connected1 + 1) {
                                        let nextTile = tile._nb[k];
                                        while (nextTile && nextTile.owner == symbol) {
                                            nextTile = nextTile._nb[k];
                                        }
                                        count1 = connected1 + nextTile._data[pl].connected[k];
                                    }
                                    if (connected2 < 3 && free2 > connected2 + 1) {
                                        let nextTile = tile._nb[l];
                                        while (nextTile && nextTile.owner == symbol) {
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
                                }
                                if (connected >= 4)
                                    value = 1000000;
                                else if (connected == 3 && bothSidesOpen)
                                    value = 225000;
                                else if (connected == 3 && symbol == this._symbol)
                                    value = 175000;
                                else if (connected == 3 && symbol != this._symbol)
                                    value = 100000;
                                else if (count >= 3 && newBothSidesOpen)
                                    value = 80000;
                                else if (connected == 2 && bothSidesOpen)
                                    value = 75000;
                                else if (count >= 2 && newBothSidesOpen)
                                    value = 50000;
                                else if (count >= 2)
                                    value = 20000;
                                else if (connected == 1 && bothSidesOpen)
                                    value = 20000;
                                else if (count == 1 && newBothSidesOpen)
                                    value = 10000;
                                else if (connected == 2)
                                    value = 2000;
                                else if (count == 2)
                                    value = 1000;
                                else if (connected == 1)
                                    value = 200;
                                else if (count == 1)
                                    value = 100;
                                else
                                    value = free1 + free2 + 1;
                            }
                            playerValues[pl] += value;
                        }
                    }
                    const player = this._symbol == "x" ? 0 : 1;
                    let resultValue = playerValues[player] * 1.2 + playerValues[(player + 1) % 2];
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
        const selected = bestMoves[math.randint(0, bestMoves.length - 1)];
        setTimeout(() => {
            this._board.Play(selected.x, selected.y);
        }, 500);
    }
}
export { Player, Human, Bot };
