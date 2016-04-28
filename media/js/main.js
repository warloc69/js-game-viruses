function GameManager() {
    // 8 -tablets, 1 = green_virus, 2 - red_virus, 3 - lilov_virus , 4 - blue_virus, 5 - black-virus
    var _this = this;
    this.pillows = [];
    this.viruses = [];
    this.canvas = null;
    this.blockSize = 80;
    this.width = 10;
    this.height = 10;
    this.interval = null;
    this.virus_count = 0;
    this.items_field = [
        0, 0, 0, 0, 8, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
        0, 5, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 3, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 1, 0, 0, 0, 0, 0, 0, 4
    ];

    this.initLevel = function () {
        this.canvas = document.getElementById('canvas');
        this.makeGameObjects();
        this.virus_count = this.viruses.length;
    };

    this.makeGameObjects = function () {
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var index = this.height * i + j;
                if (this.items_field[index] != 0) {
                    var gameObject = this.create(this.items_field[index], {
                        x: this.blockSize * j,
                        y: this.blockSize * i
                    }, index);
                    if (this.items_field[index] > 7) {
                        this.pillows = this.pillows.concat(gameObject);
                    } else {
                        this.viruses = this.viruses.concat(gameObject);
                    }
                    gameObject.forEach(function (item) {
                        _this.canvas.appendChild(item.make());
                    });

                }
            }
        }
        this.addKeyEvent();
    };

    this.gameOver = function (success) {
        clearInterval(this.interval);
        if (success == true) {
            alert("You are Win");
        } else {
            alert("Game Over... Luser!");
        }
    };

    this.startGame = function () {
        this.initLevel();
        this.interval = setInterval(this.render, 1000);
    };

    this.addKeyEvent = function () {
        document.addEventListener("keydown", function (event) {
            var game_object = _this.pillows[_this.pillows.length - 2];
            var pair = null;
            if (event.keyCode == 80 /* P - pause*/) {
                clearInterval(_this.interval);
            }
            if (event.keyCode == 83  /* S - start*/) {
                _this.interval = setInterval(_this.render, 1000);
            }
            if (event.keyCode == 37  /* left */ && game_object != undefined) {
                pair = game_object.pair;
                if (pair != null && pair.active != false && pair != null && _this.items_field[game_object.index - 1] == 0 && game_object.position.x > 0) {
                    _this.items_field[game_object.index] = 9;
                    _this.items_field[game_object.index - 1] = 8;
                    _this.items_field[game_object.index + 1] = 0;
                    game_object.moveLeft();
                    game_object.refresh();
                    pair.moveLeft();
                    pair.refresh();

                }
            }
            if (event.keyCode == 39 /* right */ && game_object != undefined) {
                pair = game_object.pair;
                if (pair != null && pair.active != false && pair != null && _this.items_field[game_object.index + 2] == 0 && game_object.position.x < 640) {
                    _this.items_field[game_object.index] = 0;
                    _this.items_field[game_object.index + 1] = 8;
                    _this.items_field[game_object.index + 2] = 9;
                    game_object.moveRight();
                    game_object.refresh();
                    pair.moveRight();
                    pair.refresh();
                }
            }
        });
    };

    this.getGOByIndex = function (index) {
        var game_object = null;
        _this.viruses.forEach(function (item) {
            if (item.index == index) {
                game_object = item;
            }
        });
        _this.pillows.forEach(function (item) {
            if (item.index == index) {
                game_object = item;
            }
        });
        return game_object;
    };

    this.makePillow = function () {
        var gm = true;
        for (i = 1; i <= 10; i++) {
            if (_this.items_field[14 * i] != 0 || _this.items_field[15 * i] != 0) {
                if (_this.items_field[14 * i] < 7) break;
            } else {
                gm = false;
            }
        }
        if (gm == true) {
            _this.gameOver();
        }
        _this.pillows.forEach(function (item) {
           item.active = false;
            var pair = item.pair;
            if(pair != null )
                pair.active = false;
        });
        for (var i = 1; i <= 2; i++) {
            var pillow = this.create(7 + i, {
                x: this.blockSize * 3 + this.blockSize * i,
                y: 0
            });
            this.pillows = this.pillows.concat(pillow);
            pillow.forEach(function (item) {
                _this.canvas.appendChild(item.make());
            });
        }
    };

    this.distroyGOIfNeed = function () {
        _this.pillows.forEach(function (item) {
            if (item.readyToDestroy == true) {
                if (_this.pillows[item.getid()].mustBeRestored == true) {
                    var pair = _this.pillows[item.getid()].pair;
                    if(pair != null )
                        pair.mustBeRestored = false;
                    _this.makePillow();
                }
                _this.items_field[item.index] = 0;
                _this.pillows[item.getid()].destroy();
                delete  _this.pillows[item.getid()];
            }
        });
        _this.viruses.forEach(function (item) {
            if (item.readyToDestroy == true) {
                _this.items_field[item.index] = 0;
                _this.viruses[item.getid()].destroy();
                delete  _this.viruses[item.getid()];
                _this.virus_count--;
                if (_this.virus_count <= 0) {
                    _this.gameOver(true);
                }
            }
        });
    };

    this.create = function (type, position, index) {
        var items = [];
        switch (type) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                items.push(new Virus(type, _this.viruses.length, position, index));
                break;
            case 8:
                var left = new Pillow(8, _this.pillows.length, position, index);
                var right = new Pillow(9, _this.pillows.length + 1, {
                    x: position.x + _this.blockSize,
                    y: position.y
                }, index + 1);
                left.pair = right;
                right.pair = left;
                items.push(left);
                items.push(right);
                break;
        }
        return items;
    };

    this.render = function () {
        _this.pillows.forEach(function (item) {
            var x = item.position.x / _this.blockSize;
            var y = item.position.y / _this.blockSize;
            var index = _this.height * (y + 1) + x;
            var pair = item.pair;
            if (_this.items_field[index] == 0) {
                if (pair == null || pair.type == 8) {
                    _this.items_field[index] = item.type;
                    _this.items_field[item.index] = 0;
                    item.down();
                    item.index = index;
                    item.refresh();
                } else {
                    var pair_x = pair.position.x / _this.blockSize;
                    var pair_y = pair.position.y / _this.blockSize;
                    var index_pair = _this.height * (pair_y + 1) + pair_x;
                    if (_this.items_field[index_pair] == 0) {
                        _this.items_field[index] = item.type;
                        _this.items_field[item.index] = 0;
                        item.down();
                        item.index = index;
                        item.refresh();
                    }
                }
            } else {
                if (pair!= null && pair.active == true && item.active == true ) {
                    _this.makePillow();
                }
                item.active = false;
                if (pair != null) {
                    pair.active = false;
                    pair_x = pair.position.x / _this.blockSize;
                    pair_y = pair.position.y / _this.blockSize;
                    index_pair = _this.height * (pair_y + 1) + pair_x;
                    if (_this.getGOByIndex(index_pair) != null && pair.getType() == _this.getGOByIndex(index_pair).getType()) {
                        pair.readyToDestroy = true;
                        _this.getGOByIndex(index_pair).readyToDestroy = true;
                    } else {
                        pair.pair = null;
                    }
                }
                if (_this.getGOByIndex(index) != null && item.getType() == _this.getGOByIndex(index).getType()) {
                    item.readyToDestroy = true;
                    _this.getGOByIndex(index).readyToDestroy = true;
                } else {
                    item.pair = null;
                }

            }
        });
        _this.distroyGOIfNeed();
    };


}

