"use strict";

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// taken from https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
function easeOutBack(t, s) {
    if (s == undefined) s = 1.70158;
    return (t = t - 1) * t * ((s + 1) * t + s) + 1;
}

// base class of all renderable objects, handles hovering and clicking

var GameObject = function () {
    function GameObject(game) {
        _classCallCheck(this, GameObject);

        this.game = game;
        game.add(this);
    }

    _createClass(GameObject, [{
        key: "destroy",
        value: function destroy() {
            this.game.remove(this);
        }
    }, {
        key: "contains",
        value: function contains(pos) {
            if (this.BBox === null) return false;

            var x = pos.x,
                y = pos.y;

            return x >= this.BBox.x && y >= this.BBox.y && x <= this.BBox.x + this.BBox.width && y <= this.BBox.y + this.BBox.height;
        }
    }, {
        key: "collides",
        value: function collides(obj) {
            if (obj.contains({ x: this.BBox.x + this.BBox.width / 2, y: this.BBox.y }) || obj.contains({ x: this.BBox.x + this.BBox.width / 2, y: this.BBox.y + this.BBox.height })) return "y";
            if (obj.contains({ x: this.BBox.x, y: this.BBox.y }) && obj.contains({ x: this.BBox.x, y: this.BBox.y + this.BBox.height }) || obj.contains({ x: this.BBox.x + this.BBox.width, y: this.BBox.y }) && obj.contains({ x: this.BBox.x + this.BBox.width, y: this.BBox.y + this.BBox.height })) return "x";
            if (obj.contains({ x: this.BBox.x, y: this.BBox.y }) || obj.contains({ x: this.BBox.x + this.BBox.width, y: this.BBox.y }) || obj.contains({ x: this.BBox.x, y: this.BBox.y + this.BBox.height }) || obj.contains({ x: this.BBox.x + this.BBox.width, y: this.BBox.y + this.BBox.height })) return "y";

            // if ((this.BBox.x < obj.BBox.x + obj.BBox.width && this.BBox.x > obj.BBox.x) ||
            //     (this.BBox.x + this.BBox.width > obj.BBox.x && this.BBox.x + this.BBox.width < obj.BBox.x + obj.BBox.x))
            //     return "x";
            // if ((this.BBox.y < obj.BBox.y + obj.BBox.height && this.BBox.y > obj.BBox.y) ||
            //     (this.BBox.y + this.BBox.height > obj.BBox.y && this.BBox.y + this.BBox.height < obj.BBox.y + obj.BBox.y))
            //    return "y";
            return null;
        }
    }, {
        key: "click",
        value: function click() {}
    }, {
        key: "update",
        value: function update(ctx, delta) {}
    }, {
        key: "BBox",
        get: function get() {
            return null;
        }
    }, {
        key: "hovering",
        get: function get() {
            return this.contains(this.game.mousePos);
        }
    }]);

    return GameObject;
}();

var Paddle = function (_GameObject) {
    _inherits(Paddle, _GameObject);

    function Paddle(game) {
        _classCallCheck(this, Paddle);

        var _this = _possibleConstructorReturn(this, (Paddle.__proto__ || Object.getPrototypeOf(Paddle)).call(this, game));

        _this.posx = _this.game.canvas.width / 2;
        _this.speed = 0;
        _this.width = 250;
        _this.blur_start = +new Date() - 1000;
        return _this;
    }

    _createClass(Paddle, [{
        key: "update",
        value: function update(ctx, delta) {
            this.speed *= 0.9;
            if (this.game.pressed["ArrowLeft"]) this.speed -= delta / 5;else if (this.game.pressed["ArrowRight"]) this.speed += delta / 5;
            this.posx = Math.max(this.width / 2, Math.min(this.game.canvas.width - this.width / 2, this.posx + this.speed));

            ctx.shadowColor = "rgba(255,255,255," + Math.min(1, Math.max(0, 1 - (+new Date() - this.blur_start) / 1000)) + ")";
            ctx.shadowBlur = +new Date() - this.blur_start;
            ctx.lineWidth = 30;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#fafafa";

            ctx.beginPath();
            ctx.moveTo(this.posx - this.width / 2 + 15, this.game.canvas.height - 100);
            ctx.lineTo(this.posx + this.width / 2 - 15, this.game.canvas.height - 100);
            ctx.stroke();

            ctx.shadowBlur = 0;
        }
    }, {
        key: "BBox",
        get: function get() {
            return {
                x: this.posx - this.width / 2,
                y: this.game.canvas.height - 115,
                width: this.width,
                height: 30
            };
        }
    }]);

    return Paddle;
}(GameObject);

