// model taken from https://poly.google.com/view/50q_bJkLcuq

import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { MeshLambertMaterial } from 'three';
import { Sphere, Vector3 } from 'three';
import { World, NaiveBroadphase, Vec3, Body } from 'cannon';
import { Sphere as SpherePhysics } from 'cannon';
import MODEL from './out.glb';
// import { C } from 'cannon';

class Asteroid extends Group {
    constructor(parent, positionVec, world, angularVec, velocityVec) {
        // Call parent Group() constructor
        super();

        // loading model things

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
            this.boundingSphere.radius -= 1.2;
            this.add(obj);

            const shape = new SpherePhysics(this.boundingSphere.radius);
            const body = new Body({
              mass: 1,
              position: positionVec.clone()
            });
            body.addShape(shape);
            body.angularVelocity.set(angularVec.x, angularVec.y, angularVec.z);
            body.velocity.set(velocityVec.x, velocityVec.y, velocityVec.z);
            this.body = body;
            this.body.asteroid = this;

            world.addBody(body);

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
      if (this.body !== undefined) {
        this.position.copy(this.body.position);
        this.quaternion.copy(this.body.quaternion);
      }
    }
}

export default Asteroid;
