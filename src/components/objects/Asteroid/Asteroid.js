// model taken from https://poly.google.com/view/50q_bJkLcuq

import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { MeshLambertMaterial } from 'three';
import MODEL from './out.glb';

class Asteroid extends Group {
    constructor(parent, positionVec) {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'asteroid';
        loader.load(MODEL, (gltf) => {
            var obj = gltf.scene.children[0].children[0].children[0].children[0];

            obj.material = new MeshLambertMaterial({
              color: 0x906F24,
              wireframe: false,
            });

            // obj.positon.x = positionVec.x;
            // obj.positon.y = positionVec.y;
            // obj.positon.z = positionVec.z;
            //

            this.rockSurface = obj;
            this.add(obj);

            var outline = obj.clone();
            outline.material = new MeshLambertMaterial({
              color: 0x000000,
              wireframe: true,
            });

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

    }
}

export default Asteroid;
