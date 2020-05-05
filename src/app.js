/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import {
    WebGLRenderer,
    PerspectiveCamera,
    Vector3,
    Vector2,
    Layers,
    ShaderMaterial,
    MeshBasicMaterial
} from 'three';
import { Controls } from './Controls.js';
//import { FirstPersonControls } from './FirstPersonControls.js';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GameScene } from 'scenes';
import { BasicLights } from 'lights';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
//import { MeshToonMaterial, DoubleSide, TetrahedronBufferGeometry, PlaneBufferGeometry, Mesh } from 'three';

// Initialize core ThreeJS components
const camera = new PerspectiveCamera();
// Set up camera
camera.position.set(6, 3, -10);
camera.lookAt(new Vector3(0, 0, 0));
camera.layers.enable(1);

const gameScene = new GameScene(camera);

const renderer = new WebGLRenderer({ antialias: true });

/*
camera.add(gameScene.tetra);
gameScene.tetra.position.set(0, 0, 0);
*/

// Set up renderer and canvas
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.appendChild(canvas);

// Set up controls
/*
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
controls.update();
*/
//const controls = new FirstPersonControls(camera, canvas);
const controls = new Controls(camera, canvas);
controls.autoForward = false;
controls.movementSpeed = 0.02;

// Bloom Pass Rendering
const renderScene = new RenderPass(gameScene, camera);
var bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 1.25;
bloomPass.radius = 0.37;
bloomPass.exposure = 1;
bloomPass.renderToScreen = true;


const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    //controls.update();
    controls.update(20); // empirically determined...what do you guys think?

    renderer.autoClear = false;

    renderer.clear();

    camera.layers.set(1);
    composer.render();

    renderer.clearDepth();
    camera.layers.set(0);
    renderer.render(gameScene, camera);


    gameScene.update && gameScene.update(timeStamp);
    if (gameScene.hasFuelCollision()) {
      gameScene.numCollectedFuels++;
      gameScene.handleCollectedFuel(gameScene.fuelCollision);
    }

    window.requestAnimationFrame(onAnimationFrameHandler);

    // Update HUD values
    updateHUD();
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);

    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);

// Update HUD values
function updateHUD() {
    document.getElementById('fuelCollectedVal').innerHTML =
        gameScene.numCollectedFuels;
    document.getElementById('timeRemainingVal').innerHTML =
        gameScene.gameTimeRem + ' seconds remaining';
    document.getElementById('timeRemainingProg').value =
        (gameScene.gameTimeRem / gameScene.STARTING_SECONDS) * 100;
}

// Check if splash screen is up; If not, spawn fuel
function checkSplashAndSpawn() {
    // Check if splash screen is still displayed
    const splash = document.getElementById('splash');
    // Check if there are fewer than 10 fuel elements spawned
    if (splash.style.display === 'none' && gameScene.numSpawnedFuels < 10) {
        gameScene.spawnFuel();
    }
}

// Update time remaining
window.setInterval(function () {
    const splash = document.getElementById('splash');
    const hud = document.getElementById('hud');

    if (gameScene.gameTimeRem <= 0) {
        document.getElementById('timeRemainingVal').innerHTML = 'Finished';
        splash.style.display = 'block';
        hud.style.display = 'none';

        // Reset the important parts of scene; Could be a better way to just clear scene?
        gameScene.gameTimeRem = gameScene.STARTING_SECONDS;
        gameScene.numSpawnedFuels = gameScene.STARTING_FUELS;
        gameScene.numCollectedFuels = gameScene.STARTING_COLLECTED_FUELS;
        gameScene.children = [];
    }
    // Only decrement time if splash is gone
    if (splash.style.display === 'none') {
        gameScene.gameTimeRem -= 1;
    }
}, 1000);

// Wrapper to spawn fuel every 3s
window.setInterval(function () {
    checkSplashAndSpawn();
}, 3000);

function darkenNonBloomed( obj ) {
	if ( obj.isMesh && bloomLayer.test(obj.layers) === false ) {
		materials[ obj.uuid ] = obj.material;
		obj.material = darkMaterial;
	}
}

function restoreMaterial( obj ) {
	if ( materials[ obj.uuid ] ) {
		obj.material = materials[ obj.uuid ];
		delete materials[ obj.uuid ];
	}
}
