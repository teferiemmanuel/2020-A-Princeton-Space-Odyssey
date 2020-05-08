// model taken from https://poly.google.com/view/50q_bJkLcuq

import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { MeshLambertMaterial } from 'three';
import { Sphere, Vector3 } from 'three';
import MODEL from './out.glb';
// import { C } from 'cannon';

class Asteroid extends Group {
    constructor(parent, positionVec) {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'asteroid';
        this.boundingSphere = new Sphere(new Vector3(), 1);
        loader.load(MODEL, (gltf) => {
            var obj =
                gltf.scene.children[0].children[0].children[0].children[0];

            obj.material = new MeshLambertMaterial({
                color: 0xb0803f,
                wireframe: false,
            });

            this.rockSurface = obj;
            this.boundingSphere = obj.geometry.boundingSphere;
            this.add(obj);

            var outline = obj.clone();
            outline.material = new MeshLambertMaterial({
                color: 0x234a66,
                wireframe: true,
            });
            outline.layers.enable(1);

            this.rockOutline = outline;
            this.add(outline);
        });
        this.position.x = positionVec.x;
        this.position.y = positionVec.y;
        this.position.z = positionVec.z;

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        this.rotation.x += 0.0069;
        this.rotation.y -= 0.0069;
        this.rotation.z += 0.001337;
    }
}

export default Asteroid;
