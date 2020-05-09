import {
    AudioListener,
    Audio,
    AudioLoader,
    Scene,
    Vector3,
    CubeTextureLoader,
    MathUtils,
    BufferGeometry,
    Float32BufferAttribute,
    Points,
    PointsMaterial,
} from 'three';
import { Fuel, Player, Asteroid, Powerup } from 'objects';
import { BasicLights } from 'lights';
import Corneria from '../audio/corneria_ultimate.mp3';

const introDOM = document.getElementById('splash');
const STARTING_SECONDS = 15;
const STARTING_FUELS = 1;
const STARTING_COLLECTED_FUELS = 0;

//Asteroid generation parameters:
const STARTING_ASTEROIDS = 1;

class GameScene extends Scene {
    constructor(camera, world) {
        // Call parent Scene() constructor
        super();

        // Set scene info for HUD
        this.gameTimeRem = STARTING_SECONDS;
        this.numSpawnedFuels = STARTING_FUELS;
        this.numSpawnedAsteroids = STARTING_ASTEROIDS;
        this.numCollectedFuels = STARTING_COLLECTED_FUELS;

        // Init state
        this.state = {
            updateList: [],
        };

        this.camera = camera;

        this.world = world;

        // Add meshes to scene
        const player = new Player(this, this.camera.position, this.world);
        this.playerBounds = player.boundingSphere;
        this.createBackground();
        this.addStardust();

        // add audio to scene
        this.listener = new AudioListener();
        // create a global audio source
        const music = new Audio(this.listener);
        // load a sound and set it as the Audio object's buffer
        const audioLoader = new AudioLoader();
        audioLoader.load(Corneria, function (buffer) {
            music.setBuffer(buffer);
            music.setLoop(false);
            music.setVolume(0.15);
            music.pause();
        });
        this.music = music;
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { updateList } = this.state;
        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
        // deals with music playing (don't want to clash with opening music)
        if (!this.music.isPlaying && introDOM.style.display == 'none') {
            this.music.play();
        }
    }

    // Randomly spawn fuel in bounded area
    spawnFuel() {
        // Random position
        const xRandom =
            this.camera.position.x +
            (Math.floor(Math.random() * 25) - 1) * randNegative();
        const yRandom =
            this.camera.position.y +
            (Math.floor(Math.random() * 25) - 1) * randNegative();
        const zRandom =
            this.camera.position.z +
            (Math.floor(Math.random() * 25) - 1) * randNegative();
        const positionVec = new Vector3(xRandom, yRandom, zRandom);

        // Random color
        const colorOptions = ['red', 'green', 'yellow'];
        const colorChosen = colorOptions[Math.floor(Math.random() * 3)];
        const fuel = new Fuel(this, colorChosen, positionVec, this.world);

        this.add(fuel);
        this.numSpawnedFuels++;
    }

    // Randomly spawn asteroids in bounded area
    spawnAsteroid() {
        // spawn in Random position around player
        const xRandom =
            this.camera.position.x +
            (Math.floor(Math.random() * 10) - 1) * randNegative();
        const yRandom =
            this.camera.position.y +
            (Math.floor(Math.random() * 10) - 1) * randNegative();
        const zRandom =
            this.camera.position.z +
            (Math.floor(Math.random() * 10) - 1) * randNegative();
        const positionVec = new Vector3(xRandom, yRandom, zRandom);

        const asteroid = new Asteroid(this, positionVec, this.world, false);

        this.add(asteroid);
        this.numSpawnedAsteroids++;
    }

    // creates a space background scene that can be used by the renderer
    createBackground() {
        const loader = new CubeTextureLoader();
        const texture = loader.load([
            'textures/right.jpg',
            'textures/left.jpg',
            'textures/top.jpg',
            'textures/bottom.jpg',
            'textures/front.jpg',
            'textures/back.jpg',
        ]);

        this.background = texture;
    }

    handleCollectedFuel(collectedFuel) {
        this.remove(collectedFuel);

        collectedFuel.innerRing.geometry.dispose();
        collectedFuel.innerRing.material.dispose();

        collectedFuel.outerRing.geometry.dispose();
        collectedFuel.outerRing.material.dispose();

        collectedFuel.energyOrb.geometry.dispose();
        collectedFuel.energyOrb.material.dispose();
    }

    handlePowerupCollision(powerupCollision) {
        this.remove(powerupCollision);

        powerupCollision.powerup_in.geometry.dispose();
        powerupCollision.powerup_in.material.dispose();

        powerupCollision.powerup_out.geometry.dispose();
        powerupCollision.powerup_out.material.dispose();
    }

    // Reset objects in scene for new game
    resetScene() {
        // Reset objects
        this.gameTimeRem = STARTING_SECONDS;
        this.numSpawnedAsteroids = STARTING_ASTEROIDS;
        this.numSpawnedFuels = STARTING_FUELS;
        this.numCollectedFuels = STARTING_COLLECTED_FUELS;
        this.children = [];
        const essentialBody = this.world.bodies[0];

        const lights = new BasicLights();
        const fuel = new Fuel(this, 'yellow', new Vector3(0, 0, 5), this.world);
        const powerup = new Powerup(
            this,
            'orange',
            new Vector3(0, 0, -5),
            this.world
        );
        const asteroid = new Asteroid(
            this,
            new Vector3(0, 0, 15),
            this.world,
            true
        );

        // Re-add essential objects
        this.add(lights, fuel, powerup, asteroid);
        // Super hacky because disposing bodies in Cannon.js sucks. So we reset manually
        this.world.bodies = [essentialBody, fuel.body, powerup.body];
        this.createBackground();
        this.addStardust();
    }

    addStardust() {
        const vertices = [];

        for (let i = 0; i < 10000; i++) {
            let x = MathUtils.randFloatSpread(2000);
            let y = MathUtils.randFloatSpread(2000);
            let z = MathUtils.randFloatSpread(2000);

            vertices.push(x, y, z);
        }

        const geometry = new BufferGeometry();
        geometry.setAttribute(
            'position',
            new Float32BufferAttribute(vertices, 3)
        );

        const material = new PointsMaterial({
            color: 0xffffff,
            size: 1,
        });

        const points = new Points(geometry, material);

        this.add(points);
    }
}

// Helper function to help generate negative numbers
function randNegative() {
    return Math.floor(Math.random() * 2) == 1 ? 1 : -1;
}

export default GameScene;
