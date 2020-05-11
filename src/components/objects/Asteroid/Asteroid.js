// model taken from https://poly.google.com/view/50q_bJkLcuq

import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshLambertMaterial } from 'three';
import { Sphere, Vector3 } from 'three';
import { Body } from 'cannon';
import { Sphere as SpherePhysics } from 'cannon';
import MODEL from './out.glb';

class Asteroid extends Group {
    constructor(parent, positionVec, world, isStill) {
        // Call parent Group() constructor
        super();

        // loading model things
        const loader = new GLTFLoader();

        this.name = 'asteroid';
        this.boundingSphere = new Sphere(new Vector3(), 1);
        this.gameScene = parent;

        this.disposalOccured = false;

        loader.load(MODEL, (gltf) => {
            var obj =
                gltf.scene.children[0].children[0].children[0].children[0];

            // randomly choose a color for this asteroid
            const colorOptions = [
                0xb0a83f,
                0x9a9e5c,
                0x9775ff,
                0xb0803f,
                0xadaaa1,
                0x9f9aad,
            ];
            const colorChosen = colorOptions[Math.floor(Math.random() * 6)];

            obj.material = new MeshLambertMaterial({
                color: colorChosen,
                wireframe: false,
            });

            this.rockSurface = obj;
            this.boundingSphere = obj.geometry.boundingSphere;
            this.boundingSphere.radius -= 0.6;
            this.add(obj);

            //generate a random velocity and scale
            const angularVec = new Vector3(
                Math.random() * 10 - 5,
                Math.random() * 10 - 5,
                Math.random() * 10 - 5
            );

            var velocityVec;
            if (isStill) {
                velocityVec = new Vector3(0, 0, 0);
            } else {
                velocityVec = new Vector3(
                    Math.random() * 30 - 15,
                    Math.random() * 30 - 15,
                    Math.random() * 30 - 15
                );
            }

            const shape = new SpherePhysics(this.boundingSphere.radius);
            const body = new Body({
                mass: 1,
                position: positionVec.clone(),
                angularVelocity: angularVec,
                velocity: velocityVec,
            });
            body.addShape(shape);

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

        if (
            this.position.x < this.gameScene.GAME_BOUNDS * -1 ||
            this.position.x > this.gameScene.GAME_BOUNDS ||
            this.position.y < this.gameScene.GAME_BOUNDS * -1 ||
            this.position.y > this.gameScene.GAME_BOUNDS ||
            this.position.z < this.gameScene.GAME_BOUNDS * -1 ||
            this.position.z > this.gameScene.GAME_BOUNDS
        ) {
            if (!this.disposalOccured) {
                this.gameScene.numSpawnedAsteroids--;
            }
            this.gameScene.disposeAsteroid(this);
            this.disposalOccured = true;
        }
    }
}

export default Asteroid;
