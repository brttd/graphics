@@include("canvas/common.js");

@@include("canvas/pixel_scale.js", { pixel_scale: 2 });

var grid_old = [];
var grid_new = [];
var grid_tmp = null;

var colors = [
    [17, 43, 44],
    [29, 72, 73],
    [41, 101, 102],
    [52, 130, 131],
    [64, 159, 160],
    [80, 183, 185],
    [109, 195, 197],
    [138, 207, 208],
    [167, 219, 220],
    [197, 231, 232],

    [179, 200, 230],
    [148, 178, 219],
    [117, 156, 209],
    [102, 144, 204],
    [87, 133, 199],
    [71, 122, 194],
    [61, 112, 184],
    [56, 103, 168],
    [51, 93, 153],
    [46, 84, 138],
];

var score = 0;

var dead = 0;

var image_data;

var cellCount = 0;

var time = 0;
var lastTime = 0;

//Minimum number of milliseconds between updates
var minTime = 40;

var i = 0;
var o;

function afterResize() {
    grid_new.length = width * height;
    grid_old.length = width * height;

    cellCount = width * height;

    image_data = ctx.getImageData(0, 0, width, height);

    for (i = 0; i < grid_new.length; i++) {
        grid_old[i] = ~~(Math.random() * 1.99 * 10) / 10;
        grid_new[i] = ~~(Math.random() * 1.99 * 10) / 10;

        image_data.data[i * 4 + 3] = 255;
    }
}

@@include("canvas/onResize.js", { afterResize: true, pixel_scale: true });

function render() {
    requestAnimationFrame(render);

    time = Date.now();

    if (time - lastTime < minTime) {
        return;
    }

    lastTime = time;

    //Swap the two grids
    grid_tmp = grid_new;

    grid_new = grid_old;
    grid_old = grid_tmp;

    dead = 0;

    for (i = 0; i < cellCount; i++) {
        score =
            //⭦ North-West neighbour
            ~~grid_old[
                ~~(((i - width + cellCount) % cellCount) / width) * width +
                    ((i - 1 + width) % width)
            ] +
            //⭡ North neighbour
            ~~grid_old[(i - width + cellCount) % cellCount] +
            //⭧ North-East neighbour
            ~~grid_old[
                ~~(((i - width + cellCount) % cellCount) / width) * width +
                    ((i + 1) % width)
            ] +
            //⭢ East neighbour
            ~~grid_old[~~(i / width) * width + ((i + 1) % width)] +
            //⭨ South-East neighbour
            ~~grid_old[
                ((~~((i + width) / width) * width + cellCount) % cellCount) +
                    ((i + 1) % width)
            ] +
            //⭣ South neighbour
            ~~grid_old[(i + width) % cellCount] +
            //⭩ South-West neighbour
            ~~grid_old[
                ((~~((i + width) / width) * width + cellCount) % cellCount) +
                    ((i - 1 + width) % width)
            ] +
            //⭠ West neighbour
            ~~grid_old[~~(i / width) * width + ((i - 1 + width) % width)];

        grid_new[i] =
            (~~grid_old[i] && score === 2) || score === 3
                ? //Alive
                  Math.min(1.99, Math.max(1, grid_old[i] + 0.08))
                : //Dead
                  Math.max(0, Math.min(0.99, grid_old[i] - 0.005));

        o = ~~(grid_new[i] * 10);

        image_data.data[i * 4] = colors[o][0];
        image_data.data[i * 4 + 1] = colors[o][1];
        image_data.data[i * 4 + 2] = colors[o][2];

        dead += grid_new[i] === 0 || grid_new[i] === 1.99 ? 1 : 0;
    }

    if (dead >= grid_new.length * 0.9) {
        for (o = 0; o < grid_new.length * 0.01; o++) {
            grid_new[~~(Math.random() * grid_new.length)] = 1.0;
        }
    }

    ctx.putImageData(image_data, 0, 0);
}

render();