var Ball = function (_GameObject2) {
    _inherits(Ball, _GameObject2);

    function Ball(game) {
        _classCallCheck(this, Ball);

        var _this2 = _possibleConstructorReturn(this, (Ball.__proto__ || Object.getPrototypeOf(Ball)).call(this, game));

        _this2.pos = { x: _this2.game.canvas.width / 2, y: _this2.game.canvas.height / 2 };
        _this2.nspeed = 20;
        _this2.speed = { x: (Math.random() - 0.5) * 5, y: _this2.nspeed };
        _this2.trail = [];
        _this2.death_start = -1;
        _this2.bounce_sound = new Audio('bounce.wav');
        _this2.death_sound = new Audio('death.wav');
        _this2.win_sound = new Audio('win.wav');
        return _this2;
    }

    _createClass(Ball, [{
        key: "click",
        value: function click() {
            var nspeed = this.nspeed;
            if (this.game.end) game = new Game(document.getElementById('canvas'));
            if (this.game.lives >= 0) {
                game.ball.nspeed = nspeed + 7;
                game.ball.speed.y = game.ball.nspeed;
            }
        }
    }, {
        key: "update",
        value: function update(ctx, delta) {
            if (this.game.pressed["Enter"]) this.click();

            if (this.death_start !== -1) {
                var death_time = +new Date() - this.death_start;

                ctx.fillStyle = "#fafafa";
                ctx.shadowBlur = 50;
                ctx.beginPath();

                if (death_time < 500) ctx.arc(this.pos.x, this.pos.y, Math.pow(death_time / 10 + 4, 2), 0, Math.PI * 2);else if (this.game.end) {
                    if (this.hovering) document.body.style.cursor = "pointer";

                    ctx.arc(this.pos.x, this.pos.y, 10000, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = Math.max(Math.min((death_time - 500) / 2000, 1), 0);
                    ctx.textAlign = "center";
                    ctx.fillStyle = "#212121";
                    ctx.font = "500px FontAwesome";
                    if (this.game.lives < 0) ctx.fillText("\uF00D", 1000, 600);else ctx.fillText("\uF091", 1000, 600);
                    ctx.font = "200px FontAwesome";
                    if (this.game.lives < 0) ctx.fillText("\uF021", 1000, 1150);else ctx.fillText("\uF061", 1000, 1150);
                    ctx.globalAlpha = 1;
                    return;
                } else if (death_time < 1000) {
                    this.pos = { x: this.game.canvas.width / 2, y: this.game.canvas.height / 2 };
                    this.trail = [];
                    this.game.paddle.posx = this.game.canvas.width / 2;
                    ctx.arc(this.pos.x, this.pos.y, Math.pow((1000 - death_time) / 10 + 4, 2), 0, Math.PI * 2);
                } else {
                    this.death_start = -1;
                    this.speed = { x: (Math.random() - 0.5) * 5, y: this.nspeed };
                }

                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // handle collisions
            if (this.death_start === -1 && this.pos.y > this.game.canvas.height - 10) {
                this.death_start = +new Date();
                this.speed = { x: 0, y: 0 };
                this.game.lives--;
                this.death_sound.play();
            }

            if (this.pos.y < 10) {
                this.pos.y = 10;
                this.speed.y *= -1;
                this.bounce_sound.play();
            }

            if (this.pos.x < 10 || this.pos.x > this.game.canvas.width - 10) {
                this.pos.x = Math.max(10, Math.min(this.game.canvas.width - 10, this.pos.x));
                this.speed.x *= -1;
                this.bounce_sound.play();
            }

            if (this.collides(this.game.paddle)) {
                this.speed.x = this.nspeed * 0.7 * ((this.pos.x - this.game.paddle.posx) / (this.game.paddle.width / 2));
                this.speed.y = -Math.sqrt(this.nspeed * this.nspeed - this.speed.x * this.speed.x);
                this.pos.y = this.game.canvas.height - 125;
                this.game.paddle.blur_start = +new Date();
                this.bounce_sound.play();
            }

            var mult = { x: 1, y: 1 };
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.game.bricks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var brick = _step.value;

                    var col = this.collides(brick);
                    if (col) {
                        if (this.game.bricks.length === 1) {
                            this.death_start = +new Date();
                            this.speed = { x: 0, y: 0 };
                            this.win_sound.play();
                        }

                        brick.destroy();
                        if (col === "x") mult.x = -1;
                        if (col === "y") mult.y = -1;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.speed.x *= mult.x;
            this.speed.y *= mult.y;

            this.pos.x += this.speed.x * delta / 20;
            this.pos.y += this.speed.y * delta / 20;

            // render trail
            this.trail.unshift(Object.assign({}, this.pos));
            this.trail = this.trail.splice(0, 30);

            ctx.fillStyle = "#fafafa";
            ctx.shadowBlur = 30;
            for (var i = 0; i < this.trail.length; i++) {
                ctx.globalAlpha = (30 - i) / 30;
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, (30 - i) / 30 * 17, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // render ball
            ctx.fillStyle = "#fafafa";
            ctx.shadowBlur = 50;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }, {
        key: "BBox",
        get: function get() {
            if (this.game.end) return {
                x: 900,
                y: 950,
                width: 250,
                height: 250
            };

            return {
                x: this.pos.x - 10,
                y: this.pos.y - 10,
                width: 20,
                height: 20
            };
        }
    }]);

    return Ball;
}(GameObject);

var Brick = function (_GameObject3) {
    _inherits(Brick, _GameObject3);

    function Brick(game, x, y, color) {
        _classCallCheck(this, Brick);

        var _this3 = _possibleConstructorReturn(this, (Brick.__proto__ || Object.getPrototypeOf(Brick)).call(this, game));

        _this3.pos = { x: x, y: y };
        _this3.color = color;
        _this3.destroy_start = -1;
        _this3.height = 60;
        _this3.brick_sound = new Audio("brick.wav");
        return _this3;
    }

    _createClass(Brick, [{
        key: "destroy",
        value: function destroy() {
            this.brick_sound.play();
            this.destroy_start = +new Date();
            _get(Brick.prototype.__proto__ || Object.getPrototypeOf(Brick.prototype), "destroy", this).call(this);
            this.game.gameObjects.push(this);
            this.game.bricks.splice(this.game.bricks.indexOf(this), 1);
        }
    }, {
        key: "update",
        value: function update(ctx, delta) {
            if (this.destroy_start !== -1) {
                var destroy_time = +new Date() - this.destroy_start;
                if (destroy_time >= 990) _get(Brick.prototype.__proto__ || Object.getPrototypeOf(Brick.prototype), "destroy", this).call(this);

                // ctx.globalAlpha = 1 - destroy_time / 1000;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = destroy_time;
                this.height = 60 * Math.pow(1 - destroy_time / 1000, 7);
            }

            ctx.strokeStyle = this.color;
            ctx.lineWidth = Math.max(0.001, this.height - 15);
            ctx.lineCap = "butt";
            ctx.beginPath();
            ctx.moveTo(this.pos.x - 95 + 5, this.pos.y);
            ctx.lineTo(this.pos.x + 95 - 5, this.pos.y);
            ctx.stroke();

            ctx.lineWidth = 20 * (this.height / 60);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(this.pos.x - 95 + 15, this.pos.y + this.height / 2 - 10);
            ctx.lineTo(this.pos.x + 95 - 15, this.pos.y + this.height / 2 - 10);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.pos.x - 95 + 15, this.pos.y - this.height / 2 + 10);
            ctx.lineTo(this.pos.x + 95 - 15, this.pos.y - this.height / 2 + 10);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
    }, {
        key: "BBox",
        get: function get() {
            return {
                x: this.pos.x - 95,
                y: this.pos.y - 20,
                width: 190,
                height: 60
            };
        }
    }]);

    return Brick;
}(GameObject);

// handles the main game loop and mouse events, keeps and calls update for all GameObjects


var Game = function () {
    function Game(element) {
        var _this4 = this;

        _classCallCheck(this, Game);

        this.canvas = element;
        this.canvas.onmousemove = function (event) {
            _this4.mouseMove(event);
        };
        this.canvas.onmousedown = function (event) {
            _this4.click(event);
        };

        this.pressed = {};
        window.onkeydown = function (event) {
            _this4.pressed[event.key] = true;
        };
        window.onkeyup = function (event) {
            _this4.pressed[event.key] = false;
        };
        this.ctx = canvas.getContext('2d');

        this.gameObjects = [];
        this.lastTime = +new Date();
        this.mousePos = { x: 0, y: 0 };

        this.lives = 3;

        this.paddle = new Paddle(this);

        this.bricks = [];
        for (var i = 0; i < 10; i++) {
            this.bricks.push(new Brick(this, i * 195 + 120, 145, "#d50000"));
            this.bricks.push(new Brick(this, i * 195 + 120, 220, "#aa00ff"));
            this.bricks.push(new Brick(this, i * 195 + 120, 295, "#2962ff"));
            this.bricks.push(new Brick(this, i * 195 + 120, 370, "#00bfa5"));
        }

        this.ball = new Ball(this);

        window.requestAnimationFrame(function () {
            _this4.render();
        });
    }

    _createClass(Game, [{
        key: "add",
        value: function add(obj) {
            this.gameObjects.push(obj);
        }
    }, {
        key: "remove",
        value: function remove(obj) {
            this.gameObjects.splice(this.gameObjects.indexOf(obj), 1);
        }
    }, {
        key: "mouseMove",
        value: function mouseMove(event) {
            var rect = this.canvas.getBoundingClientRect();
            var x = Math.floor((event.clientX - rect.left) / this.canvas.offsetWidth * this.canvas.width);
            var y = Math.floor((event.clientY - rect.top) / this.canvas.offsetHeight * this.canvas.height);
            this.mousePos = { x: x, y: y };
        }
    }, {
        key: "click",
        value: function click(event) {
            this.mouseMove(event);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.gameObjects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var obj = _step2.value;

                    if (obj.hovering) obj.click();
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this5 = this;

            // reset pointer
            document.body.style.cursor = "default";

            var delta = +new Date() - this.lastTime;
            this.lastTime = +new Date();

            // update background
            this.ctx.fillStyle = '#212121';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // render lives
            this.ctx.fillStyle = "#fafafa";
            for (var i = 0; i < this.lives; i++) {
                this.ctx.beginPath();
                this.ctx.arc(60 + i * 60, 60, 20, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.textAlign = "center";
            this.ctx.font = "45px FontAwesome";
            for (var _i = 0; _i < (this.ball.nspeed - 20) / 7; _i++) {
                this.ctx.fillText("\uF061", this.canvas.width - 60 - _i * 60, 75);
            }

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.gameObjects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var obj = _step3.value;

                    obj.update(this.ctx, delta);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            window.requestAnimationFrame(function () {
                _this5.render();
            });
        }
    }, {
        key: "end",
        get: function get() {
            return this.bricks.length === 0 || this.lives < 0;
        }
    }]);

    return Game;
}();

var game = new Game(document.getElementById('canvas'));