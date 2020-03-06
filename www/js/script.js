var W = 84, H = 48;
var UP = 1,DOWN = -1, LEFT = -2, RIGHT = 2;

var food_bitmap = [
    [0, 1, 0, 0],
    [1, 0, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0]
];

var seg_bitmap = [
    [1, 1, 1, 0],
    [1, 1, 1, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0]
];

var seg_down = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 1, 1, 0]
];

var seg_right = [
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 0]
];

var unit = 4;

var canvas, ctx, repw, ph;
var pixels = Array.from(Array(W), () => new Array(H));

var snake = null;
var head = null;
var food = null;
var period = null;
var alive = null;
var control = null;
var newPress = false;

function main() {
    snake = [LEFT, LEFT, LEFT, LEFT];
    head = [10, 6];
    food = [-1, -1];
    period = 500;
    alive = true;

    control = RIGHT;

    makeUnselectable(document.getElementById("all"));

    var canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    real_w = canvas.width;
    real_h = canvas.height;

    pw = Math.round(real_w / W);
    ph = Math.round(real_h / H);
    
    pw = ph = Math.min(pw, ph);
    
    real_w = canvas.width = W*pw;
    real_h = canvas.height = H*ph;

    newFood();

    clear();

    loop();
}

function loop() {
    walk();

    //console.log("head", head);

    if(alive) {
        clear();
        drawFrame();
        drawSnake();
        drawBitmap(food, food_bitmap);
        update();

        setTimeout(loop, Math.round(1000/Math.sqrt(snake.length)));
    }
}

function walk() {
    var d = control;
    newPress = false;

    switch(d) {
        case UP:
            if(snake.slice(-1)[0] == UP) break;
            snake.push(DOWN);
            head[1] -= unit; 
            break;
            
        case DOWN:
            if(snake.slice(-1)[0] == DOWN) break;
            snake.push(UP);
            head[1] += unit; 
            break;
            
        case LEFT:
            if(snake.slice(-1)[0] == LEFT) break;
            snake.push(RIGHT);
            head[0] -= unit; 
            break;

        case RIGHT:
            if(snake.slice(-1)[0] == RIGHT) break;
            snake.push(LEFT);
            head[0] += unit; 
            break;
    }

    if(head[0] < 2 || head[0] >= (W - unit) - 1 ||
        head[1] < 2 || head[1] >= (H - unit) - 1) {
        end();
    }

    if(head[0] == food[0] && head[1] == food[1]) {
        newFood();
        period -= 100;
    } else {
        snake.shift();
    }
}

function newFood() {
    var aw = Math.floor((W - 1) / unit);
    var ah = Math.floor((H - 1) / unit);

    var x = getRandomInt(0, aw)*unit + 2;
    var y = getRandomInt(0, ah)*unit + 2;

    food[0] = x;
    food[1] = y;

    console.log("food", food);
}

function end() {
    alive = false;
    clear();
    drawFrame();
    update();

    console.log("end");
    console.log("Score: " + snake.length);

    if (typeof Android === 'undefined' || Android === null) {
        alert("Score: " + snake.length);
        setTimeout(main, 500);
    } else {
        Android.alert("Score: " + snake.length);
        //Activity will reload web page
    }
}

function drawSnake() {
    var x = head[0];
    var y = head[1];
    var last = null;

    for(var k = snake.length - 1; k >= 0; k--) {
        drawBitmap([x, y], seg_bitmap);
        
        /* start of gambiarra */
        
        if(k < snake.length - 1) {
            switch(snake[k + 1]) {
                case UP:
                    drawBitmap([x, y], seg_down);
                    break;

                case LEFT:
                    drawBitmap([x, y], seg_right);
                    break;
            }
        }

        switch(k > 0 && snake[k]) {
            case DOWN:
                drawBitmap([x, y], seg_down);
                break;

            case RIGHT:
                drawBitmap([x, y], seg_right);
                break;
        }

        /* end of gambiarra */

        switch(snake[k]) {
            case UP:
                y -= unit;
                break;
            case DOWN:
                y += unit;
                break;
            case LEFT:
                x -= unit;
                break;
            case RIGHT:
                x += unit;
                break;
        }

        last = snake[k]
        
        //gambiarra 2
        if(head[0] == x && head[1] == y) end();
    }
}

function drawBitmap(p, bitmap) {
    for(var j = 0; j < bitmap.length; j++) {
        for(var i = 0; i < bitmap[0].length; i++) {
            if(bitmap[j][i]) pixels[i + p[0]][j + p[1]] = true;
        }
    }
}

function drawFrame() {
    for(var i = 0; i < W; i++) {
        pixels[i][0] = true;
        pixels[i][H - 1] = true;
    }

    for(var j = 0; j < H; j++) {
        pixels[0][j] = true;
        pixels[W - 1][j] = true;
    }
}

function clear() {
    for(var i = 0; i < W; i++) {
        pixels[i].fill(false);
    }
}

function update() {
    ctx.clearRect(0, 0, real_w, real_h);

    for(var j = 0; j < H; j++) {
        for(var i = 0; i < W; i++) {
            if(pixels[i][j]) {
                ctx.fillRect((pw)*i, (ph)*j, pw, ph);  
            }
        }
    }
}

function press(key) {
    if (typeof Android === 'undefined' || Android === null) {
        window.navigator.vibrate(1);
    } else {
        Android.vibrate(1);
    }
    
    if(newPress) return;

    //if key is oposite to current direction ignore it
    if(control + key == 0) return;

    control = key;
    newPress = true;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function makeUnselectable(node) {
    if (node.nodeType == 1) {
        node.setAttribute("unselectable", "on");
    }
    var child = node.firstChild;
    while (child) {
        makeUnselectable(child);
        child = child.nextSibling;
    }
}
