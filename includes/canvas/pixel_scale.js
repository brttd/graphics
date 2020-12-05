@@if (this.pixel_scale == undefined) {
    var pixel_scale = 4;
}
@@if (this.pixel_scale !== undefined) {
    var pixel_scale = @@pixel_scale;
}

if (window.location.search.startsWith('?scale=')) {
    pixel_scale = parseInt(window.location.search.split('&').pop().slice(7));
}