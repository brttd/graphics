@@include("canvas/common.js");

var pixel_scale = 4;

var pixel_count, top_row;

var image_data = false;

var density = 0.34;

var grid = [];
var old_grid = [];

var bg = [29, 53, 87];
var right = [230, 57, 70];
var down = [241, 250, 238];
down = [168, 218, 220];

var frame_count = 0;

function afterResize() {
    pixel_count = width * height;

    top_row = pixel_count - width;

    ctx.fillStyle = "rgb(" + bg[0] + "," + bg[1] + "," + bg[2] + ")";
    ctx.fillRect(0, 0, width, height);

    grid = [];

    for (var i = 0; i < pixel_count; i++) {
        if (Math.random() < density) {
            grid.push(Math.random() < 0.5 ? 1 : 2);
        } else {
            grid.push(0);
        }
    }
}

@@include("canvas/onResize.js", { afterResize: true, pixelScale: true });

function render() {
    var i;

    old_grid = new Array(grid.length);
    for (i in grid) {
        old_grid[i] = grid[i];
    }

    image_data = ctx.getImageData(0, 0, width, height);

    if (frame_count % 2 == 0) {
        //update down (1)
        for (i = 0; i < top_row; i++) {
            if (old_grid[i] == 1 && old_grid[i + width] == 0) {
                grid[i] = 0;
                grid[i + width] = 1;

                image_data.data[i * 4] = bg[0];
                image_data.data[i * 4 + 1] = bg[1];
                image_data.data[i * 4 + 2] = bg[2];
                image_data.data[(i + width) * 4] = right[0];
                image_data.data[(i + width) * 4 + 1] = right[1];
                image_data.data[(i + width) * 4 + 2] = right[2];
            }
        }
        for (i = top_row; i < pixel_count; i++) {
            if (old_grid[i] == 1 && old_grid[i - top_row] == 0) {
                grid[i] = 0;
                grid[i - top_row] = 1;

                image_data.data[i * 4] = bg[0];
                image_data.data[i * 4 + 1] = bg[1];
                image_data.data[i * 4 + 2] = bg[2];
                image_data.data[(i - top_row) * 4] = right[0];
                image_data.data[(i - top_row) * 4 + 1] = right[1];
                image_data.data[(i - top_row) * 4 + 2] = right[2];
            }
        }
    } else {
        //update right (2)
        for (i = 0; i < pixel_count; i++) {
            if (old_grid[i] == 2) {
                if (i % width == width - 1) {
                    if (old_grid[i - width + 1] == 0) {
                        grid[i] = 0;
                        grid[i - width + 1] = 2;

                        image_data.data[i * 4] = bg[0];
                        image_data.data[i * 4 + 1] = bg[1];
                        image_data.data[i * 4 + 2] = bg[2];
                        image_data.data[(i - width + 1) * 4] = down[0];
                        image_data.data[(i - width + 1) * 4 + 1] = down[1];
                        image_data.data[(i - width + 1) * 4 + 2] = down[2];
                    }
                } else {
                    if (old_grid[i + 1] == 0) {
                        grid[i] = 0;
                        grid[i + 1] = 2;

                        image_data.data[i * 4] = bg[0];
                        image_data.data[i * 4 + 1] = bg[1];
                        image_data.data[i * 4 + 2] = bg[2];
                        image_data.data[(i + 1) * 4] = down[0];
                        image_data.data[(i + 1) * 4 + 1] = down[1];
                        image_data.data[(i + 1) * 4 + 2] = down[2];
                    }
                }
            }
        }
    }

    ctx.putImageData(image_data, 0, 0);

    frame_count++;

    requestAnimationFrame(render);
}

render();
