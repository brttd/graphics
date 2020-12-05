@@include("canvas/common.js");

var pixel_scale = 5;

var grid_old = [];
var grid_new = [];
var grid_tmp = null;

var colors = [
    //[239, 71, 111],
    //[255, 209, 102],
    //[6, 214, 160],
    //[17, 138, 178],
    //[242, 146, 78],
    [247, 37, 133],
    [113, 9, 183],
    [58, 12, 163],
    [67, 97, 238],
    [76, 201, 240],
];

var states = 5;
var winState = 2;

var threshold = 3;

var scores = [];
scores.length = states;

var offsets = [-1, -1, -1, 0, -1, 1, 0, 1, 1, 1, 1, 0, 1, -1, 0, -1];

var offsetCount = offsets.length;

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
        grid_old[i] = ~~(Math.random() * states);
        grid_new[i] = ~~(Math.random() * states);

        image_data.data[i * 4 + 3] = 255;
    }
}

@@include("canvas/onResize.js", { afterResize: true, pixelScale: true });

function render() {
    //Swap the two grids
    grid_tmp = grid_new;

    grid_new = grid_old;
    grid_old = grid_tmp;

    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            scores[0] = 0;
            scores[1] = 0;
            scores[2] = 0;
            scores[3] = 0;
            scores[4] = 0;

            for (o = 0; o < offsetCount; o += 2) {
                scores[
                    grid_old[
                        ((x + offsets[o] + width) % width) +
                            ((y + offsets[o + 1] + height) % height) * width
                    ]
                ]++;
            }

            i = x + y * width;

            grid_new[i] = grid_old[i];

            for (o = 0; o < 5; o++) {
                if (
                    o !== grid_old[i] &&
                    scores[o] >= threshold &&
                    (((grid_old[i] - o) % 5) + 5) % 5 > winState
                ) {
                    grid_new[i] = o;
                    break;
                }
            }

            image_data.data[i * 4] = colors[grid_new[i]][0];
            image_data.data[i * 4 + 1] = colors[grid_new[i]][1];
            image_data.data[i * 4 + 2] = colors[grid_new[i]][2];
        }
    }

    ctx.putImageData(image_data, 0, 0);
}

setInterval(render, 50);
