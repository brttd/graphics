function onResize() {
    @@if (this.pixel_scale !== undefined && this.pixel_scale !== false) {
        width = canvas.width = ~~(window.innerWidth / pixel_scale + 1);
        height = canvas.height = ~~(window.innerHeight / pixel_scale + 1);

        canvas.style.width = width * pixel_scale + 'px';
        canvas.style.height = height * pixel_scale + 'px';

        canvas.style.left = ((window.innerWidth - (width * pixel_scale)) / 2) + 'px';
        canvas.style.top = ((window.innerHeight - (height * pixel_scale)) / 2) + 'px';
    }

    @@if (this.pixel_scale === undefined || this.pixel_scale == false) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    @@if (this.afterResize) {
        afterResize();
    }
}

@@if (this.pixel_scale !== undefined && this.pixel_scale !== false) {
    canvas.style.imageRendering = 'crisp-edges';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.position = 'relative';
    document.body.style.overflow = 'hidden';
}

onResize();
window.addEventListener("resize", onResize);
