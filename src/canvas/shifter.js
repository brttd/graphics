---
scripts: [ oklab.js ]
---
@@include("canvas/common.js");

@@include("canvas/pixel_scale.js", { pixel_scale: 1 });

let imageData = false;
let newImageData = false;
let tmpImageData = false;

let img = document.createElement('img');

let o = 0;
let n = 0;

//0 = down
//1 = up
//2 = right
//3 = left
let lineDir = 2;
let lineStart = 10;

//Movement per pixel in direction perpendicular to main direction
//Between 1 and -1
let lineOffset = 0.2;

let lineSampleDir = [-1, -0.2];
let sampleLength = 0;

//How many pixels wide the line should be
let lineWidth = 10;

let currentLineOffset = 0;

let scaling = Math.min(width, height);

let t = Date.now();

let newT = 0;

let sX = 0;
let sY = 0;

let sA0 = 0;
let sA1 = 0;
let sA2 = 0;
let sA3 = 0;

let type = 'gradient';
let userType = queryParam('type');

if (userType === 'img' || userType === 'stripe') {
    type = userType;
}

let rendering = false;

let labL = 0.92;
let labC = 0.14;

function imageUrl() {
    return (
        "https://source.unsplash.com/random/?q=" +
        Math.random() * 100
    );
}

function afterResize() {
    start();
}

@@include("canvas/onResize.js", { afterResize: true, pixel_scale: true });

function pixelIndex(x, y) {
    return (((x % width) + width) % width) * 4 + (((y % height) + height) % height) * width * 4;
}

function random(min, max, round = false) {
    if (round) {
        return Math.round(min + Math.random() * (max - min));
    } else {
        return min + Math.random() * (max - min);
    }
}

function newLine() {
    lineWidth = random(
        0.02 * scaling,
        0.1 * scaling,
        true
    );

    lineDir = Math.floor(Math.random() * 4);

    lineOffset = random(-1, 1);

    if (lineDir === 0 || lineDir === 1) {
        lineStart = random(0, width, true);

        lineSampleDir = [
            lineOffset,
            lineDir === 0 ? 1 : -1
        ];
    } else {
        lineStart = random(0, height, true);

        lineSampleDir = [
            lineDir === 2 ? 1 : -1,
            lineOffset
        ];
    }

    sampleLength = random(
        1,
        3 + scaling * 0.02,
        true
    );

    lineSampleDir[0] *= sampleLength;
    lineSampleDir[1] *= sampleLength;
}

function updateSampleAt(x, y) {
    x = ((x % width) + width) % width;
    y = ((y % height) + height) % height;

    //Current pixel index
    o = pixelIndex(~~x, ~~y);

    sX = (((x + lineSampleDir[0]) % width) + width) % width;
    sY = (((y + lineSampleDir[1]) % height) + height) % height;

    if (false) {
        //Pixel index to sample
        n = pixelIndex(Math.round(sX), Math.round(sY));

        newImageData.data[o + 0] = imageData.data[n + 0];
        newImageData.data[o + 1] = imageData.data[n + 1];
        newImageData.data[o + 2] = imageData.data[n + 2];
    } else {
        /*
        0, 1
        2, 3
        */

        sA0 = Math.abs(sX - ~~(sX))     + Math.abs(sY - ~~(sY));
        sA1 = Math.abs(sX - ~~(sX + 1)) + Math.abs(sY - ~~(sY));
        sA2 = Math.abs(sX - ~~(sX))     + Math.abs(sY - ~~(sY + 1));
        sA3 = Math.abs(sX - ~~(sX + 1)) + Math.abs(sY - ~~(sY + 1));

        sA0 = Math.max(0, 1 - sA0);
        sA1 = Math.max(0, 1 - sA1);
        sA2 = Math.max(0, 1 - sA2);
        sA3 = Math.max(0, 1 - sA3);

        //Pixel index to sample from (0)
        n = pixelIndex(~~(sX), ~~(sY));

        newImageData.data[o + 0] = imageData.data[n + 0] * sA0;
        newImageData.data[o + 1] = imageData.data[n + 1] * sA0;
        newImageData.data[o + 2] = imageData.data[n + 2] * sA0;

        //Pixel index to sample from (1)
        n = pixelIndex(~~(sX + 1), ~~(sY));

        newImageData.data[o + 0] += imageData.data[n + 0] * sA1;
        newImageData.data[o + 1] += imageData.data[n + 1] * sA1;
        newImageData.data[o + 2] += imageData.data[n + 2] * sA1;

        //Pixel index to sample from (2)
        n = pixelIndex(~~(sX), ~~(sY + 1));

        newImageData.data[o + 0] += imageData.data[n + 0] * sA2;
        newImageData.data[o + 1] += imageData.data[n + 1] * sA2;
        newImageData.data[o + 2] += imageData.data[n + 2] * sA2;

        //Pixel index to sample from (3)
        n = pixelIndex(~~(sX + 1), ~~(sY + 1));

        newImageData.data[o + 0] += imageData.data[n + 0] * sA3;
        newImageData.data[o + 1] += imageData.data[n + 1] * sA3;
        newImageData.data[o + 2] += imageData.data[n + 2] * sA3;
    }
}

