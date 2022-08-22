var video = document.createElement("video");
video.crossOrigin = 'Anonymous';
video.style.display = 'none';
video.loop = true;

var painterCanvas = document.createElement('canvas');
var painterCtx = painterCanvas.getContext('2d');

var videoScale = 1.1;

@@include("canvas/common.js");
@@include("canvas/pixel_scale.js", { pixel_scale: 2 });
@@include("canvas/onResize.js", { afterResize: true, pixel_scale: true });

document.body.appendChild(video);

var videoUrls = [
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    //'//commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    //'//commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    //'//commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    //'//commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
];

video.controls = true;
video.src =  videoUrls[Math.floor(videoUrls.length * Math.random())];
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

var interval = 8;
var copies = 4;
var offset = interval * 3;

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

    if (frames.length > offset + interval * copies) frames.shift();

    for (let i = 0; i < imageDataPaint.data.length; i += 4) {
        imageDataPaint.data[i + 0] = currentFrame.data[i + 0];
        imageDataPaint.data[i + 1] = currentFrame.data[i + 1];
        imageDataPaint.data[i + 2] = currentFrame.data[i + 2];


        for (let j = offset - 1; j < frames.length; j += interval) {
            let diff = Math.abs(frames[0].data[i + 0] - frames[j].data[i + 0]) +
                        Math.abs(frames[0].data[i + 1] - frames[j].data[i + 1]) +
                        Math.abs(frames[0].data[i + 2] - frames[j].data[i + 2]);

            if (diff > 64) {
                imageDataPaint.data[i + 0] = frames[j].data[i + 0];
                imageDataPaint.data[i + 1] = frames[j].data[i + 1];
                imageDataPaint.data[i + 2] = frames[j].data[i + 2];
            }
        }

        imageDataPaint.data[i + 3] = 255;
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

    video.requestVideoFrameCallback(render);
});