import {
    Audio,
    AudioLoader,
    Vector3,
    Group,
    Sphere,
    Frustum,
    Matrix4,
} from 'three';
import { Body } from 'cannon';
import { Sphere as SpherePhysics } from 'cannon';
import AsteroidCollision from '../../audio/asteroid_collision.mp3';
import FuelPickup from '../../audio/fuel_pickup.mp3';
import PowerupPickup from '../../audio/powerup_pickup.mp3';

const muteSoundEffectsButton = document.getElementById('muteSound');

class Player extends Group {
    constructor(parent, positionVec, world) {
        // Call parent Group() constructor
        super();
        let vulnToAsteroid = true;
        let boundingSphere = createBoundingSphere();

        boundingSphere.center.x = positionVec.x;
        boundingSphere.center.y = positionVec.y;
        boundingSphere.center.z = positionVec.z;

        this.boundingSphere = boundingSphere;
        this.gameScene = parent;
        this.positionVec = positionVec;

        const shape = new SpherePhysics(this.boundingSphere.radius);
        const body = new Body({
            mass: 1,
            position: positionVec.clone(),
        });
        body.addShape(shape);
        world.addBody(body);

        this.body = body;
        this.body.gameScene = parent;

        this.body.addEventListener('collide', function (e) {
            if (e.body.asteroid !== undefined && vulnToAsteroid === true) {
                var frustum = new Frustum();
                const gameScene = e.body.asteroid.gameScene;
                frustum.setFromProjectionMatrix(
                    new Matrix4().multiplyMatrices(
                        gameScene.camera.projectionMatrix,
                        gameScene.camera.matrixWorldInverse
                    )
                );

                var pos = e.body.asteroid.position;
                if (frustum.containsPoint(pos)) {
                    document.getElementById('collisionMessage').innerHTML =
                        'OOF! You lost some fuel';

                    this.gameScene.gameTimeRem -= 5;

                    if (!muteSoundEffectsButton.checked) {
                        // create an audio source
                        const soundEffect = new Audio(this.gameScene.listener);
                        // load a sound and set it as the Audio object's buffer
                        const audioLoader = new AudioLoader();
                        audioLoader.load(AsteroidCollision, function (buffer) {
                            soundEffect.setBuffer(buffer);
                            soundEffect.setLoop(false);
                            soundEffect.setVolume(0.15);
                            soundEffect.play();
                        });
                    }
                }
            } else if (e.body.fuel !== undefined) {
                document.getElementById('collisionMessage').innerHTML =
                    'Fuel recharged!';
                this.gameScene.numCollectedFuels++;
                this.gameScene.numSpawnedFuels--;

                if (!muteSoundEffectsButton.checked) {
                    // create an audio source
                    const soundEffect = new Audio(this.gameScene.listener);
                    // load a sound and set it as the Audio object's buffer
                    const audioLoader = new AudioLoader();
                    audioLoader.load(FuelPickup, function (buffer) {
                        soundEffect.setBuffer(buffer);
                        soundEffect.setLoop(false);
                        soundEffect.setVolume(0.15);
                        soundEffect.play();
                    });
                }

                // Handle time elapsed
                if (
                    this.gameScene.gameTimeRem + 3 >
                    this.gameScene.MAX_FUEL_SECONDS
                )
                    this.gameScene.gameTimeRem = this.gameScene.MAX_FUEL_SECONDS;
                else this.gameScene.gameTimeRem += 3;

                this.gameScene.handleCollectedFuel(e.body.fuel);
            } else if (e.body.powerup !== undefined) {
                document.getElementById('collisionMessage').innerHTML =
                    'Temporary Invincibility for 5s!';

                // Temporary invincibility for 5s
                vulnToAsteroid = false;
                setTimeout(() => {
                    vulnToAsteroid = true;
                }, 5000);

                if (!muteSoundEffectsButton.checked) {
                    // create an audio source
                    const soundEffect = new Audio(this.gameScene.listener);
                    // load a sound and set it as the Audio object's buffer
                    const audioLoader = new AudioLoader();
                    audioLoader.load(PowerupPickup, function (buffer) {
                        soundEffect.setBuffer(buffer);
                        soundEffect.setLoop(false);
                        soundEffect.setVolume(0.15);
                        soundEffect.play();
                    });
                }

                this.gameScene.handlePowerupCollision(e.body.powerup);
            }
        });

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        this.boundingSphere.center.x = this.positionVec.x;
        this.boundingSphere.center.y = this.positionVec.y;
        this.boundingSphere.center.z = this.positionVec.z;

        this.body.position.copy(this.positionVec.clone());
    }
}

function createBoundingSphere() {
    let boundingSphere = {};

    boundingSphere = new Sphere(new Vector3(), 0.6);
    return boundingSphere;
}

export default Player;
