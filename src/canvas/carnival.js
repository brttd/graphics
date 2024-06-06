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

var gl = canvas.getContext("webgl");

var vert = `
attribute vec4 position;

void main() {
  gl_Position = position;
}`;

var frag = `
precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform float delta;

uniform sampler2D frame;

const float PI = 3.1415926535897932384626433832795;
const float DEG2RAD = PI / 180.0;

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

vec2 rotate(vec2 dir, float angle) {
	angle = angle * DEG2RAD;

	float c = cos(angle);
	float s = sin(angle);

	return vec2(
		dir.x * c - dir.y * s,
		dir.x * s + dir.y * c
	);
}

vec2 direction(float angle) {
	angle = angle * DEG2RAD;

	return vec2(-1.0 * sin(angle), 1.0 * cos(angle));
}

const float noiseScale = 0.006;
const float noiseSpeed = 0.3;

const float displaceMax = 3.0;
const float displaceMin = 1.0;
const float displaceMult = displaceMax - displaceMin;

void main() {
	vec2 uv = gl_FragCoord.xy;

	vec4 current = texture2D(frame, uv / resolution);

	float angle = noise(vec3(
		uv.x * noiseScale,
		uv.y * noiseScale,
		time * noiseSpeed
	)) + 0.5;

	float distance = (noise(vec3(
		time * noiseSpeed,
		uv.y * noiseScale,
		uv.x * noiseScale
	)) + 0.5) * displaceMult + displaceMin;

	uv += direction(angle * 360.0 * 2.0) * distance;

	uv /= resolution;

	uv.x = mod(uv.x, 1.0);
	uv.y = mod(uv.y, 1.0);

	vec4 prev = texture2D(frame, uv);

	float total = max(1.5, (prev.r + prev.g + prev.b) * 255.0);
	float amount = max(0.1, min(2.0, total / 200.0));

	float r = (noise(gl_FragCoord.xyz * PI + time) + 0.5) * 3.0 - amount;
	float g = (noise(gl_FragCoord.yzx * PI + time) + 0.5) * 3.0 - amount;
	float b = (noise(gl_FragCoord.zxy * PI + time) + 0.5) * 3.0 - amount;

	float increase = min(0.4, delta * 20.0);

	prev.r += ((max(1.0, current.r * 255.0) / total) * r * increase) / 255.0;
	prev.g += ((max(1.0, current.g * 255.0) / total) * g * increase) / 255.0;
	prev.b += ((max(1.0, current.b * 255.0) / total) * b * increase) / 255.0;

	gl_FragColor = vec4(prev.rgb, 1.0);

	/*
	float val = (noise(gl_FragCoord.xyz * noiseScale + time) + 0.5);

	if (val <= 0.005) {
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	} else if (val >= 0.995) {
		gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
	} else {
		gl_FragColor = vec4(val, val, val, 1.0);
	}
	*/
}
`;

var fragCopy = `
precision mediump float;

uniform vec2 resolution;

uniform sampler2D frame;

void main() {
  gl_FragColor = texture2D(frame, gl_FragCoord.xy / resolution);
}
`;

var programInfo = twgl.createProgramInfo(gl, [vert, frag]);

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

var fbiA = twgl.createFramebufferInfo(gl, fbiConfig);
var fbiB = twgl.createFramebufferInfo(gl, fbiConfig);

var attachA = fbiA.attachments[0];
var attachB = fbiB.attachments[0];

var res = [width, height];

var uniformA = {
	time: 0,
	delta: 0,
	frame: attachB,
	resolution: res,
};

var uniformB = {
	time: 0,
	delta: 0,
	frame: attachA,
	resolution: res,
};

var uniformCopyA = {
	frame: attachA,
	resolution: res,
};

var uniformCopyB = {
	frame: attachB,
	resolution: res,
};

var time = 0;
var lastTime = 0;
var delta = 0;

function renderAlternate(t) {
	time = t * 0.001;
	delta = time - lastTime;
	lastTime = time;

	requestAnimationFrame(render);

	uniformA.time = time;
	uniformA.delta = delta;

	twgl.bindFramebufferInfo(gl, fbiA);

	gl.useProgram(programInfo.program);
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
	twgl.setUniforms(programInfo, uniformA);
	twgl.drawBufferInfo(gl, bufferInfo);

	twgl.bindFramebufferInfo(gl, null);

	gl.useProgram(programInfoCopy.program);
	twgl.setBuffersAndAttributes(gl, programInfoCopy, bufferInfo);
	twgl.setUniforms(programInfoCopy, uniformCopyA);
	twgl.drawBufferInfo(gl, bufferInfo);
}

function render(t) {
	time = t * 0.001;
	delta = time - lastTime;
	lastTime = time;

	requestAnimationFrame(renderAlternate);

	uniformB.time = time;
	uniformB.delta = delta;

	twgl.bindFramebufferInfo(gl, fbiB);

	gl.useProgram(programInfo.program);
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
	twgl.setUniforms(programInfo, uniformB);
	twgl.drawBufferInfo(gl, bufferInfo);

	twgl.bindFramebufferInfo(gl, null);

	gl.useProgram(programInfoCopy.program);
	twgl.setBuffersAndAttributes(gl, programInfoCopy, bufferInfo);
	twgl.setUniforms(programInfoCopy, uniformCopyB);
	twgl.drawBufferInfo(gl, bufferInfo);
}

requestAnimationFrame(render);

function onResize() {
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;

	twgl.resizeCanvasToDisplaySize(gl.canvas);

	twgl.resizeFramebufferInfo(gl, fbiA, fbiConfig);
	twgl.resizeFramebufferInfo(gl, fbiB, fbiConfig);

	gl.viewport(0, 0, width, height);

	res[0] = width;
	res[1] = height;
}

onResize();
window.addEventListener("resize", onResize);
