function onResize() {
    @@if (this.pixelScale !== undefined && this.pixelScale !== false) {
        width = canvas.width = ~~(window.innerWidth / pixel_scale + 1);
        height = canvas.height = ~~(window.innerHeight / pixel_scale + 1);

        canvas.style.width = width * pixel_scale + 'px';
        canvas.style.height = height * pixel_scale + 'px';
    }

    @@if (this.pixelScale === undefined || this.pixelScale == false) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    @@if (this.afterResize) {
        afterResize();
    }
}

@@if (this.pixelScale !== undefined && this.pixelScale !== false) {
    canvas.style.imageRendering = 'crisp-edges';
    canvas.style.imageRendering = 'pixelated';
    document.body.style.overflow = 'hidden';
}

onResize();
window.addEventListener("resize", onResize);
