// model taken from https://poly.google.com/view/50q_bJkLcuq

import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
/*
import MODEL from './Stone.obj';
import MAT from './Stone.mtl';
*/
import MODEL from './out.glb';

class Asteroid extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            /*
            bob: true,
            spin: this.spin.bind(this),
            twirl: 0,
            */
        };

        // Load object

        const loader = new GLTFLoader();

        this.name = 'asteroid';
        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });

        // Load object
        /*
        const loader = new OBJLoader();
        const mtlLoader = new MTLLoader();
        this.name = 'asteroid';
        //mtlLoader.setResourcePath('src/components/objects/Asteroid/');
        mtlLoader.load(MAT, (material) => {
            material.preload();
            loader.setMaterials(material).load(MODEL, (obj) => {
                this.add(obj);
            });
        });
        */

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    /*
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
    */

    update(timeStamp) {
        /*
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
        */
    }
}

export default Asteroid;
