import { Group } from 'three';
import { TextureLoader, MeshToonMaterial, DoubleSide, RingGeometry, CylinderGeometry, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
//import MODEL from './flower.gltf';

class Fuel extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            bob: true,
            spin: this.spin.bind(this),
            twirl: 0,
        };

        /*
        // Load object
        const loader = new GLTFLoader();

        this.name = 'flower';
        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
        */

        // instantiate ring object
        let ring = {};

        //let texture = new TextureLoader().load( "textures/ring.png" );

        // use toon shading
        ring.material = new MeshToonMaterial({
            color: 0x8f8a2a, //0xaaa424,
            side: DoubleSide,
            transparent: false,
            opacity: 1.0,
        });

        // use ring geometry
        ring.geometry = new RingGeometry(0.5, 1);

        // create ring mesh
        ring.mesh = new Mesh(ring.geometry, ring.material);
        ring.mesh.position.x = 0;
        ring.mesh.position.y = 0;
        ring.mesh.position.z = 5;

        ring.mesh.receiveShadow = true;

        this.add(ring.mesh);

        // instantiate cylinder object
        let cylinder = {};

        //let texture = new TextureLoader().load( "textures/cylinder.png" );

        // use toon shading
        cylinder.material = new MeshToonMaterial({
            color: 0xb4b4c9, //0xa9a9a9,
            side: DoubleSide,
            transparent: false,
            opacity: 1.0,
        });

        // use ring geometry
        cylinder.geometry = new CylinderGeometry(1, 1, 2); // top, bottom, h

        // create ring mesh
        cylinder.mesh = new Mesh(cylinder.geometry, cylinder.material);
        cylinder.mesh.position.x = 5;
        cylinder.mesh.position.y = 0;
        cylinder.mesh.position.z = 0;

        cylinder.mesh.receiveShadow = true;

        this.add(cylinder.mesh);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    spin() {
        // Add a simple twirl
        this.state.twirl += 6 * Math.PI;

        // Use timing library for more precice "bounce" animation
        // TweenJS guide: http://learningthreejs.com/blog/2011/08/17/tweenjs-for-smooth-animation/
        // Possible easings: http://sole.github.io/tween.js/examples/03_graphs.html
        const jumpUp = new TWEEN.Tween(this.position)
            .to({ y: this.position.y + 1 }, 300)
            .easing(TWEEN.Easing.Quadratic.Out);
        const fallDown = new TWEEN.Tween(this.position)
            .to({ y: 0 }, 300)
            .easing(TWEEN.Easing.Quadratic.In);

        // Fall down after jumping up
        jumpUp.onComplete(() => fallDown.start());

        // Start animation
        jumpUp.start();
    }

    update(timeStamp) {
        if (this.state.bob) {
            // Bob back and forth
            this.rotation.z = 0.05 * Math.sin(timeStamp / 300);
        }
        if (this.state.twirl > 0) {
            // Lazy implementation of twirl
            this.state.twirl -= Math.PI / 8;
            this.rotation.y += Math.PI / 8;
        }

        // Advance tween animations, if any exist
        TWEEN.update();
    }
}

export default Fuel;
