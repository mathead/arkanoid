// taken from https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
function easeOutBack(t, s) {
    if (s == undefined) s = 1.70158;
    return (t=t-1)*t*((s+1)*t + s) + 1;
}

// base class of all renderable objects, handles hovering and clicking
class GameObject {
    constructor(game) {
        this.game = game;
        game.add(this);
    }

    destroy() {
        this.game.remove(this)
    }
    
    get BBox() {
        return null;
    }
    
    contains(pos) {
        if (this.BBox === null)
            return false;

        let {x, y} = pos;
        return x >= this.BBox.x && y >= this.BBox.y &&
               x <= this.BBox.x + this.BBox.width &&
               y <= this.BBox.y + this.BBox.height;
    }

    collides(obj) {
        if (obj.contains({x: this.BBox.x + this.BBox.width / 2, y: this.BBox.y}) ||
            obj.contains({x: this.BBox.x + this.BBox.width / 2, y: this.BBox.y + this.BBox.height}))
            return "y";
        if ((obj.contains({x: this.BBox.x, y: this.BBox.y}) &&
            obj.contains({x: this.BBox.x, y: this.BBox.y + this.BBox.height})) ||
            (obj.contains({x: this.BBox.x + this.BBox.width, y: this.BBox.y}) &&
            obj.contains({x: this.BBox.x + this.BBox.width, y: this.BBox.y + this.BBox.height})))
            return "x";
        if (obj.contains({x: this.BBox.x, y: this.BBox.y}) ||
            obj.contains({x: this.BBox.x + this.BBox.width, y: this.BBox.y}) ||
            obj.contains({x: this.BBox.x, y: this.BBox.y + this.BBox.height}) ||
            obj.contains({x: this.BBox.x + this.BBox.width, y: this.BBox.y + this.BBox.height}))
            return "y";

        // if ((this.BBox.x < obj.BBox.x + obj.BBox.width && this.BBox.x > obj.BBox.x) ||
        //     (this.BBox.x + this.BBox.width > obj.BBox.x && this.BBox.x + this.BBox.width < obj.BBox.x + obj.BBox.x))
        //     return "x";
        // if ((this.BBox.y < obj.BBox.y + obj.BBox.height && this.BBox.y > obj.BBox.y) ||
        //     (this.BBox.y + this.BBox.height > obj.BBox.y && this.BBox.y + this.BBox.height < obj.BBox.y + obj.BBox.y))
        //    return "y";
        return null;
    }

    get hovering() {
        return this.contains(this.game.mousePos);
    }

    click() {}

    update(ctx, delta) {}
}

class Paddle extends GameObject {
    constructor(game) {
        super(game);
        this.posx = this.game.canvas.width / 2;
        this.speed = 0;
        this.width = 250;
        this.blur_start = +new Date() - 1000;
    }

    get BBox() {
        return {
            x: this.posx - this.width / 2,
            y: this.game.canvas.height - 115,
            width: this.width,
            height: 30,
        }
    }

    update(ctx, delta) {
        this.speed *= 0.9;
        if (this.game.pressed["ArrowLeft"] || this.game.pressed["a"])
            this.speed -= delta / 5;
        else if (this.game.pressed["ArrowRight"] || this.game.pressed["d"])
            this.speed += delta / 5;
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
}


class Ball extends GameObject {
    constructor(game) {
        super(game);
        this.pos = {x: this.game.canvas.width / 2, y: this.game.canvas.height / 2};
        this.nspeed = 20;
        this.speed = {x: (Math.random() - 0.5) * 5, y: this.nspeed};
        this.trail = [];
        this.death_start = -1;
        this.bounce_sound = new Audio('bounce.wav');
        this.bounce_sound.volume = 0.3;
        this.death_sound = new Audio('death.wav');
        this.death_sound.volume = 0.5;
        this.win_sound = new Audio('win.wav');
        this.win_sound.volume = 0.5;
    }

    get BBox() {
        if (this.game.end)
            return {
                x: 900,
                y: 950,
                width: 250,
                height: 250,
            };

        return {
            x: this.pos.x - 10,
            y: this.pos.y - 10,
            width: 20,
            height: 20,
        }
    }

    click() {
        if (this.game.end)
            game = new Game(document.getElementById('canvas'));
        if (this.game.lives >= 0) {
            game.ball.nspeed = this.nspeed + 7;
            game.score = this.game.score;
            game.ball.speed.y = game.ball.nspeed;
        }
    }

