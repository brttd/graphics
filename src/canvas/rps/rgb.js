@@include("canvas/common.js");

@@include("canvas/pixel_scale.js", { pixel_scale: 3 });

var image_data_old;
var image_data_new;

var scores = [0, 0, 0];
var boost = [0, 0, 0];

var offsets = [-1, -1, -1, 0, -1, 1, 0, 1, 1, 1, 1, 0, 1, -1, 0, -1];
//offsets = [-1, 0, 1, 0, 0, -1, 0, 1];

var offsetCount = offsets.length;

var i = 0;
var n = 0;
var x = 0;
var y = 0;
var z = 0;

var t = 0;
var f = 0;

var b = 16;
var r = 64;

var o;

function afterResize() {
    image_data_new = ctx.getImageData(0, 0, width, height);
    image_data_old = ctx.getImageData(0, 0, width, height);

    for (i = 0; i < width * height; i++) {
        x = Math.random();
        y = Math.random();
        z = Math.random();

        image_data_new.data[i * 4 + 0] = ~~(255 * x);
        image_data_new.data[i * 4 + 1] = ~~(255 * y);
        image_data_new.data[i * 4 + 2] = ~~(255 * z);

        image_data_new.data[i * 4 + 3] = 255;

        image_data_old.data[i * 4 + 0] = ~~(255 * x);
        image_data_old.data[i * 4 + 1] = ~~(255 * y);
        image_data_old.data[i * 4 + 2] = ~~(255 * z);

        image_data_old.data[i * 4 + 3] = 255;
    }
}

@@include("canvas/onResize.js", { afterResize: true, pixel_scale: true });

var totals = [0, 0, 0];

//DEBUG:
//var debug = document.createElement("p");
//debug.style =
//    "position: absolute;top: 5px;left:5px;background:rgba(0,0,0,0.5);color:white;";
//document.body.appendChild(debug);

function render() {
    //DEBUG:
    //totals[0] = 0;
    //totals[1] = 0;
    //totals[2] = 0;

    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            scores[0] = 0;
            scores[1] = 0;
            scores[2] = 0;

            boost[0] = Math.random() * b;
            boost[1] = Math.random() * b;
            boost[2] = Math.random() * b;

            i = (x + y * width) * 4;

            image_data_new.data[i + 0] = image_data_old.data[i + 0];
            image_data_new.data[i + 1] = image_data_old.data[i + 1];
            image_data_new.data[i + 2] = image_data_old.data[i + 2];

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
            } else if (
                image_data_new.data[i + 2] > image_data_new.data[i + 0] &&
                image_data_new.data[i + 2] > image_data_new.data[i + 1]
            ) {
                //blue highest
                t = 2;
            } else {
                //All equal = choose random
                t = ~~(Math.random() * 3);
            }

            //DEBUG:
            //totals[t] += 1;

            for (o = 0; o < offsetCount; o += 2) {
                n =
                    (((x + offsets[o] + width) % width) +
                        ((y + offsets[o + 1] + height) % height) * width) *
                    4;

                if (
                    image_data_old.data[n + ((t + 1) % 3)] +
                        boost[(t + 1) % 3] >=
                    image_data_old.data[i + ((t + 0) % 3)] + boost[t]
                ) {
                    scores[0] += image_data_old.data[n + 0];
                    scores[1] += image_data_old.data[n + 1];
                    scores[2] += image_data_old.data[n + 2];

                    f += 1;
                }
            }

            if (f >= 1 + Math.random() * 1.2) {
                scores[0] /= f;
                scores[1] /= f;
                scores[2] /= f;

                n = Math.min(
                    1.021,
                    Math.max(
                        1,
                        scores[0] / 255 + scores[1] / 255 + scores[2] / 255
                    )
                );

                scores[0] /= n;
                scores[1] /= n;
                scores[2] /= n;

                image_data_new.data[i + 0] = Math.max(
                    0,
                    Math.min(255, scores[0] + Math.random() * r - r * 0.5)
                );
                image_data_new.data[i + 1] = Math.max(
                    0,
                    Math.min(255, scores[1] + Math.random() * r - r * 0.5)
                );
                image_data_new.data[i + 2] = Math.max(
                    0,
                    Math.min(255, scores[2] + Math.random() * r - r * 0.5)
                );
            }
        }
    }

    for (i = 0; i < width * height; i++) {
        image_data_old.data[i * 4 + 0] = image_data_new.data[i * 4 + 0];
        image_data_old.data[i * 4 + 1] = image_data_new.data[i * 4 + 1];
        image_data_old.data[i * 4 + 2] = image_data_new.data[i * 4 + 2];
    }

    ctx.putImageData(image_data_new, 0, 0);

    //DEBUG:
    //debug.textContent = JSON.stringify(totals);

    requestAnimationFrame(render);
}

render();

//setInterval(render, 10);
