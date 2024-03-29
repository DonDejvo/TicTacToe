import { Component } from "./component.js";
class Drawable extends Component {
    constructor(params) {
        super();
        this._type = "drawable";
        this._params = params;
        this._width = this._params.width;
        this._height = this._params.height;
        this._zIndex = (this._params.zIndex || 0);
        this._flip = {
            x: (this._params.flipX || false),
            y: (this._params.flipY || false)
        };
        this._opacity = this._params.opacity !== undefined ? this._params.opacity : 1;
    }
    InitComponent() {
        this._pos = this._parent._pos;
    }
    SetSize(w, h) {
        this._width = w;
        this._height = h;
    }
    Draw(_) { }
}
class Text extends Drawable {
    constructor(params) {
        super(params);
        this._text = this._params.text;
        this._fontSize = this._params.fontSize;
        this._fontFamily = (this._params.fontFamily || "Arial");
    }
    Draw(ctx) {
        ctx.fillStyle = this._params.color;
        ctx.font = `${this._fontSize}px '${this._fontFamily}'`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this._text, this._pos.x, this._pos.y);
    }
}
class Picture extends Drawable {
    constructor(params) {
        super(params);
        this._frameWidth = (this._params.frameWidth || this._width);
        this._frameHeight = (this._params.frameHeight || this._height);
        this._framePos = {
            x: (this._params.posX || 0),
            y: (this._params.posY || 0)
        };
    }
    Draw(ctx) {
        ctx.save();
        ctx.translate(this._pos.x, this._pos.y);
        ctx.scale(this._flip.x ? -1 : 1, this._flip.y ? -1 : 1);
        ctx.drawImage(this._params.image, this._framePos.x * this._frameWidth, this._framePos.y * this._frameHeight, this._frameWidth, this._frameHeight, -this._width / 2, -this._height / 2, this._width, this._height);
        ctx.restore();
    }
}
class TicTacToeGrid extends Drawable {
    constructor(params) {
        super(params);
        this._size = this._params.size;
        this._cellWidth = this._width / this._size;
        this._cellHeight = this._height / this._size;
    }
    Draw(ctx) {
        ctx.beginPath();
        ctx.save();
        ctx.translate(this._pos.x, this._pos.y);
        ctx.translate(-this._width / 2, -this._height / 2);
        const controller = this.GetComponent("BoardController");
        if (controller._gameState.winner != -1) {
            for (let tile of controller._gameState.winningTiles) {
                ctx.fillStyle = "yellow";
                ctx.fillRect(tile.x * this._cellWidth, tile.y * this._cellHeight, this._cellWidth, this._cellHeight);
            }
        }
        if (controller._selectedTile) {
            ctx.fillStyle = "yellow";
            ctx.fillRect(controller._selectedTile.x * this._cellWidth, controller._selectedTile.y * this._cellHeight, this._cellWidth, this._cellHeight);
        }
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        for (let i = 0; i <= this._size; ++i) {
            const x = i * this._cellWidth;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this._height);
            const y = i * this._cellHeight;
            ctx.moveTo(0, y);
            ctx.lineTo(this._width, y);
        }
        ctx.stroke();
        for (let i = 0; i < this._size; ++i) {
            for (let j = 0; j < this._size; ++j) {
                switch (controller._board[i][j].owner) {
                    case 0:
                        this._DrawX(ctx, j, i);
                        break;
                    case 1:
                        this._DrawO(ctx, j, i);
                        break;
                }
            }
        }
        ctx.restore();
    }
    _DrawX(ctx, x, y) {
        ctx.beginPath();
        ctx.save();
        ctx.translate((x + 0.5) * this._cellWidth, (y + 0.5) * this._cellHeight);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        const r = 0.3;
        ctx.moveTo(-this._cellWidth * r, -this._cellHeight * r);
        ctx.lineTo(this._cellWidth * r, this._cellHeight * r);
        ctx.moveTo(this._cellWidth * r, -this._cellHeight * r);
        ctx.lineTo(-this._cellWidth * r, this._cellHeight * r);
        ctx.stroke();
        ctx.restore();
    }
    _DrawO(ctx, x, y) {
        ctx.beginPath();
        ctx.save();
        ctx.translate((x + 0.5) * this._cellWidth, (y + 0.5) * this._cellHeight);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        const r = 0.3;
        ctx.arc(0, 0, this._cellWidth * r, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }
}
export { Drawable, Text, Picture, TicTacToeGrid };
