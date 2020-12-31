#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

@@include("glsl/common.glsl")

@@include("glsl/noise/simplex-3d.glsl")

// note: valve edition
//       from http://alex.vlachos.com/graphics/Alex_Vlachos_Advanced_VR_Rendering_GDC2015.pdf
// note: input in pixels (ie not normalized uv)
vec3 ScreenSpaceDither( vec2 vScreenPos )
{
	// Iestyn's RGB dither (7 asm instructions) from Portal 2 X360, slightly modified for VR
	//vec3 vDither = vec3( dot( vec2( 171.0, 231.0 ), vScreenPos.xy + iTime ) );
    vec3 vDither = vec3( dot( vec2( 171.0, 231.0 ), vScreenPos.xy ) );
    vDither.rgb = fract( vDither.rgb / vec3( 103.0, 71.0, 97.0 ) );
    
    //note: apply triangular pdf
    //vDither.r = remap_noise_tri_erp(vDither.r)*2.0-0.5;
    //vDither.g = remap_noise_tri_erp(vDither.g)*2.0-0.5;
    //vDither.b = remap_noise_tri_erp(vDither.b)*2.0-0.5;
    
    return vDither.rgb / 255.0; //note: looks better without 0.375...

    //note: not sure why the 0.5-offset is there...
    //vDither.rgb = fract( vDither.rgb / vec3( 103.0, 71.0, 97.0 ) ) - vec3( 0.5, 0.5, 0.5 );
	//return (vDither.rgb / 255.0) * 0.375;
}

void main() {
    float t = u_time * 1.0 + 130.0;

    vec2 pos = gl_FragCoord.xy / min(u_resolution.x * 3.5, u_resolution.y * 3.5);

    vec3 dither = ScreenSpaceDither(gl_FragCoord.xy);

    pos.x += dither.x * 15.0;
    pos.y += dither.y * 15.0;


    float h = snoise( vec3(pos, t / 62.0) );
    h = (h / 6.0) + (t / 140.0);

    float s = snoise( vec3((pos + vec2(5.0, 2.0)) / 7.0, t / 83.0));
    s = s * 0.3 + 0.7;

    float v = snoise( vec3((pos - vec2(8.0, 9.0)) / 5.0, t / 55.0));
    v = v * 0.2 + 0.4;

    vec3 c = hsv2rgb(vec3(mod(h, 1.0), s, v));

    gl_FragColor = vec4(c, 1.0);
}
