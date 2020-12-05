@@include("canvas/common.js");

var pixel_scale = 8;

var image_data_old;
var image_data_new;

var scores = [0, 0, 0];

var offsets = [-1, -1, -1, 0, -1, 1, 0, 1, 1, 1, 1, 0, 1, -1, 0, -1];
//offsets = [-1, 0, 1, 0, 0, -1, 0, 1];

var offsetCount = offsets.length;

var i = 0;
var n = 0;
var x = 0;
var y = 0;

var t = 0;

var f = 0;

var o;

function afterResize() {
    image_data_new = ctx.getImageData(0, 0, width, height);
    image_data_old = ctx.getImageData(0, 0, width, height);

    for (i = 0; i < width * height; i++) {
        image_data_new.data[i * 4 + 0] = ~~(Math.random() * 255);
        image_data_new.data[i * 4 + 1] = ~~(Math.random() * 255);
        image_data_new.data[i * 4 + 2] = ~~(Math.random() * 255);

        image_data_new.data[i * 4 + 3] = 255;

        image_data_old.data[i * 4 + 0] = ~~(Math.random() * 255);
        image_data_old.data[i * 4 + 1] = ~~(Math.random() * 255);
        image_data_old.data[i * 4 + 2] = ~~(Math.random() * 255);

        image_data_old.data[i * 4 + 3] = 255;
    }
}

@@include("canvas/onResize.js", { afterResize: true, pixelScale: true });

function render() {
    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            scores[0] = 0;
            scores[1] = 0;
            scores[2] = 0;

            //console.log(x, y, 0);

            i = (x + y * width) * 4;

            //image_data_new.data[i + 0] = image_data_old.data[i + 0];
            //image_data_new.data[i + 1] = image_data_old.data[i + 1];
            //image_data_new.data[i + 2] = image_data_old.data[i + 2];

            t = 0;
            f = 0;

            if (
                image_data_new.data[i + 0] > image_data_new.data[i + 1] &&
                image_data_new.data[i + 0] > image_data_new.data[i + 2]
            ) {
                //red highest
                t = 0;
            } else if (
                image_data_new.data[i + 1] > image_data_new.data[i + 0] &&
                image_data_new.data[i + 1] > image_data_new.data[i + 2]
            ) {
                //green highest
                t = 1;
            } else {
                //blue highest
                t = 2;
            }

            //for (o = 0; o < offsetCount; o += 2) {
            o = ~~(Math.random() * offsetCount);

            n =
                (((x + offsets[o] + width) % width) +
                    ((y + offsets[o + 1] + height) % height) * width) *
                4;

            if (
                image_data_old.data[n + ((t + 1) % 3)] >=
                    image_data_old.data[i + ((t + 0) % 3)] &&
                image_data_old.data[n + ((t + 1) % 3)] > scores[(t + 1) % 3]
            ) {
                scores[0] = image_data_old.data[n + 0];
                scores[1] = image_data_old.data[n + 1];
                scores[2] = image_data_old.data[n + 2];

                f = 1;
            }
            //}

            if (f) {
                image_data_new.data[i + 0] = scores[0];
                image_data_new.data[i + 1] = scores[1] * 0.999;
                image_data_new.data[i + 2] = scores[2] * 0.999;
            }
        }
    }

    for (i = 0; i < width * height; i++) {
        image_data_old.data[i * 4 + 0] = image_data_new.data[i * 4 + 0];
        image_data_old.data[i * 4 + 1] = image_data_new.data[i * 4 + 1];
        image_data_old.data[i * 4 + 2] = image_data_new.data[i * 4 + 2];
    }

    ctx.putImageData(image_data_new, 0, 0);
}

//render();

setInterval(render, 100);
