var video = document.createElement("video");
video.crossOrigin = 'Anonymous';
video.style.display = 'none';
video.loop = true;

var painterCanvas = document.createElement('canvas');
var painterCtx = painterCanvas.getContext('2d');

var videoScale = 1.1;

@@include("canvas/common.js");
@@include("canvas/pixel_scale.js", { pixel_scale: 1 });
@@include("canvas/onResize.js", { afterResize: true, pixel_scale: true });

document.body.appendChild(video);

video.volume = 0;

var imageDataPaint = null;

var aspect = 1;

var videoWidth = 0;
var videoHeight = 0;

var scale = 1;

var sourceX = 0;
var sourceY = 0;

var sourceW = 0;
var sourceH = 0;

var coordMultiplier = 1;

var frames = [

];


var referenceFrame = false;
//Should the reference frame stay the same? If false it will be set to the oldest frame in memory
var useStaticReferenceFrame = false;

var copies = 3;

var threshold = 48;

function afterResize() {
    aspect = width / height;

    painterCanvas.width = width;
    painterCanvas.height = height;

    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) return;

    videoAspect = videoWidth / videoHeight;

    scale = 1;

    if (aspect <= videoAspect) {
        //screen is more landscape than video
        scale = height / videoHeight;
    } else {
        //Screen is more portrait than video
        scale = width / videoWidth;
    }

    scale *= videoScale;

    sourceW = width / scale;
    sourceH = height / scale;

    sourceX = Math.round(videoWidth * 0.5 - sourceW * 0.5);
    sourceY = Math.round(videoHeight * 0.5 - sourceH * 0.5);

    coordMultiplier = Math.round(width / 32);

    //coordMultiplier = 5;

    imageDataPaint = ctx.createImageData(width, height);
}

function render() {
    //painterCtx.fillStyle = 'black';
    //painterCtx.fillRect(0, 0, width, height);

    painterCtx.drawImage(
        video,
        sourceX, sourceY,
        sourceW, sourceH,
        0, 0, width, height
    );


    let currentFrame = painterCtx.getImageData(0, 0, width, height);

    frames.push(currentFrame);

    if (!useStaticReferenceFrame) referenceFrame = frames[0];

    if (frames.length > copies) frames.shift();

    for (let i = 0; i < imageDataPaint.data.length; i += 4) {
        let diff = Math.abs(referenceFrame.data[i + 0] - currentFrame.data[i + 0]) +
                    Math.abs(referenceFrame.data[i + 1] - currentFrame.data[i + 1]) +
                    Math.abs(referenceFrame.data[i + 2] - currentFrame.data[i + 2]);


        if (diff > threshold) {
            imageDataPaint.data[i + 0] = currentFrame.data[i + 0];
            imageDataPaint.data[i + 1] = currentFrame.data[i + 1];
            imageDataPaint.data[i + 2] = currentFrame.data[i + 2];

            imageDataPaint.data[i + 3] = (diff - threshold) * 2;
        } else {
            imageDataPaint.data[i + 3] = 0;
        }
    }

    ctx.putImageData(imageDataPaint, 0, 0);

    video.requestVideoFrameCallback(render);
}

var hasStarted = false;

video.addEventListener('canplay', function() {
    if (hasStarted) return;
    hasStarted = true;
    console.log('playing');
    video.play();

    afterResize();

    if (!hasStarted) {
        hasStarted = true;

        video.requestVideoFrameCallback(afterResize);

        video.requestVideoFrameCallback(render);

        if (window.self == window.top) {
            document.body.requestFullscreen();
        }
    }
});

navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
}).then(function(stream) {
    video.srcObject = stream;

    video.play();

    afterResize();

    if (!hasStarted) {
        hasStarted = true;

        video.requestVideoFrameCallback(afterResize);

        video.requestVideoFrameCallback(render);

        if (window.self == window.top) {
            document.body.requestFullscreen();
        }
    }
}).catch(function(err) {
    console.log('ERROR', err);
})

/*
var referenceToggle = document.createElement('button');
referenceToggle.textContent = 'Freeze Background';

referenceToggle.style.position = 'absolute';
referenceToggle.style.bottom = '10px';
referenceToggle.style.left = '50%';
referenceToggle.style.transform = 'translate(-50%)';
referenceToggle.style.padding = '8px 16px';

referenceToggle.addEventListener('click', function() {
    useStaticReferenceFrame = !useStaticReferenceFrame;

    if (useStaticReferenceFrame) {
        if (frames.length > 0) {
            referenceFrame = frames[frames.length - 1];
        }

        referenceToggle.textContent = 'Un-Freeze Background';
    } else {
        referenceToggle.textContent = 'Freeze Background';
    }
})

document.body.appendChild(referenceToggle);
*/