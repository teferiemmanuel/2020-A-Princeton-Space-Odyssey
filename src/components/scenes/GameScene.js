import * as Dat from 'dat.gui';
import { Scene, Color, Vector3, CubeTextureLoader, LinearFilter } from 'three';
import { Flower, Land, Fuel, Player } from 'objects';
import { BasicLights } from 'lights';
import { AudioListener, Audio, AudioLoader } from 'three';
import Corneria from '../audio/corneria_ultimate.mp3';
import {
    MeshToonMaterial,
    DoubleSide,
    TetrahedronBufferGeometry,
    Mesh,
} from 'three';

const introDOM = document.getElementById('splash');

class GameScene extends Scene {
    constructor(camera) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            rotationSpeed: 0,
            updateList: [],
        };

        // set up background
        // const loader = new CubeTextureLoader();
        // const texture = loader.load([
        //   'textures/starry-sky.jpg',
        //   'textures/starry-sky.jpg',
        //   'textures/starry-sky.jpg',
        //   'textures/starry-sky.jpg',
        //   'textures/starry-sky.jpg',
        //   'textures/starry-sky.jpg',
        //  ]);
        //  texture.minFilter = LinearFilter;
        //  this.background = texture;


        // Set background to a nice color
        //this.background = new Color(0x000000);

        this.camera = camera;

        // Add meshes to scene
        const land = new Land();
        const flower = new Flower(this);
        const lights = new BasicLights();

        var positionVec = new Vector3(0, 0, 5);
        const fuel = new Fuel(this, 'yellow', positionVec);
        const player = new Player(this, this.camera.position);

        this.playerBounds = player.boundingSphere;


        // add audio to scene
        // create an AudioListener and add it to the camera?
        // what does this do???
        const listener = new AudioListener();
        //camera.add( listener );

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
        this.numSpawnedFuels = 1;

        /*
        // add cockpit to scene
        // cockpit - hacky way but it works??
        // instantiate tetrahedron object
        let tetra = {};

        //let texture = new TextureLoader().load( "textures/ring.png" );

        // use toon shading
        tetra.material = new MeshToonMaterial({
            color: 0x98d1ee,
            side: DoubleSide,
            transparent: false,
            opacity: 0.2,
        });

        // use tetrahedron geometry
        tetra.geometry = new TetrahedronBufferGeometry(10);
        //tetra.geometry = new PlaneBufferGeometry(5, 5);

        // create tetrahedron mesh
        tetra.mesh = new Mesh(tetra.material, tetra.geometry);
        tetra.mesh.receiveShadow = true;

        this.tetra = tetra.mesh;
        */

        this.add(lights, fuel, player);

        // Populate GUI
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

    spawnFuel() {
        // Random position
        var xRandom = Math.floor(Math.random() * 21) - 10;
        var yRandom = Math.floor(Math.random() * 21) - 10;
        var zRandom = Math.floor(Math.random() * 21) - 10;
        var positionVec = new Vector3(xRandom, yRandom, zRandom);

        // Random color
        var colorOptions = ['red', 'green', 'yellow'];
        var colorChosen = colorOptions[Math.floor(Math.random() * 3)];

        const fuel = new Fuel(this, colorChosen, positionVec);

        this.add(fuel);
        this.numSpawnedFuels++;
    }

    hasFuelCollision(){
      let fuelObjs = this.getAllFuelObjects();
      for (var i = 0; i < fuelObjs.length; i++) {
        if(fuelObjs[i].boundingSphere.intersectsSphere(this.playerBounds)) {
          this.fuelCollision = fuelObjs[i];
          return true;
        }
      }
      this.fuelCollision = null;
      return false;
    }

    getAllFuelObjects(){
      let fuelObjs = [];
      for (var i = 0; i < this.children.length; i++) {
        if(this.children[i] instanceof Fuel) {
          fuelObjs.push(this.children[i]);
        }
      }
      return fuelObjs;
    }
}

export default GameScene;
