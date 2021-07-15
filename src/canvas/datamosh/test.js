var video = document.createElement("video");
video.crossOrigin = 'Anonymous';
video.style.display = 'none';
video.loop = true;

var painterCanvas = document.createElement('canvas');
var painterCtx = painterCanvas.getContext('2d');

@@include("canvas/common.js");
@@include("canvas/pixel_scale.js", { pixel_scale: 2 });
@@include("canvas/onResize.js", { afterResize: true, pixel_scale: true });

document.body.appendChild(video);

var videoUrls = [
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    '//commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
];

video.controls = true;
video.src =  videoUrls[Math.round((videoUrls.length - 1) * Math.random())];
video.volume = 0;

var imageData = null;
var imageDataPaint = null;
var prevImageDataPaint = null;
var prevImageData = null;

var aspect = 1;

var videoWidth = 0;
var videoHeight = 0;

var scale = 1;

var i = 0;

var sourceX = 0;
var sourceY = 0;

var sourceW = 0;
var sourceH = 0;

var coordMultiplier = 1;

function afterResize() {
    aspect = width / height;

    painterCanvas.width = width;
    painterCanvas.height = height;

    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;

    if (!prevImageData) {
        imageData = ctx.createImageData(width, height);
        prevImageData = ctx.createImageData(width, height);
        prevImageDataPaint = ctx.createImageData(width, height);
    }

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

    sourceW = width / scale;
    sourceH = height / scale;

    sourceX = Math.round(videoWidth * 0.5 - sourceW * 0.5);
    sourceY = Math.round(videoHeight * 0.5 - sourceH * 0.5);

    coordMultiplier = Math.round(width / 127);

    //coordMultiplier = 5;
}

function render() {
    painterCtx.fillStyle = 'black';
    painterCtx.fillRect(0, 0, width, height);

    painterCtx.drawImage(
        video,
        sourceX, sourceY,
        sourceW, sourceH,
        0, 0, width, height
    );
    imageData = painterCtx.getImageData(0, 0, width, height);
    imageDataPaint = ctx.createImageData(width, height);

    for (i = 0; i < imageDataPaint.data.length; i += 4) {
        imageDataPaint.data[i] = ((imageData.data[i] % prevImageData.data[i]) + 256) % 256;
        imageDataPaint.data[i + 1] = ((imageData.data[i + 1] % prevImageData.data[i + 1]) + 256) % 256;
        imageDataPaint.data[i + 2] = ((imageData.data[i + 2] % prevImageData.data[i + 2]) + 256) % 256;
        
        imageDataPaint.data[i] = (imageDataPaint.data[i] * .4 + prevImageDataPaint.data[i] * 0.7) % 256;
        imageDataPaint.data[i + 1] = (imageDataPaint.data[i + 1] * .4 + prevImageDataPaint.data[i + 1] * 0.7) % 6;
        imageDataPaint.data[i + 2] = (imageDataPaint.data[i + 2] * .4 + prevImageDataPaint.data[i + 2] * 0.7) % 256;
        imageDataPaint.data[i + 3] = 255;
        
        //imageDataPaint.data[i] = imageData.data[(i + (prevImageDataPaint.data[i + 0] - 128) * coordMultiplier) % //imageDataPaint.data.length];
        //imageDataPaint.data[i + 1] = imageData.data[(i + 1 + (prevImageDataPaint.data[i + 0] - 128) * //coordMultiplier) % imageDataPaint.data.length];
        //imageDataPaint.data[i + 2] = imageData.data[(i + 2 + (prevImageDataPaint.data[i + 0] - 128) * //coordMultiplier) % imageDataPaint.data.length];
        //imageDataPaint.data[i + 3] = 255;
    }

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    ctx.putImageData(imageDataPaint, 0, 0);

    prevImageData = imageData;
    prevImageDataPaint = imageDataPaint;

    video.requestVideoFrameCallback(render);
}

function start() {
    video.addEventListener('canplay', function() {
        console.log('playing');
        video.play();

        afterResize();

        video.requestVideoFrameCallback(render);
    });
}

start();
