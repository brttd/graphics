@@include("canvas/common.js");

@@include("canvas/pixel_scale.js", { pixel_scale: 10 });

var grid_old = [];
var grid_new = [];
var grid_tmp = null;

var colors = {
    0: [17, 43, 44],
    0.1: [29, 72, 73],
    0.2: [41, 101, 102],
    0.3: [52, 130, 131],
    0.4: [64, 159, 160],
    0.5: [80, 183, 185],
    0.6: [109, 195, 197],
    0.7: [138, 207, 208],
    0.8: [167, 219, 220],
    0.9: [197, 231, 232],

    1.0: [179, 200, 230],
    1.1: [148, 178, 219],
    1.2: [117, 156, 209],
    1.3: [102, 144, 204],
    1.4: [87, 133, 199],
    1.5: [71, 122, 194],
    1.6: [61, 112, 184],
    1.7: [56, 103, 168],
    1.8: [51, 93, 153],
    1.9: [46, 84, 138],
};

var offsets = [-1, -1, -1, 0, -1, 1, 0, 1, 1, 1, 1, 0, 1, -1, 0, -1];

var offsetCount = offsets.length;

var score = 0;

var dead = 0;

var image_data;

var i = 0;
var x = 0;
var y = 0;
var o;

function afterResize() {
    grid_new.length = width * height;
    grid_old.length = width * height;

    image_data = ctx.getImageData(0, 0, width, height);

    for (i = 0; i < grid_new.length; i++) {
        grid_old[i] = ~~(Math.random() * 1.99 * 10) / 10;
        grid_new[i] = ~~(Math.random() * 1.99 * 10) / 10;

        image_data.data[i * 4 + 3] = 255;
    }
}

@@include("canvas/onResize.js", { afterResize: true, pixel_scale: true });

function render() {
    //Swap the two grids
    grid_tmp = grid_new;

    grid_new = grid_old;
    grid_old = grid_tmp;

    dead = 0;

    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            score = 0;

            for (o = 0; o < offsetCount; o += 2) {
                score += ~~grid_old[
                    ((x + offsets[o] + width) % width) +
                        ((y + offsets[o + 1] + height) % height) * width
                ];
            }

            i = x + y * width;

            if ((~~grid_old[i] && score === 2) || score === 3) {
                //alive
                grid_new[i] = Math.min(1.99, Math.max(1, grid_old[i] + 0.08));
            } else {
                //dead
                grid_new[i] = Math.max(0, Math.min(0.99, grid_old[i] - 0.005));
            }

            o = ~~(grid_new[i] * 10) / 10;

            image_data.data[i * 4] = colors[o][0];
            image_data.data[i * 4 + 1] = colors[o][1];
            image_data.data[i * 4 + 2] = colors[o][2];

            dead += grid_new[i] === 0 ? 1 : 0;
        }
    }

    if (dead >= grid_new.length * 0.9) {
        for (o = 0; o < grid_new.length * 0.02; o++) {
            grid_new[~~(Math.random() * grid_new.length)] = 1.0;
        }
    }

    ctx.putImageData(image_data, 0, 0);
}

//render();

setInterval(render, 50);
