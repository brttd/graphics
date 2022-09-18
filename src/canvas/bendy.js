@@include("canvas/common.js");

const pi = Math.PI;
const twopi = Math.PI * 2;

let points = [
    [window.innerWidth / 2, window.innerHeight / 2]
];

//Number of lines next to eachother
let lCount = 3;
//width of each line in pixels
let lWidth = 20;

//Pixels per second
let lpSpeed = 220;
//Radians per second
let lrSpeed = 90 * (Math.PI / 180)

let lBackground = '#fff';
let lColor = '#ff0000';

let safety = 0.2;

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
        Math.random() * 3
    ])
}


console.log(lines)


let t = Date.now() * 0.001;

function render() {
    d = Date.now() * 0.001 - t;
    t += d;

    for (let i = 0; i < lines.length; i++) {
        let lSafety = Math.min(lines[i][4], safety);

        if (lines[i][0] === 0) {
            //Moving straight
            /*
            VECTOR = [0, -1]
            */
            let x = Math.sin(lines[i][1]) * -1;
            let y = Math.cos(lines[i][1]) * -1;

            ctx.lineWidth = lWidth;

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
        } else {
            //Rotating around point
            ctx.lineWidth = lWidth;

            //TODO: Implement counter-clockwise rotations

            for (let j = 0; j < lCount; j++) {
                ctx.beginPath();

                ctx.arc(
                    lines[i][2],
                    lines[i][3],

                    (j + 0.25) * lWidth * 2,
                    pi - lines[i][1] + lrSpeed * lines[i][0] * lSafety,
                    pi - lines[i][1] - lrSpeed * d * lines[i][0],
                    lines[i][0] === 1
                );

                ctx.strokeStyle = lColor;
                ctx.stroke();

                if (j !== lCount - 1) {
                    ctx.beginPath();

                    ctx.arc(
                        lines[i][2],
                        lines[i][3],

                        (j + 0.75) * lWidth * 2,
                        pi - lines[i][1] + lrSpeed * lines[i][0] * lSafety,
                        pi - lines[i][1] - lrSpeed * d * lines[i][0],
                        lines[i][0] === 1
                    );

                    ctx.strokeStyle = lBackground;
                    ctx.stroke();
                }
            }

            lines[i][1] -= lrSpeed * d * lines[i][0];
            lines[i][1] %= twopi;
        }

        lines[i][4] += d;

        if (lines[i][4] > lines[i][5]) {
            lines[i][4] = 0;

            if (lines[i][0] === 0) {
                lines[i][0] = 1;
                lines[i][5] = Math.random() * 2;
            } else {
                lines[i][0] = 0;
                lines[i][5] = Math.random() * 4;
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