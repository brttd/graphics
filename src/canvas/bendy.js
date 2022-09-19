@@include("canvas/common.js");

const pi = Math.PI;
const twopi = Math.PI * 2;
const halfpi = Math.PI * 0.5;

let points = [
    [window.innerWidth / 2, window.innerHeight / 2]
];

//Number of lines next to eachother
let lCount = 3;
//width of each line in pixels
let lWidth = 20;

let lFullWidth = lWidth * (lCount + 2)

//Pixels per second
let lpSpeed = 220;
//Radians per second
let lrSpeed = 90 * (Math.PI / 180)

let lBackground = '#fff';
let lColor = '#ff0000';

let safety = 0.2;

let speed = 1;

let lines = [

];

//TODO:
//Implement canvas padding, so view is essentially "zoomed in"

//TODO: Start on edges, moving directly inwards
for (let i = 0; i < 10; i++) {
    lines.push([
        0,
        Math.random() * twopi,
        Math.random() * width,
        Math.random() * height,
        0,
        Math.random() * 1
    ])
}

let t = Date.now() * 0.001;

function render() {
    d = Date.now() * 0.001 - t;
    t += d;

    d *= speed;

    ctx.lineWidth = lWidth;

    for (let i = 0; i < lines.length; i++) {
        let lSafety = Math.min(lines[i][4], safety);

        if (lines[i][0] === 0) {
            //Moving straight
            /*
            VECTOR = [1, 0]

            Rotate vector by angle of line:

            x = x * cos(angle) - y * sin(angle)
            y = x * sin(angle) + y * cos(angle)

            y is 0, so it can be simplified to:
            x = 1 * sin(angle)
            y = 1 * cos(angle)
            */
            let x = Math.cos(lines[i][1]);
            let y = Math.sin(lines[i][1]);

            /*
            To get normal vector,
            a 90 deg counter-clockwise rotation is required:
            nx = y
            ny = -x
            */

            for (let j = 0; j < lCount; j++) {
                ctx.beginPath();

                ctx.moveTo(
                    lines[i][2] + y * (j + 0.25) * lWidth * 2 - x * lpSpeed * lSafety,
                    lines[i][3] - x * (j + 0.25) * lWidth * 2 - y * lpSpeed * lSafety
                );
                ctx.lineTo(
                    lines[i][2] + y * (j + 0.25) * lWidth * 2 + x * lpSpeed * d,
                    lines[i][3] - x * (j + 0.25) * lWidth * 2 + y * lpSpeed * d
                );

                ctx.strokeStyle = lColor;
                ctx.stroke();

                if (j !== lCount - 1) {
                    ctx.beginPath();

                    ctx.moveTo(
                        lines[i][2] + y * (j + 0.75) * lWidth * 2 - x * lpSpeed * lSafety,
                        lines[i][3] - x * (j + 0.75) * lWidth * 2 - y * lpSpeed * lSafety
                    );
                    ctx.lineTo(
                        lines[i][2] + y * (j + 0.75) * lWidth * 2 + x * lpSpeed * d,
                        lines[i][3] - x * (j + 0.75) * lWidth * 2 + y * lpSpeed * d
                    );

                    ctx.strokeStyle = lBackground;
                    ctx.stroke();
                }
            }

            lines[i][2] += x * lpSpeed * d;
            lines[i][3] += y * lpSpeed * d;

            lines[i][2] = (lines[i][2] + width) % width;
            lines[i][3] = (lines[i][3] + height) % height;
        } else if (lines[i][0] === 1) {
            //Rotating clockwise around point
            for (let j = 0; j < lCount; j++) {
                ctx.beginPath();

                ctx.arc(
                    lines[i][2],
                    lines[i][3],
                    (j + 0.25) * lWidth * 2,
                    //0 degrees -> [1, 0],
                    //so to align arcs, they need to be rotated -90 degrees
                    lines[i][1] - halfpi - lrSpeed * lSafety,
                    lines[i][1] - halfpi + lrSpeed * d
                );

                ctx.strokeStyle = lColor;
                ctx.stroke();

                if (j !== lCount - 1) {
                    ctx.beginPath();

                    ctx.arc(
                        lines[i][2],
                        lines[i][3],

                        (j + 0.75) * lWidth * 2,
                        lines[i][1] - halfpi - lrSpeed * lSafety,
                        lines[i][1] - halfpi + lrSpeed * d
                    );

                    ctx.strokeStyle = lBackground;
                    ctx.stroke();
                }
            }

            lines[i][1] += lrSpeed * d;
            lines[i][1] %= twopi;
        } else if (lines[i][0] === - 1) {
            //Rotating counter-clockwise around point

            //See comment on rotation, and normals at beginning of "Moving straight" section
            let nx = Math.sin(lines[i][1]);
            let ny = -Math.cos(lines[i][1]);

            for (let j = 0; j < lCount; j++) {
                ctx.beginPath();

                ctx.arc(
                    lines[i][2] + nx * lFullWidth,
                    lines[i][3] + ny * lFullWidth,

                    (j + 0.25) * lWidth * 2,
                    //0 degrees -> [1, 0],
                    //so to align arcs, they need to be rotated +90 degrees
                    lines[i][1] + halfpi + lrSpeed * lSafety,
                    lines[i][1] + halfpi - lrSpeed * d,
                    true
                );

                ctx.strokeStyle = lColor;
                ctx.stroke();

                if (j !== lCount - 1) {
                    ctx.beginPath();

                    ctx.arc(
                        lines[i][2] + nx * lFullWidth,
                        lines[i][3] + ny * lFullWidth,

                        (j + 0.75) * lWidth * 2,
                        lines[i][1] + halfpi + lrSpeed * lSafety,
                        lines[i][1] + halfpi - lrSpeed * d,
                        true
                    );

                    ctx.strokeStyle = lBackground;
                    ctx.stroke();
                }
            }

            lines[i][2] -= nx * lFullWidth;
            lines[i][3] -= ny * lFullWidth;

            //Rotate n
            let x = nx;
            let y = ny;

            nx = x * Math.cos(lrSpeed * d) - y * Math.sin(lrSpeed * d)
            ny = x * Math.sin(lrSpeed * d) + y * Math.cos(lrSpeed * d)

            lines[i][2] += nx * lFullWidth;
            lines[i][3] += ny * lFullWidth;

            lines[i][1] -= lrSpeed * d;
            lines[i][1] = ((lines[i][1] % twopi) + twopi) % twopi;
        }

        lines[i][4] += d;

        if (lines[i][4] > lines[i][5]) {
            lines[i][4] = 0;

            if (lines[i][0] === 0) {
                lines[i][0] = Math.random() > 0.5 ? -1 : 1;
                lines[i][5] = 0.5 + Math.random() * 2;
            } else {
                lines[i][0] = 0;
                lines[i][5] = 1 + Math.random() * 2;
            }
        }
    }

    requestAnimationFrame(render);
}

function start() {

}

function afterResize() {
    start();
}

@@include("canvas/onResize.js", { afterResize: true });

afterResize();
render();