    update(ctx, delta) {
        if (this.death_start !== -1) {
            let death_time = +new Date() - this.death_start;

            ctx.fillStyle = "#fafafa";
            ctx.shadowBlur = 50;
            ctx.beginPath();

            if (death_time < 500)
                ctx.arc(this.pos.x, this.pos.y, Math.pow(death_time / 10 + 4, 2), 0, Math.PI * 2);
            else if (this.game.end) {
                if (this.hovering)
                    document.body.style.cursor = "pointer";

                ctx.arc(this.pos.x, this.pos.y, 10000, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = Math.max(Math.min((death_time - 500) / 2000, 1), 0);
                ctx.textAlign="center";
                ctx.fillStyle = "#212121";
                ctx.font = "500px FontAwesome";
                if (this.game.lives < 0)
                    ctx.fillText('\uF00D', 1000, 600);
                else
                    ctx.fillText('\uF091', 1000, 600);
                ctx.font = "200px FontAwesome";
                if (this.game.lives < 0)
                    ctx.fillText('\uF021', 1000, 1150);
                else
                    ctx.fillText('\uF061', 1000, 1150);
                ctx.globalAlpha = 1;
                return;
            } else if (death_time < 1000) {
                this.pos = {x: this.game.canvas.width / 2, y: this.game.canvas.height / 2};
                this.trail = [];
                this.game.paddle.posx = this.game.canvas.width / 2;
                ctx.arc(this.pos.x, this.pos.y, Math.pow((1000 - death_time) / 10 + 4, 2), 0, Math.PI * 2);
            } else {
                this.death_start = -1;
                this.speed = {x: (Math.random() - 0.5) * 5, y: this.nspeed};
            }

            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // handle collisions
        if (this.death_start === -1 && this.pos.y > this.game.canvas.height - 10) {
            this.death_start = +new Date();
            this.speed = {x: 0, y: 0};
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
            this.speed.x += this.game.paddle.speed;
            this.pos.y = this.game.canvas.height - 125;
            this.game.paddle.blur_start = +new Date();
            this.bounce_sound.play();
        }

        let mult = {x: 1, y: 1};
        for (let brick of this.game.bricks) {
            let col = this.collides(brick);
            if (col) {
                if (this.game.bricks.length === 1) {
                    this.death_start = +new Date();
                    this.speed = {x: 0, y: 0};
                    this.win_sound.play();
                }

                brick.destroy();
                if (col === "x")
                    mult.x = -1;
                if (col === "y")
                    mult.y = -1;
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
        for (let i = 0; i < this.trail.length; i++) {
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
}


class Brick extends GameObject {
    constructor(game, x, y, color) {
        super(game);
        this.pos = {x, y};
        this.color = color;
        this.destroy_start = -1;
        this.height = 60;
        this.brick_sound = new Audio("brick.wav");
        this.brick_sound.volume = 0.4;
    }

    get BBox() {
        return {
            x: this.pos.x - 95,
            y: this.pos.y - 20,
            width: 190,
            height: 60,
        }
    }

    destroy() {
        this.game.score++;
        this.brick_sound.play();
        this.destroy_start = +new Date();
        super.destroy();
        this.game.gameObjects.push(this);
        this.game.bricks.splice(this.game.bricks.indexOf(this), 1);
    }

    update(ctx, delta) {
        if (this.destroy_start !== -1) {
            let destroy_time = +new Date() - this.destroy_start;
            if (destroy_time >= 990)
                super.destroy();

            ctx.globalAlpha = 1 - destroy_time / 1000;
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
}


// handles the main game loop and mouse events, keeps and calls update for all GameObjects
class Game {
    constructor(element) {
        this.canvas = element;
        this.canvas.onmousemove = (event) => {this.mouseMove(event)};
        this.canvas.onmousedown = (event) => {this.click(event)};

        this.pressed = {};
        window.onkeydown = (event) => {this.pressed[event.key] = true;};
        window.onkeyup = (event) => {this.pressed[event.key] = false;};
        this.ctx = canvas.getContext('2d');

        this.gameObjects = [];
        this.lastTime = +new Date();
        this.mousePos = {x: 0, y: 0};

        this.lives = 3;
        this.score = 0;

        this.paddle = new Paddle(this);

        this.bricks = [];
        for (let i = 0; i < 10; i++) {
            this.bricks.push(new Brick(this, i * 195 + 120, 145, "#d50000"));
            this.bricks.push(new Brick(this, i * 195 + 120, 220, "#aa00ff"));
            this.bricks.push(new Brick(this, i * 195 + 120, 295, "#2962ff"));
            this.bricks.push(new Brick(this, i * 195 + 120, 370, "#00bfa5"));
            this.bricks.push(new Brick(this, i * 195 + 120, 445, "#aeea00"));
        }

        this.ball = new Ball(this);

        window.requestAnimationFrame(() => {this.render()});
    }

    get end() {
        return this.bricks.length === 0 || this.lives < 0;
    }

    add(obj) {
        this.gameObjects.push(obj);
    }

    remove(obj) {
        this.gameObjects.splice(this.gameObjects.indexOf(obj), 1);
    }

    mouseMove(event) {
        let rect = this.canvas.getBoundingClientRect();
        let x = Math.floor((event.clientX - rect.left) / this.canvas.offsetWidth * this.canvas.width);
        let y = Math.floor((event.clientY - rect.top) / this.canvas.offsetHeight * this.canvas.height);
        this.mousePos = {x, y};
    }

    click(event) {
        this.mouseMove(event);
        for (let obj of this.gameObjects) {
            if (obj.hovering)
                obj.click();
        }
    }

    render() {
        // reset pointer
        document.body.style.cursor = "default";

        let delta = +new Date() - this.lastTime;
        this.lastTime = +new Date();

        // update background
        this.ctx.fillStyle = '#212121';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let obj of this.gameObjects) {
            obj.update(this.ctx, delta);
        }

        // render ui
        if (!this.end)
            this.ctx.fillStyle = "#fafafa";
        for (let i = 0; i < this.lives; i++) {
            this.ctx.beginPath();
            this.ctx.arc(60 + i * 60, 60, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.textAlign="center";
        this.ctx.font = "45px FontAwesome";
        for (let i = 0; i < (this.ball.nspeed - 20) / 7; i++) {
            this.ctx.fillText('\uF061', this.canvas.width - 60 - i * 60, 75);
        }

        this.ctx.font = "45px cliche";
        this.ctx.fillText(this.score, this.canvas.width / 2, 75);

        window.requestAnimationFrame(() => {this.render()});        
    }
}

let game = new Game(document.getElementById('canvas'));