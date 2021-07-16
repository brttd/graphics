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

var imageData = null;
var imageDataPaint = null;
var prevImageDataPaint = null;
var prevImageData = null;

var aspect = 1;

var videoWidth = 0;
var videoHeight = 0;

var scale = 1;

var i = 0;
var j = 0;

var t = 0;
var t1 = 0;
var t2 = 0;

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

    scale *= videoScale;

    sourceW = width / scale;
    sourceH = height / scale;

    sourceX = Math.round(videoWidth * 0.5 - sourceW * 0.5);
    sourceY = Math.round(videoHeight * 0.5 - sourceH * 0.5);

    coordMultiplier = Math.round(width / 32);

    //coordMultiplier = 5;
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
    imageData = painterCtx.getImageData(0, 0, width, height);
    imageDataPaint = ctx.createImageData(width, height);

    t1 = 0;

    for (i = 0; i < imageDataPaint.data.length; i += 4) {
        j = Math.max(imageData.data[i + 0], imageData.data[i + 1], imageData.data[i + 2]) * 0.85 +
            Math.min(prevImageDataPaint.data[i + 0], prevImageDataPaint.data[i + 1], prevImageDataPaint.data[i + 2]) * 0.15;
        
        t1 += ~~(Math.min(prevImageData.data[i + 0], prevImageData.data[i + 1], prevImageData.data[i + 2]) / 192);

        imageDataPaint.data[i + 3] = 255;

        if (j < 51) {
            //Scanline Datamosh
            imageDataPaint.data[i + 0] = imageData.data[(i + 0 + t1 * 4) % imageData.data.length];
            imageDataPaint.data[i + 1] = imageData.data[(i + 1 + t1 * 4) % imageData.data.length];
            imageDataPaint.data[i + 2] = imageData.data[(i + 2 + t1 * 4) % imageData.data.length];
        } else if (j < 104) {
            //Color accumulate & wrap
            imageDataPaint.data[i + 0] = ((imageData.data[i + 0] + prevImageData.data[i + 0]) + 256) % 256;
            imageDataPaint.data[i + 1] = ((imageData.data[i + 1] + prevImageData.data[i + 1]) + 256) % 256;
            imageDataPaint.data[i + 2] = ((imageData.data[i + 2] + prevImageData.data[i + 2]) + 256) % 256;
            
            imageDataPaint.data[i + 0] = (imageDataPaint.data[i + 0] * .4 + prevImageDataPaint.data[i + 0] * 0.7) % 256;
            imageDataPaint.data[i + 1] = (imageDataPaint.data[i + 1] * .4 + prevImageDataPaint.data[i + 1] * 0.7) % 256;
            imageDataPaint.data[i + 2] = (imageDataPaint.data[i + 2] * .4 + prevImageDataPaint.data[i + 2] * 0.7) % 256;
            
        } else if (j < 153) {
            //Pixel Shift - horizontal duplicate / glass emboss
            t = Math.round(Math.min(imageData.data[i + 0], imageData.data[i + 1], imageData.data[i + 2]) / 10) * 16;
            
            imageDataPaint.data[i + 0] = imageData.data[(i + 0 + (t - 128) * 20) % imageDataPaint.data.length];
            imageDataPaint.data[i + 1] = imageData.data[(i + 1 + (t - 128) * 20) % imageDataPaint.data.length];
            imageDataPaint.data[i + 2] = imageData.data[(i + 2 + (t - 128) * 20) % imageDataPaint.data.length];
        } else if (j < 204) {
            /*
            //Pixel Shift - horizontal duplicate / glass emboss
            //(Version 2)
            t = Math.round(Math.max(imageData.data[i + 0], imageData.data[i + 1], imageData.data[i + 2]) / 10) * 16;
            
            imageDataPaint.data[i + 0] = imageData.data[(i + 0 + (t - 128) * coordMultiplier) % imageDataPaint.data.length];
            imageDataPaint.data[i + 1] = imageData.data[(i + 1 + (t - 128) * coordMultiplier) % imageDataPaint.data.length];
            imageDataPaint.data[i + 2] = imageData.data[(i + 2 + (t - 128) * coordMultiplier) % imageDataPaint.data.length];
            */
            //Scanline Datamosh
            imageDataPaint.data[i + 0] = imageData.data[(i + 0 + t1 * 4) % imageData.data.length];
            imageDataPaint.data[i + 1] = imageData.data[(i + 1 + t1 * 4) % imageData.data.length];
            imageDataPaint.data[i + 2] = imageData.data[(i + 2 + t1 * 4) % imageData.data.length];
        } else {
            //Contrast Chaos + Noise
            imageDataPaint.data[i + 0] = ((imageData.data[i + 0] % prevImageData.data[i + 0]) + 256) % 256;
            imageDataPaint.data[i + 1] = ((imageData.data[i + 1] % prevImageData.data[i + 1]) + 256) % 256;
            imageDataPaint.data[i + 2] = ((imageData.data[i + 2] % prevImageData.data[i + 2]) + 256) % 256;
            
            imageDataPaint.data[i + 0] = (imageDataPaint.data[i + 0] * .5 + prevImageDataPaint.data[i + 0] * 0.6) % 256;
            imageDataPaint.data[i + 1] = (imageDataPaint.data[i + 1] * .5 + prevImageDataPaint.data[i + 1] * 0.6) % 256;
            imageDataPaint.data[i + 2] = (imageDataPaint.data[i + 2] * .5 + prevImageDataPaint.data[i + 2] * 0.6) % 256;
        }
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
