import {
    AudioListener,
    Audio,
    AudioLoader,
    Scene,
    Vector3,
    RepeatWrapping,
    TextureLoader,
    BackSide,
    SphereBufferGeometry,
    MeshBasicMaterial,
    Mesh,
} from 'three';
import { Fuel, Player, Asteroid } from 'objects';
import { BasicLights } from 'lights';
import Corneria from '../audio/corneria_ultimate.mp3';

const introDOM = document.getElementById('splash');
const STARTING_SECONDS = 45;
const STARTING_FUELS = 1;
const STARTING_COLLECTED_FUELS = 0;

class GameScene extends Scene {
    constructor(camera) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            rotationSpeed: 0,
            updateList: [],
        };

        this.camera = camera;

        // Add meshes to scene
        const lights = new BasicLights();
        const asteroid = new Asteroid(this);
        const fuel = new Fuel(this, 'yellow', new Vector3(0, 0, 5));
        const player = new Player(this, this.camera.position);
        this.playerBounds = player.boundingSphere;
        this.createBackground();

        // add audio to scene
        const listener = new AudioListener();
        // create a global audio source
        const music = new Audio(listener);
        // load a sound and set it as the Audio object's buffer
        const audioLoader = new AudioLoader();
        audioLoader.load(Corneria, function (buffer) {
            music.setBuffer(buffer);
            music.setLoop(false);
            music.setVolume(0.3);
            music.pause();
        });

        this.music = music;
        // Set scene info for HUD
        this.gameTimeRem = STARTING_SECONDS;
        this.numSpawnedFuels = STARTING_FUELS;
        this.numCollectedFuels = STARTING_COLLECTED_FUELS;

        // asteroid
        asteroid.position.x = 0;
        asteroid.position.y = 0;
        asteroid.position.z = 0;

        this.add(lights, fuel, player, asteroid);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

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
        const xRandom = Math.floor(Math.random() * 21) - 10;
        const yRandom = Math.floor(Math.random() * 21) - 10;
        const zRandom = Math.floor(Math.random() * 21) - 10;
        const positionVec = new Vector3(xRandom, yRandom, zRandom);

        // Random color
        const colorOptions = ['red', 'green', 'yellow'];
        const colorChosen = colorOptions[Math.floor(Math.random() * 3)];

        const fuel = new Fuel(this, colorChosen, positionVec);

        this.add(fuel);
        this.numSpawnedFuels++;
    }

    hasFuelCollision() {
        let fuelObjs = this.getAllFuelObjects();
        for (var i = 0; i < fuelObjs.length; i++) {
            if (
                fuelObjs[i].boundingSphere.intersectsSphere(this.playerBounds)
            ) {
                this.fuelCollision = fuelObjs[i];
                return true;
            }
        }
        this.fuelCollision = null;
        return false;
    }

    getAllFuelObjects() {
        let fuelObjs = [];
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof Fuel) {
                fuelObjs.push(this.children[i]);
            }
        }
        return fuelObjs;
    }

    // creates a space background scene that can be used by the renderer
    createBackground() {
        const loader = new TextureLoader();
        const texture = loader.load('textures/spaceGameBackground.png');

        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(15, 15);

        const material = new MeshBasicMaterial({
            map: texture,
            side: BackSide,
        });

        const plane = new SphereBufferGeometry(500, 7, 7);
        let bgMesh = new Mesh(plane, material);

        bgMesh.position.x = this.camera.position.x;
        bgMesh.position.y = this.camera.position.y;
        bgMesh.position.z = this.camera.position.z;
        bgMesh.layers.set(1);

        this.bgMesh = bgMesh;

        this.add(bgMesh);
    }

    handleCollectedFuel(collectedFuel) {
        console.log(collectedFuel);
        // for now, let's dispose of them
        this.remove(collectedFuel);

        collectedFuel.innerRing.geometry.dispose();
        collectedFuel.innerRing.material.dispose();

        collectedFuel.outerRing.geometry.dispose();
        collectedFuel.outerRing.material.dispose();

        collectedFuel.energyOrb.geometry.dispose();
        collectedFuel.energyOrb.material.dispose();

        this.fuelCollision == null;
    }

    // Reset objects in scene for new game
    resetScene() {
        // Reset objects
        this.gameTimeRem = STARTING_SECONDS;
        this.numSpawnedFuels = STARTING_FUELS;
        this.numCollectedFuels = STARTING_COLLECTED_FUELS;
        this.children = [];

        // Re-add essential objects
        this.add(new BasicLights());
        this.createBackground();
    }
}

export default GameScene;