function Pillow(type, id, position, index) {
    this.getid = function () {
        return id;
    };
    this.getType = function () {
        return this.pillow_type;
    };
    this.pair = null;
    this.active = true;
    this.mustBeRestored = false;
    this.index = index;
    this.type = type;
    this.readyToDestroy = false;
    this.position = position;
}

function Virus(type, id, position, index) {
    this.getType = function () {
        return type;
    };
    this.index = index;
    this.position = position;
    this.getid = function () {
        return id;
    };
}

function GameObject() {
}

GameObject.prototype = Object.create(
    Object.prototype, {
        constructor: {
            value: GameObject,
            writable: true,
            enumerable: true,
            configurable: true
        },
        blockSize: {
            value: 80,
            writable: false,
            configurable: false
        },
        destroy: {
            value: function () {
                this.item.parentNode.removeChild(this.item);
            }
        }
    }
);

Pillow.prototype = Object.create(
    GameObject.prototype, {
        constructor: {
            value: Pillow,
            writable: true,
            enumerable: true,
            configurable: true
        },
        make: {
            value: function () {
                this.item = document.createElement('div');
                this.item.id = 'pillow-' + this.getid();
                this.item.style.left = this.position.x + 'px';
                this.item.style.top = this.position.y + 'px';
                var side = this.type == 8 ? 'left' : 'right';
                this.pillow_type = Math.floor(Math.random() * 5) + 1;
                switch (this.pillow_type) {
                    case 1:
                        this.item.className = 'green-pillow-' + side;
                        break;
                    case 2:
                        this.item.className = 'red-pillow-' + side;
                        break;
                    case 3:
                        this.item.className = 'lilov-pillow-' + side;
                        break;
                    case 4:
                        this.item.className = 'blue-pillow-' + side;
                        break;
                    case 5:
                        this.item.className = 'black-pillow-' + side;
                        break;
                }
                return this.item;
            }
        },
        refresh: {
            value: function () {
                this.item.style.left = this.position.x + 'px';
                this.item.style.top = this.position.y + 'px';
            }
        },
        down: {
            value: function () {
                this.position.y += 80;
                if (this.position.y >= 720) {
                    this.readyToDestroy = true;
                    this.mustBeRestored = true;
                }
            }
        },
        moveLeft: {
            value: function () {
                this.position.x -= this.blockSize;
                this.index--;
            }
        },
        moveRight: {
            value: function () {
                this.position.x += this.blockSize;
                this.index++;
            }
        }
    }
)
;

Virus.prototype = Object.create(
    GameObject.prototype, {
        constructor: {
            value: Virus,
            writable: true,
            enumerable: true,
            configurable: true
        },
        make: {
            value: function () {
                this.item = document.createElement('div');
                this.item.id = 'virus-' + this.getid();
                switch (this.getType()) {
                    case 1:
                        this.item.className = 'green-virus';
                        break;
                    case 2:
                        this.item.className = 'red-virus';
                        break;
                    case 3:
                        this.item.className = 'lilov-virus';
                        break;
                    case 4:
                        this.item.className = 'blue-virus';
                        break;
                    case 5:
                        this.item.className = 'black-virus';
                        break;
                }
                this.item.style.left = this.position.x + 'px';
                this.item.style.top = this.position.y + 'px';
                return this.item;
            }
        }
    }
);

function init() {
    new GameManager(100, 800, 1000).startGame();
}


document.addEventListener("DOMContentLoaded", init);