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

const float PI  = 3.14159265358;
const float TAU = 6.28318530717;

vec3 hash( vec3 p ) // replace this by something better
{
	p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
			  dot(p,vec3(269.5,183.3,246.1)),
			  dot(p,vec3(113.5,271.9,124.6)));

	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec3 p )
{
    vec3 i = floor( p );
    vec3 f = fract( p );

    // cubic interpolant
    vec3 u = f*f*(3.0-2.0*f);

    return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ),
                          dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ),
                          dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
                mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ),
                          dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ),
                          dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}

const int numOctaves = 2;

float fbm( in vec3 x, in float H )
{
    float G = exp2(-H);
    float f = 1.0;
    float a = 1.0;
    float t = 0.0;
    for( int i=0; i<numOctaves; i++ )
    {
        t += a*noise(f*x);
        f *= 2.0;
        a *= G;
    }
    return t;
}

// lch = (lightness, chromaticity, hue)
vec3 oklch2oklab(vec3 lch) {
  return vec3(lch.x, lch.y * cos(lch.z * TAU), lch.y * sin(lch.z * TAU));
}

// oklab = (lightness, red_greenness, blue_yelowness)
vec3 oklab2lrgb(vec3 oklab) {
    vec3 lms = oklab * mat3(1,  0.3963377774,  0.2158037573,
                            1, -0.1055613458, -0.0638541728,
                            1, -0.0894841775, -1.2914855480);
    lms *= lms * lms;
    return lms * mat3( 4.0767416621, -3.3077115913,  0.2309699292,
                      -1.2684380046,  2.6097574011, -0.3413193965,
                      -0.0041960863, -0.7034186147,  1.7076147010);
}

vec3 lrgb2rgb(vec3 x) {
    vec3 xlo = 12.92 * x;
    vec3 xhi = 1.055 * pow(x, vec3(1.0 / 2.4)) - 0.055;
    return mix(xlo, xhi, step(vec3(0.0031308), x));
}

void main() {
    vec2 st = gl_FragCoord.xy/resolution.xy;
    st.x *= resolution.x/resolution.y;

    float scale_light = 0.01;
    float scale_chroma = 0.03;
    float scale_hue = 0.7;

    vec3 pos_light = vec3(gl_FragCoord.x * scale_light, gl_FragCoord.y * scale_light, time * 0.2);
    vec3 pos_chroma = vec3(time * 0.2, gl_FragCoord.x * scale_chroma, gl_FragCoord.y * scale_chroma);
    vec3 pos_hue = vec3(st.y * scale_hue, time * 0.2, st.x * scale_hue);



    //float light = fbm(pos_light, 1.0) * 0.5 + 0.5;
    //float chroma = fbm(pos_chroma, 1.0) * 0.5 + 0.5;
    float hue = fbm(pos_hue, 1.0) * 0.5 + 0.5;

	float light = 0.5;
	float chroma = 0.5;


    vec3 col = lrgb2rgb(oklab2lrgb(oklch2oklab(vec3(0.81 + light * 0.05, 0.08 + chroma * 0.005, hue))));

    //col = vec3(light);

    gl_FragColor = vec4(col,1.0);
}
`;

var programInfo = twgl.createProgramInfo(gl, [vert, frag]);

var bufferInfo = twgl.createBufferInfoFromArrays(gl, {
	position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
});

function render(time) {
	requestAnimationFrame(render);

	gl.useProgram(programInfo.program);
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
	twgl.setUniforms(programInfo, {
		time: time * 0.001,
		resolution: [width, height],
	});
	twgl.drawBufferInfo(gl, bufferInfo);
}

requestAnimationFrame(render);

function onResize() {
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;

	twgl.resizeCanvasToDisplaySize(gl.canvas);

	gl.viewport(0, 0, width, height);
}

onResize();
window.addEventListener("resize", onResize);
