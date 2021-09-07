@@include("canvas/common.js");
@@include("canvas/noise.js");

var gridWidth = 5;
var gridHeight = 5;

var gridPaddingX = 0;
var gridPaddingY = 0;

var gridSize = 50;
var boxSize = 45;

var boxX = 0;
var boxY = 0;
var boxW = 0;
var boxH = 0;

function afterResize() {
    boxSize = Math.round(Math.max(20, 20 + (width + height) / 130));
    gridSize = Math.round(boxSize * 1.12);

    boxX = -boxSize / 2;
    boxY = -boxSize * 0.1;
    boxW = boxSize;
    boxH = boxSize * 0.2;

    gridWidth = Math.max(3, Math.floor(width / gridSize) - 2);
    gridHeight = Math.max(3, Math.floor(height / gridSize) - 2);

    gridPaddingX = (width - (gridWidth * gridSize)) / 2;
    gridPaddingY = (height - (gridHeight * gridSize)) / 2;
}

@@include("canvas/onResize.js", { afterResize: true });

var x = 0;
var y = 0;

var i = 0;
var j = 0;

var t = 0;

var noiseSpeed = 500 * 1000;
var noiseScale = 900;
var colorScale = 0.1;

function render() {
    t = Date.now() / (noiseSpeed);

    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillRect(0, 0, width, height);

    for (x = 0; x <= gridWidth; x++) {
        for (y = 0; y <= gridHeight; y++) {
            i = noise(
                (x / noiseScale),
                (y / noiseScale),
                t
            );

            j = noise(
                (-y / (noiseScale * colorScale)) * (0.5 + i * 0.5),
                (x / (noiseScale * colorScale)) * (0.5 + (1 - i) * 0.5),
                -t / colorScale
            );

            ctx.fillStyle = 'hsl(' + (j * 360) + ',50%,50%)';

            ctx.translate(x * gridSize + gridPaddingX, y * gridSize + gridPaddingY);

            ctx.rotate(i * 360);

            ctx.fillRect(boxX, boxY, boxW, boxH);

            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }

    requestAnimationFrame(render);
}

render();