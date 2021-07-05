@@include("canvas/common.js");
@@include("canvas/noise.js");

@@include("canvas/pixel_scale.js", { pixel_scale: 5 });

var img = document.createElement("img");

var rendering = false;

var imageData = false;
var newImageData = false;
var tmpImageData = false;

function imageUrl() {
    return (
        "https://source.unsplash.com/random/" +
        window.innerWidth.toString() +
        "x" +
        window.innerHeight.toString() +
        "?q=" +
        Math.random() * 100
    );
}

function afterResize() {
    /* TODO
    if (img.width / img.height > width / height) {

    } else {

    }
    */

    ctx.drawImage(img, 0, 0, width, height);
    ctx.fillStyle = "black";

    ctx.fillRect(0, 0, width, height);

    imageData = ctx.getImageData(0, 0, width, height);
    newImageData = ctx.getImageData(0, 0, width, height);
}

@@include("canvas/onResize.js", { afterResize: true, pixel_scale: true });

var up = [0, 1];
var tmpVec = [0, 0];

var t = 0;

function rotate(vec, angle) {
    angle = (angle * Math.PI) / 180;

    let c = Math.cos(angle);
    let s = Math.sin(angle);

    return [vec[0] * c - vec[1] * s, vec[0] * s + vec[1] * c];
}

function rotateApply(vec, angle, target) {
    angle = (angle * Math.PI) / 180;

    let c = Math.cos(angle);
    let s = Math.sin(angle);

    target[0] = vec[0] * c - vec[1] * s;
    target[1] = vec[0] * s + vec[1] * c;
}

function pixelIndex(x, y) {
    return x * 4 + y * width * 4;
}

var opts = {
    dispMax: 3,
    dispMin: 0,

    macroScale: 1 / 800,
    macroSpeed: 0.0001 * 0.1,

    noiseScale: 1 / 200,
    noiseSpeed: 0.0005 * 0.1,
};

opts.dispMult = opts.dispMax - opts.dispMin;

let o = 0;
let n = 0;
let amount = 0;
let dist = 0;
let angle = 0;

let total = 0;

function render() {
    t = Date.now();

    //Swap imagedata
    tmpImageData = newImageData;

    newImageData = imageData;
    imageData = tmpImageData;

    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            angle = noise(
                x * opts.noiseScale,
                y * opts.noiseScale,
                t * opts.noiseSpeed
            );
            dist =
                noise(
                    x * opts.noiseScale,
                    y * opts.noiseScale,
                    -t * opts.noiseSpeed
                ) *
                    opts.dispMult +
                opts.dispMin;

            rotateApply(up, angle * 360 * 2, tmpVec);

            tmpVec[0] = (((x + tmpVec[0] * dist) % width) + width) % width;
            tmpVec[1] = (((y + tmpVec[1] * dist) % height) + height) % height;

            n = pixelIndex(x, y);
            o = pixelIndex(Math.floor(tmpVec[0]), Math.floor(tmpVec[1]));

            newImageData.data[n + 0] = imageData.data[o + 0];
            newImageData.data[n + 1] = imageData.data[o + 1];
            newImageData.data[n + 2] = imageData.data[o + 2];

            o = pixelIndex(Math.ceil(tmpVec[0]), Math.ceil(tmpVec[1]));

            newImageData.data[n + 0] += imageData.data[o + 0];
            newImageData.data[n + 1] += imageData.data[o + 1];
            newImageData.data[n + 2] += imageData.data[o + 2];

            newImageData.data[n + 0] /= 2;
            newImageData.data[n + 1] /= 2;
            newImageData.data[n + 2] /= 2;

            total = Math.max(
                1.5,
                newImageData.data[n + 0] +
                    newImageData.data[n + 1] +
                    newImageData.data[n + 2]
            );

            amount = Math.max(0.1, Math.min(2, total / 200));

            newImageData.data[n + 0] +=
                (Math.max(1, newImageData.data[n + 0]) / total) *
                (Math.random() * 3 - amount);
            newImageData.data[n + 1] +=
                (Math.max(1, newImageData.data[n + 1]) / total) *
                (Math.random() * 3 - amount);
            newImageData.data[n + 2] +=
                (Math.max(1, newImageData.data[n + 2]) / total) *
                (Math.random() * 3 - amount);
        }
    }

    ctx.putImageData(newImageData, 0, 0);

    requestAnimationFrame(render);
}

/*
img.onload = function () {
    afterResize();

    if (!rendering) {
        rendering = true;

        render();
    }
};

img.crossOrigin = "Anonymous";
img.src = imageUrl();
*/

afterResize();
render();
