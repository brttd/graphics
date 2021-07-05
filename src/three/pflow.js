@@include("js/common.js");
@@include("js/noise.js");

var renderer = new THREE.WebGLRenderer({
    antialias: true,
});

var scene = new THREE.Scene();

scene.background = new THREE.Color(
    input.get("bgcolor") ? input.get("bgcolor") : "#0f0f0f"
);

var camera = new THREE.PerspectiveCamera(45, 1);

var clock = new THREE.Clock();

var count = Math.min(50000, (window.innerWidth * window.innerHeight) / 40);

var position = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
var direction = new Float32Array(count * 3);
var age = new THREE.BufferAttribute(new Float32Array(count), 1);
var speed = new Float32Array(count);

var globalSpeed = input.get('speed') ? input.get('speed') : 1;

var geometry = new THREE.BufferGeometry();
var material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,

    uniforms: {
        diffuse: {
            value: new THREE.Color(input.get("color") ? input.get("color") : "#ACACAC")
        }
    },

    vertexShader: `
    uniform float size;
    uniform float scale;
    attribute float age;

    varying float opacity;

    void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = size * (scale / - mvPosition.z );

        opacity = 1.0 - age / 8.0;
    }`,

    fragmentShader: `
    uniform vec3 diffuse;
    varying float opacity;

    void main() {
        gl_FragColor = vec4( diffuse, opacity );
    }`
});

var points = new THREE.Points(geometry, material);

var needsResize = true;

var sceneWidth = 0;
var sceneHeight = 0;
var halfSceneWidth = 0;
var halfSceneHeight = 0;

var noiseScale = 7;
var noiseSpeed = 0.1;

var euler = new THREE.Euler();
var vector = new THREE.Vector3();

var TO360RAD = 360 * THREE.MathUtils.DEG2RAD;

var d = 0;

var i = 0;
var j = 0;
var k = 0;

var et = 0;

function render() {
    requestAnimationFrame(render);

    d = clock.getDelta() * globalSpeed;

    et += d;

    if (needsResize) {
        width = window.innerWidth;
        height = window.innerHeight;

        renderer.setSize(width, height);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        /*
        tan(θ) * adj = opp;
        θ = fov / 2

            opp
        *-----*
        |    /
    adj |   /
        |  / hyp
        |θ/
        |/
        *

        view bounds = tan(<fov> / 2) * <camera distance> * 2;
        */

        sceneHeight =
            Math.tan((camera.fov * THREE.MathUtils.DEG2RAD) / 2) *
            camera.position.x *
            2;
        sceneWidth = sceneHeight * camera.aspect;

        halfSceneHeight = sceneHeight / 2;
        halfSceneWidth = sceneWidth / 2;
    }

    for (i = 0; i < count; i++) {
        j = i * 3;

        age.array[i] += d * speed[i];

        if (age.array[i] > 8) {
            age.array[i] = 0;

            position.array[j] = (Math.random() - 0.5) * 5;
            position.array[j + 1] = -halfSceneHeight - 2;
            position.array[j + 2] = Math.random() * sceneWidth - halfSceneWidth;
        }

        if (position.array[j + 2] < -sceneWidth) {
            position.array[j + 2] += sceneWidth * 2;
        } else if (position.array[j + 2] > sceneWidth) {
            position.array[j + 2] -= sceneWidth * 2;
        }

        euler.set(
            noise(
                position.array[j + 0] / noiseScale,
                position.array[j + 1] / noiseScale,
                position.array[j + 2] / noiseScale + et * noiseSpeed
            ) * TO360RAD,
            noise(
                -position.array[j + 2] / noiseScale + et * noiseSpeed,
                position.array[j + 0] / noiseScale,
                -position.array[j + 1] / noiseScale
            ) * TO360RAD,
            noise(
                -position.array[j + 1] / noiseScale,
                -position.array[j + 2] / noiseScale + et * noiseSpeed,
                position.array[j + 0] / noiseScale
            ) * TO360RAD
        );

        vector.set(0,2.5,0).applyEuler(euler);

        position.array[j] += vector.x * speed[i] * d;
        position.array[j + 1] += vector.y * speed[i] * d;
        position.array[j + 2] += vector.z * speed[i] * d;
    }

    position.needsUpdate = true;
    age.needsUpdate = true;

    renderer.render(scene, camera);
}

//particle starting setup
{
    for (i = 0; i < count; i++) {
        j = i * 3;

        position.array[j] = Math.random() * 10;
        position.array[j + 1] = -10;
        position.array[j + 2] = Math.random() * 10;

        age.array[i] = Math.random() * 8;

        speed[i] = Math.random() * 0.3 + 0.7;
    }

    position.needsUpdate = true;
    geometry.setAttribute("position", position);
    geometry.setAttribute("age", age);
}

//setup
{
    camera.position.set(20, 0, 0);

    camera.lookAt(0, 0, 0);

    scene.add(camera);
    scene.add(points);

    document.body.appendChild(renderer.domElement);

    et = new Date().getTime();
}

requestAnimationFrame(render);

renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener("resize", function () {
    needsResize = true;
});
