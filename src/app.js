/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
//import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { FirstPersonControls } from './FirstPersonControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GameScene } from 'scenes';
import './style.css';

// Initialize core ThreeJS components
const gameScene = new GameScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
camera.position.set(6, 3, -10);
camera.lookAt(new Vector3(0, 0, 0));

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
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
const controls = new FirstPersonControls(camera, canvas);
controls.autoForward = false;
controls.movementSpeed = 0.01;
/*
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
*/

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    //controls.update();
    controls.update(timeStamp / 1000);
    renderer.render(gameScene, camera);
    gameScene.update && gameScene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);

/*
window.addEventListener('keydown', moveCamera, false);
function moveCamera(event) {
    // Ignore keypresses typed into a text box
    if (event.target.tagName === 'INPUT') {
        return;
    }

    // The vectors tom which each key code in this handler maps.
    const keyMap = {
        ArrowUp: new Vector3(0, 1, 0),
        ArrowDown: new Vector3(0, -1, 0),
        ArrowLeft: new Vector3(-1, 0, 0),
        ArrowRight: new Vector3(1, 0, 0),
    };

    // ----------- Our reference solution uses 8 lines of code.
    let key = event.key;
    if (key == 'ArrowUp') {
        camera.position.multiplyScalar(0.95);
    } else if (key == 'ArrowDown') {
        camera.position.multiplyScalar(1.05);
    }
}
*/
