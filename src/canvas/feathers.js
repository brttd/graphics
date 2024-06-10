import * as twgl from "/js/twgl-full.module.js";

if (!Date.now) {
	Date.now = function () {
		return new Date().getTime();
	};
}

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license

(function () {
	var lastTime = 0;
	var vendors = ["ms", "moz", "webkit", "o"];
	for (
		var x = 0;
		x < vendors.length && !window.requestAnimationFrame;
		++x
	) {
		window.requestAnimationFrame =
			window[vendors[x] + "RequestAnimationFrame"];
		window.cancelAnimationFrame =
			window[vendors[x] + "CancelAnimationFrame"] ||
			window[vendors[x] + "CancelRequestAnimationFrame"];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function (callback) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function () {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
})();

//From https://stackoverflow.com/a/901144
function queryParam(name, fallback = null) {
	name = name.replace(/[\[\]]/g, "\\$&");

	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
	var results = regex.exec(window.location.href);

	if (!results || !results[2]) return fallback;

	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var width = window.innerWidth;
var height = window.innerHeight;

var gl = canvas.getContext("webgl2");

var vert = `
#version 300 es

in vec4 position;

void main() {
  gl_Position = position;
}`;

var fragVertical = `
#version 300 es

precision mediump float;

uniform vec2 resolution;

uniform sampler2D frame;

const float decrease = 1.0 / 255.0;

out vec4 FragColor;

void main() {
    vec4 current = texture(frame, gl_FragCoord.xy / resolution);

    vec4 below = texture(frame, mod((gl_FragCoord.xy - vec2(0.0, 1.0)) / resolution, 1.0));
    vec4 above = texture(frame, mod((gl_FragCoord.xy + vec2(0.0, 1.0)) / resolution, 1.0));

    if (above.r == 1.0 && current.r != 1.0 && current.g != 1.0) {
        current.r = 1.0;
        current.b = 0.0;
    } else if (current.r == 1.0 && below.r != 1.0 && below.g != 1.0) {
        current.r = 0.0;
        current.b = 0.0;
    } else {
        current.b += decrease;
    }

	FragColor = current;
}
`;

var fragHorizontal = `
#version 300 es

precision mediump float;

uniform vec2 resolution;

uniform sampler2D frame;

const float decrease = 1.0 / 255.0;

out vec4 FragColor;

void main() {
    vec4 current = texture(frame, gl_FragCoord.xy / resolution);

    vec4 left = texture(frame, mod((gl_FragCoord.xy - vec2(1.0, 0.0)) / resolution, 1.0));
    vec4 right = texture(frame, mod((gl_FragCoord.xy + vec2(1.0, 0.0)) / resolution, 1.0));

    if (left.g == 1.0 && current.r != 1.0 && current.g != 1.0) {
        current.g = 1.0;
        current.b = 0.0;
    } else if (current.g == 1.0 && right.r != 1.0 && right.g != 1.0) {
        current.g = 0.0;
        current.b = 0.0;
    } else {
        current.b += decrease;
    }

	FragColor = current;
}
`;

var fragGen = `
#version 300 es

precision mediump float;

uniform vec2 resolution;

uniform sampler2D frame;

const float fillPercentage = 0.1525;

const vec2 noiseScale = vec2(
    0.123456789,
    0.987654321
);

/*
3D noise
const vec3 h1 = vec3(127.1,311.7, 74.7);
const vec3 h2 = vec3(269.5,183.3,246.1);
const vec3 h3 = vec3(113.5,271.9,124.6);
const float h = 43758.5453123;

vec3 hash(vec3 p) {
	p = vec3( dot(p, h1),
			  dot(p, h2),
			  dot(p, h3));

	return -1.0 + 2.0 * fract(sin(p) * h);
}

float noise(in vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    // cubic interpolant
    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ),
                          dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ),
                          dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
                mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ),
                          dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ),
                          dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}
*/

// 0: cubic
// 1: quintic
#define INTERPOLANT 0

float hash( in ivec2 p ) {
    // 2D -> 1D
    int n = p.x*3 + p.y*113;

    // 1D hash by Hugo Elias
	n = (n << 13) ^ n;
    n = n * (n * n * 15731 + 789221) + 1376312589;
    return -1.0+2.0*float( n & 0x0fffffff)/float(0x0fffffff);
}

float noise( in vec2 p ) {
    ivec2 i = ivec2(floor( p ));
    vec2 f = fract( p );

    #if INTERPOLANT==1
    // quintic interpolant
    vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
    #else
    // cubic interpolant
    vec2 u = f*f*(3.0-2.0*f);
    #endif

    return mix( mix( hash( i + ivec2(0,0) ),
                     hash( i + ivec2(1,0) ), u.x),
                mix( hash( i + ivec2(0,1) ),
                     hash( i + ivec2(1,1) ), u.x), u.y);
}

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

out vec4 FragColor;

void main() {
    float n = random(gl_FragCoord.xy * noiseScale);

    if (n <= fillPercentage) {
        FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else if (n >= 1.0 - fillPercentage) {
        FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    } else {
        FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}`;

var fragCopy = `
#version 300 es

precision mediump float;

uniform vec2 resolution;

uniform sampler2D frame;

out vec4 FragColor;

void main() {
  FragColor = texture(frame, gl_FragCoord.xy / resolution);
}
`;

var programInfoV = twgl.createProgramInfo(gl, [vert, fragVertical]);
var programInfoH = twgl.createProgramInfo(gl, [vert, fragHorizontal]);

var programInfoGen = twgl.createProgramInfo(gl, [vert, fragGen]);

var programInfoCopy = twgl.createProgramInfo(gl, [vert, fragCopy]);

var bufferInfo = twgl.createBufferInfoFromArrays(gl, {
	position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
});

var fbiConfig = [
	{
		format: gl.RGBA,
		min: gl.NEAREST,
		max: gl.NEAREST,
	},
];

var fbiH = twgl.createFramebufferInfo(gl, fbiConfig);
var fbiV = twgl.createFramebufferInfo(gl, fbiConfig);

var attachH = fbiH.attachments[0];
var attachV = fbiV.attachments[0];

var res = [width, height];

var uniformH = {
	frame: attachV,
	resolution: res,
};

var uniformV = {
	frame: attachH,
	resolution: res,
};

var uniformCopy = {
	frame: attachH,
	resolution: res,
};

var time = 0;
var lastTime = 0;
var delta = 0;

function render(t) {
	time = t * 0.001;
	delta = time - lastTime;
	lastTime = time;

	requestAnimationFrame(render);

	//Compute vertical
	twgl.bindFramebufferInfo(gl, fbiV);

	gl.useProgram(programInfoV.program);
	twgl.setBuffersAndAttributes(gl, programInfoV, bufferInfo);
	twgl.setUniforms(programInfoV, uniformV);
	twgl.drawBufferInfo(gl, bufferInfo);
	twgl.bindFramebufferInfo(gl, fbiV);

	//Compute horizontal
	twgl.bindFramebufferInfo(gl, fbiH);

	gl.useProgram(programInfoH.program);
	twgl.setBuffersAndAttributes(gl, programInfoH, bufferInfo);
	twgl.setUniforms(programInfoH, uniformH);
	twgl.drawBufferInfo(gl, bufferInfo);

	//Render to screen
	twgl.bindFramebufferInfo(gl, null);

	gl.useProgram(programInfoCopy.program);
	twgl.setBuffersAndAttributes(gl, programInfoCopy, bufferInfo);
	twgl.setUniforms(programInfoCopy, uniformCopy);
	twgl.drawBufferInfo(gl, bufferInfo);
}

requestAnimationFrame(render);

function onResize() {
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;

	twgl.resizeCanvasToDisplaySize(gl.canvas);

	twgl.resizeFramebufferInfo(gl, fbiH, fbiConfig);
	twgl.resizeFramebufferInfo(gl, fbiV, fbiConfig);

	gl.viewport(0, 0, width, height);

	res[0] = width;
	res[1] = height;

	twgl.bindFramebufferInfo(gl, fbiH);

	gl.useProgram(programInfoGen.program);
	twgl.setBuffersAndAttributes(gl, programInfoGen, bufferInfo);
	twgl.setUniforms(programInfoGen, uniformH);
	twgl.drawBufferInfo(gl, bufferInfo);

	twgl.bindFramebufferInfo(gl, fbiV);

	gl.useProgram(programInfoGen.program);
	twgl.setBuffersAndAttributes(gl, programInfoGen, bufferInfo);
	twgl.setUniforms(programInfoGen, uniformV);
	twgl.drawBufferInfo(gl, bufferInfo);
}

onResize();
window.addEventListener("resize", onResize);
