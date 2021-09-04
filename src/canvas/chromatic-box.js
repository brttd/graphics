---
scripts: [ matter-0.17.1.js ]
---
@@include("canvas/common.js");

@@include("canvas/pixel_scale.js", { pixel_scale: 1 });

var engine = Matter.Engine.create();

var imageData;
var imageDataPaint;

var boundsSize = 100;

var boundsPadding = -2;



/*
*--*-----*--*
|##|XXXXX|##|
*--@-----@--*
|XX|     |XX|
|XX|     |XX|
|XX|     |XX|
|XX|     |XX|
*--@-----@--*
|##|XXXXX|##|
*--*-----*--*

*/

var worldBounds = [
    //Above
    Matter.Bodies.rectangle(
        width / 2, -boundsSize / 2,
        width + boundsSize * 2, boundsSize,
        {
            isStatic: true,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            restitution: 1
        }
    ),
    //Below
    Matter.Bodies.rectangle(
        width / 2, height + boundsSize / 2,
        width + boundsSize * 2, boundsSize,
        {
            isStatic: true,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            restitution: 1.5
        }
    ),
    //Left
    Matter.Bodies.rectangle(
        -boundsSize / 2, height / 2,
        boundsSize, height + boundsSize * 2,
        {
            isStatic: true,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            restitution: 1.5
        }
    ),
    //Right
    Matter.Bodies.rectangle(
        width + boundsSize / 2, height / 2,
        boundsSize, height + boundsSize * 2,
        {
            isStatic: true,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            restitution: 1.5
        }
    ),
]

function afterResize() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    imageData = ctx.getImageData(0, 0, width, height);
    imageDataPaint = ctx.getImageData(0, 0, width, height);

    //Above
    Matter.Body.setPosition(
        worldBounds[0],
        { x: width / 2, y: -boundsSize / 2 + boundsPadding }
    );
    Matter.Body.scale(
        worldBounds[0],
        width / (worldBounds[0].bounds.max.x - worldBounds[0].bounds.min.x),
        1
    );

    //Below
    Matter.Body.setPosition(
        worldBounds[1],
        { x: width / 2, y: height + boundsSize / 2 - boundsPadding }
    );
    Matter.Body.scale(
        worldBounds[1],
        width / (worldBounds[1].bounds.max.x - worldBounds[1].bounds.min.x),
        1
    );

    //Left
    Matter.Body.setPosition(
        worldBounds[2],
        { x: -boundsSize / 2 + boundsPadding, y: height / 2 }
    );
    Matter.Body.scale(
        worldBounds[2],
        1,
        height / (worldBounds[2].bounds.max.y - worldBounds[2].bounds.min.y),
    );

    //Right
    Matter.Body.setPosition(
        worldBounds[3],
        { x: width + boundsSize / 2 - boundsPadding, y: height / 2 }
    );
    Matter.Body.scale(
        worldBounds[3],
        1,
        height / (worldBounds[3].bounds.max.y - worldBounds[3].bounds.min.y),
    );

    ctx.fillStyle = '#000';
}

@@include("canvas/onResize.js", { afterResize: true, pixel_scale: true });


var boxes = [ ];

var boxDensity = parseInt(queryParam('density', 80));

if (!isFinite(boxDensity) || boxDensity < 0 || boxDensity > 100) {
    boxDensity = 80;
}

var tailLength = parseFloat(queryParam('trail', 3));

if (!isFinite(tailLength) || tailLength < 0) {
    tailLength = 3;
}
if (tailLength > 50) {
    tailLength = 50;
}

var nEnd = width * height;
nEnd /= (((100 / pixel_scale) * (100 / pixel_scale)) / (boxDensity / 100));

for (var n = 0; n < nEnd; n++) {
    var size = Math.random() * 50 + 50;
    size /= pixel_scale;

    boxes.push( Matter.Bodies.rectangle(
        size + Math.random() * (width - size * 2),
        size + Math.random() * (height - size * 2),
        size, size, {
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        restitution: 1.02,
    }))
}

Matter.Composite.add(engine.world, boxes);
Matter.Composite.add(engine.world, worldBounds);

var i = 0;
var j = 0;

var hue = 0;

var sat = 0.75;
var light = 0.5;

var q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
var p = 2 * light - q;

var t = Date.now();
var d = 0;

var step = 0;
var stepSize = 8;

var maxSteps = stepSize * 20;

var onethird = 1/3;
var twothird = 2/3;

function h2rgb(t) {
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}


function render() {
    d = Date.now() - t;
    t += d;

    imageDataPaint = ctx.getImageData(0, 0, width, height);

    for (i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = imageDataPaint.data[i] === 0 ? 0 :
            (imageData.data[i] + d / tailLength);

        if (imageData.data[i] >= 255) {
            imageDataPaint.data[i] =
                imageDataPaint.data[i + 1] =
                imageDataPaint.data[i + 2] = 255;
        } else {
            hue = imageData.data[i] / 255;

            imageDataPaint.data[i + 1] = h2rgb(hue) * 255;

            hue += onethird;

            if (hue > 1) hue -= 1;
            imageDataPaint.data[i]     = h2rgb(hue) * 255;

            hue -= twothird;
            imageDataPaint.data[i + 2] = h2rgb(hue < 0 ? (hue + 1) : hue) * 255;
        }
    }

    ctx.putImageData(imageDataPaint, 0, 0);

    for (step = 0; step < d && step < maxSteps; step += stepSize) {
        Matter.Engine.update(engine, Math.min(stepSize, d - step));

        ctx.beginPath();

        for (i = 0; i < boxes.length; i++) {
            ctx.moveTo(
                boxes[i].vertices[0].x,
                boxes[i].vertices[0].y
            );

            for (j = 1; j < boxes[i].vertices.length; j++) {
                ctx.lineTo(
                    boxes[i].vertices[j].x,
                    boxes[i].vertices[j].y
                );
            }

            ctx.closePath();

            if (step === 0 && boxes[i].speed < 0.1) {
                Matter.Body.setVelocity(
                    boxes[i],
                    Matter.Vector.mult(Matter.Vector.normalise({
                        x: Math.random() - 0.5,
                        y: Math.random() - 0.5
                    }), 3)
                );
            }
        }

        ctx.fill();
    }

    requestAnimationFrame(render);
}

function start() {
    engine.gravity.scale = 0;

    for (i = 0; i < boxes.length; i++) {
        Matter.Body.setAngularVelocity(
            boxes[i],
            (Math.random() - 0.5) * Math.PI * 0.1
        );
    }

    render();
}

start();