function render() {
    d = Date.now() - t;
    t += d;

    if (newT >= 600) {
        imageData = ctx.getImageData(0, 0, width, height);
        newLine();

        newT = 0;
    }
    newT += d;

    //Swap imagedata
    tmpImageData = newImageData;

    newImageData = imageData;
    imageData = tmpImageData;

    if (lineDir === 0) {
        //top -> bottom
        currentLineOffset = lineStart;

        for (y = 0; y < height; y++) {
            for (x = 0; x < lineWidth; x++) {
                updateSampleAt(x + ~~currentLineOffset, y);
            }

            currentLineOffset += lineOffset;
        }
    } else if (lineDir === 1) {
        //bottom -> top
        currentLineOffset = lineStart;

        for (y = height - 1; y >= 0; y--) {
            for (x = 0; x < lineWidth; x++) {
                updateSampleAt(x + ~~currentLineOffset, y);
            }

            currentLineOffset += lineOffset;
        }
    } else if (lineDir === 2) {
        //left - right
        currentLineOffset = lineStart;

        for (x = 0; x < width; x++) {
            for (y = 0; y < lineWidth; y++) {
                updateSampleAt(x, y + ~~currentLineOffset);
            }

            currentLineOffset += lineOffset;
        }
    } else if (lineDir === 3) {
        //right -> left
        currentLineOffset = lineStart;

        for (x = width - 1; x >= 0; x--) {
            for (y = 0; y < lineWidth; y++) {
                updateSampleAt(x, y + ~~currentLineOffset);
            }

            currentLineOffset += lineOffset;
        }
    }

    ctx.putImageData(newImageData, 0, 0);

    requestAnimationFrame(render);
}

function startRender() {
    imageData = ctx.getImageData(0, 0, width, height);
    newImageData = ctx.getImageData(0, 0, width, height);

    if (!rendering) {
        rendering = true;

        render();
    }
}

function start() {
    newLine();

    if (type === 'gradient') {
        for (let i = 0; i < height; i++) {
            let c = oklab_lch(labL, labC, (i / height) * 6.28319);

            c[0] *= 255;
            c[1] *= 255;
            c[2] *= 255;

            ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';

            ctx.fillRect(0, i, width, 1);
        }

        startRender();
    } else if (type === 'stripe') {
        let i = 0;

        let stripeSize = 10;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'black';
        for (i = 0; i < height; i += stripeSize * 2) {
            ctx.fillRect(0, i, width, stripeSize);
        }

        startRender();
    } else {
        img.onload = function () {
            ctx.drawImage(img, 0, 0, width, height);

            startRender();
        };

        img.crossOrigin = "Anonymous";
        img.src = imageUrl();
    }
}

afterResize();
start();