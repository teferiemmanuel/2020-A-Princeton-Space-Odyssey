// Controls.js
// modified from FlyControls.js,
// PointerLockControls.js, and
// FirstPersonControls.js
// Original authors listed below

/**
 * Original authors
 * @author James Baicoianu / http://www.baicoianu.com/ - FlyControls.js
 * @author mrdoob / http://mrdoob.com/ - FirstPersonControls.js and PointerLockControls.js
 * @author Mugen87 / https://github.com/Mugen87 - PointerLockControls.js
 * @author alteredq / http://alteredqualia.com/ - FirstPersonControls.js
 * @author paulirish / http://paulirish.com/ - FirstPersonControls.js
 */

import { Euler, EventDispatcher, Quaternion, Vector3 } from 'three';

import { AudioListener, Audio, AudioLoader } from 'three';

import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

// DO A BARREL ROLL
import Barrel_roll from './components/audio/barrel_roll.mp3';

const splash = document.getElementById('splash');
const hud = document.getElementById('hud');

var Controls = function (object, domElement) {
    if (domElement === undefined) {
        console.warn(
            'Controls: The second parameter "domElement" is now mandatory.'
        );
        domElement = document; // document.body?
    }

    this.object = object;
    this.domElement = domElement;

    if (domElement) this.domElement.setAttribute('tabindex', -1);

    // DO A BARREL ROLL!
    const br_listener = new AudioListener();
    // create a global audio source
    const br_audio = new Audio(br_listener);
    // load a sound and set it as the Audio object's buffer
    const br_loader = new AudioLoader();
    // attach to object
    this.br_audio = br_audio;

    // API
    this.movementSpeed = 1.0;
    this.rollSpeed = 0.005;

    this.speed_multiplier = 1.0;
    this.accelerate = false;
    this.brake = false;

    this.autoForward = false;
    //this.barrel_left = 0;
    //this.barrel_right = 0;
    // disable default target object behavior

    // internals
    this.tmpQuaternion = new Quaternion();

    this.moveState = {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        forward: 0,
        back: 0,
        pitchUp: 0,
        pitchDown: 0,
        yawLeft: 0,
        yawRight: 0,
        rollLeft: 0,
        rollRight: 0,
    };
    this.game_edge_return = {
        left_x: 0,
        right_x: 0,
        left_y: 0,
        right_y: 0,
        left_z: 0,
        right_z: 0,
    };

    this.moveVector = new Vector3(0, 0, 0);
    this.rotationVector = new Vector3(0, 0, 0);

    var scope = this;
    var changeEvent = { type: 'change' };
    var start_position = object.position.clone();

    var euler = new Euler(0, 0, 0, 'YXZ');

    var PI_2 = Math.PI / 2;

    var vec = new Vector3();

    this.onMouseMove = function (event) {
        if (scope.isLocked === false) return;

        var movementX =
            event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY =
            event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        euler.setFromQuaternion(this.object.quaternion);

        euler.y -= movementX * 0.002;
        euler.x -= movementY * 0.002;

        euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));

        this.object.quaternion.setFromEuler(euler);

        this.object.rotation.setFromQuaternion(
            this.object.quaternion,
            this.object.rotation.order
        );

        scope.dispatchEvent(changeEvent);
    };

    this.lock = function () {
        this.domElement.requestPointerLock();
    };

    this.unlock = function () {
        document.exitPointerLock();
    };

    this.getObject = function () {
        // retaining this method for backward compatibility

        return this.object;
    };

    this.getDirection = (function () {
        var direction = new Vector3(0, 0, -1);

        return function (v) {
            return v.copy(direction).applyQuaternion(this.object.quaternion);
        };
    })();

    this.moveForward = function (distance) {
        // move forward parallel to the xz-plane
        // assumes camera.up is y-up

        vec.setFromMatrixColumn(this.object.matrix, 0);

        vec.crossVectors(this.object.up, vec);

        this.object.position.addScaledVector(vec, distance);
    };

    // bounds check the camera in x, y, z direction, rotate camera 180 and move position inward 12 units
    var radius = 20;
    this.inXBounds = function () {
        if (this.object.position.x > start_position.x + radius) {
            alert('WARNING, TURN AROUND TO AVOID DEEP SPACE');
            this.moveVector.x = 0;
            this.moveVector.y = 0;
            this.moveVector.z = 0;
            this.game_edge_return.right_x += 32 * Math.PI;
            this.object.position.x -= 12;
        } else if (this.object.position.x < start_position.x - radius) {
            alert('WARNING, TURN AROUND TO AVOID DEEP SPACE');
            this.moveVector.x = 0;
            this.moveVector.y = 0;
            this.moveVector.z = 0;

            this.game_edge_return.left_x += 32 * Math.PI;
            this.object.position.x += 12;
        }
    };

    this.inYBounds = function () {
        if (this.object.position.y > start_position.y + radius) {
            alert('WARNING, TURN AROUND TO AVOID DEEP SPACE');
            this.moveVector.x = 0;
            this.moveVector.y = 0;
            this.moveVector.z = 0;
            this.game_edge_return.right_y += 32 * Math.PI;
            this.object.position.y -= 12;
        } else if (this.object.position.y < start_position.y - radius) {
            alert('WARNING, TURN AROUND TO AVOID DEEP SPACE');
            this.moveVector.x = 0;
            this.moveVector.y = 0;
            this.moveVector.z = 0;

            this.game_edge_return.left_y += 32 * Math.PI;
            this.object.position.y += 12;
        }
    };

    this.inZBounds = function () {
        if (this.object.position.z > start_position.z + radius) {
            alert('WARNING, TURN AROUND TO AVOID DEEP SPACE');

            this.moveVector.x = 0;
            this.moveVector.y = 0;
            this.moveVector.z = 0;
            this.game_edge_return.right_z += 32 * Math.PI;
            // move position vector after turning
            this.object.position.z -= 12;
        } else if (this.object.position.z < start_position.z - radius) {
            alert('WARNING, TURN AROUND TO AVOID DEEP SPACE');

            this.moveVector.x = 0;
            this.moveVector.y = 0;
            this.moveVector.z = 0;

            this.game_edge_return.left_z += 32 * Math.PI;
            this.object.position.z += 12;
        }
    };

    this.moveRight = function (distance) {
        vec.setFromMatrixColumn(this.object.matrix, 0);

        this.object.position.addScaledVector(vec, distance);
    };

    //var map = {81: false, 69: false};
    this.keydown = function (event) {
        if (event.altKey) {
            return;
        }

        switch (event.keyCode) {
            case 32:
                /*Space*/
                if (this.speed_multiplier < 1.0) {
                    this.speed_multiplier = 1.0;
                }
                if (this.speed_multiplier < 5.0) {
                    this.speed_multiplier *= 1.1;
                }
                this.accelerate = true;
                break;
            case 16:
                /*Shift*/
                if (this.speed_multiplier > 0.1) {
                    this.speed_multiplier *= 0.69;
                }
                this.brake = true;
                break;

            //case 84:
            //    /*T*/ this.moveState.forward = 1;
            //    break;
            //case 71:
            //    /*G*/ this.moveState.back = 1;
            //    break;

            //case 38:
            //    /*up*/ this.moveState.pitchUp = 1;
            //    break;
            //case 40:
            //    /*down*/ this.moveState.pitchDown = 1;
            //    break;

            //case 37:
            //    /*left*/ this.moveState.yawLeft = 1;
            //    break;
            //case 39:
            //    /*right*/ this.moveState.yawRight = 1;
            //    break;

            case 81:
                /*Q*/ //this.moveState.rollLeft = 1;
                scope.isLocked = false;
                if (
                    !this.br_audio.isPlaying &&
                    splash.style.display == 'none'
                ) {
                    br_loader.load(Barrel_roll, function (buffer) {
                        br_audio.setBuffer(buffer);
                        br_audio.setLoop(false);
                        br_audio.setVolume(0.3);
                        br_audio.play();
                    });
                    const barrel_left = new TWEEN.Tween(this.object.rotation)
                    .to({ z: this.object.rotation.z + 2 * Math.PI }, 690)
                    .start();
                }
                break;
            case 69:
                /*E*/ //this.moveState.rollRight = 1;
                scope.isLocked = false;
                if (
                    !this.br_audio.isPlaying &&
                    splash.style.display == 'none'
                ) {
                    br_loader.load(Barrel_roll, function (buffer) {
                        br_audio.setBuffer(buffer);
                        br_audio.setLoop(false);
                        br_audio.setVolume(0.3);
                        br_audio.play();
                    });
                    const barrel_right = new TWEEN.Tween(this.object.rotation)
                    .to({ z: this.object.rotation.z - 2 * Math.PI }, 690)
                    .start();
                }
                break;
        }

        this.updateMovementVector();
        this.updateRotationVector();
    };

    this.keyup = function (event) {
        switch (event.keyCode) {
            case 32:
                /*Space*/ this.speed_multiplier *= 0.99;
                this.accelerate = false;
                break;
            case 16:
                /*Shift*/ this.speed_multiplier *= 0.69;
                this.brake = false;
                break;

            //case 84:
            //    /*T*/ this.moveState.forward = 0;
            //    break;
            //case 71:
            //    /*G*/ this.moveState.back = 0;
            //    break;

            //case 38:
            //    /*up*/ this.moveState.pitchUp = 0;
            //    break;
            //case 40:
            //    /*down*/ this.moveState.pitchDown = 0;
            //    break;

            //case 37:
            //    /*left*/ this.moveState.yawLeft = 0;
            //    break;
            //case 39:
            //    /*right*/ this.moveState.yawRight = 0;
            //    break;

            case 81:
                /*Q*/ //this.moveState.rollLeft = 0;
                scope.isLocked = true;
                //map[81] = false;
                break;
            case 69:
                /*E*/ //this.moveState.rollRight = 0;
                scope.isLocked = true;
                //map[69] = false;
                break;
        }

        this.updateMovementVector();
        this.updateRotationVector();
    };

    this.update = function (delta) {
        if (this.speed_multiplier < 1.0 && !this.brake) {
            this.speed_multiplier *= 1.5;
        } else if (this.speed_multiplier > 1.0 && !this.accelerate) {
            this.speed_multiplier *= 0.98;
        }
        var moveMult = delta * this.movementSpeed * this.speed_multiplier;
        var rotMult = delta * this.rollSpeed;

        this.object.translateX(this.moveVector.x * moveMult);
        this.object.translateY(this.moveVector.y * moveMult);
        this.object.translateZ(this.moveVector.z * moveMult);

        this.tmpQuaternion
            .set(
                this.rotationVector.x * rotMult,
                this.rotationVector.y * rotMult,
                this.rotationVector.z * rotMult,
                1
            )
            .normalize();
        this.object.quaternion.multiply(this.tmpQuaternion);

        // expose the rotation vector for convenience
        this.object.rotation.setFromQuaternion(
            this.object.quaternion,
            this.object.rotation.order
        );
        TWEEN.update();
        /*
        if (this.barrel_right > 0) {
            // Lazy implementation of twirl
            this.barrel_right -= Math.PI / 8;
            this.rotationVector.z -= Math.PI / 8;
        } else if (this.barrel_left > 0) {
            // Lazy implementation of twirl
            this.barrel_left -= Math.PI / 8;
            this.rotationVector.z += Math.PI / 8;
        } else {
            this.rotationVector.z = 0;
        }
        */

        // Mouse lock during game only
        if (hud.style.display === 'block') {
            this.lock();
        } else {
            this.unlock();
        }
    };

    this.updateMovementVector = function () {
        var forward =
            this.moveState.forward || (this.autoForward && !this.moveState.back)
                ? 1
                : 0;

        this.moveVector.x = -this.moveState.left + this.moveState.right;
        this.moveVector.y = -this.moveState.down + this.moveState.up;
        this.moveVector.z = -forward + this.moveState.back;
    };

    this.updateRotationVector = function () {
        this.rotationVector.x =
            -this.moveState.pitchDown + this.moveState.pitchUp;
        this.rotationVector.y =
            -this.moveState.yawRight + this.moveState.yawLeft;
        this.rotationVector.z =
            -this.moveState.rollRight + this.moveState.rollLeft;
    };

    this.getContainerDimensions = function () {
        if (this.domElement != document) {
            return {
                size: [
                    this.domElement.offsetWidth,
                    this.domElement.offsetHeight,
                ],
                offset: [this.domElement.offsetLeft, this.domElement.offsetTop],
            };
        } else {
            return {
                size: [window.innerWidth, window.innerHeight],
                offset: [0, 0],
            };
        }
    };

    function bind(scope, fn) {
        return function () {
            fn.apply(scope, arguments);
        };
    }

    function contextmenu(event) {
        event.preventDefault();
    }

    this.dispose = function () {
        this.domElement.removeEventListener('contextmenu', contextmenu, false);

        this.domElement.removeEventListener('mousemove', _mousemove, false);
        window.removeEventListener('keydown', _keydown, false);
        window.removeEventListener('keyup', _keyup, false);
    };

    var _mousemove = bind(this, this.onMouseMove);
    var _keydown = bind(this, this.keydown);
    var _keyup = bind(this, this.keyup);

    this.domElement.addEventListener('contextmenu', contextmenu, false);
    this.domElement.addEventListener('mousemove', _mousemove, false);

    // bound check and turn if out of bounds!
    this.inXBounds();
    this.inYBounds();
    this.inZBounds();
    if (this.game_edge_return.right_x > 0) {
        this.accelerate = false;
        this.moveVector.x = 0;
        this.moveVector.y = 0;
        this.moveVector.z = 0;
        this.game_edge_return.right_x -= Math.PI / 2;
        this.rotationVector.x -= Math.PI / 2;
        this.rotationVector.y -= Math.PI / 2;
    } else {
        this.rotationVector.x = 0;
    }

    if (this.game_edge_return.right_y > 0) {
        this.accelerate = false;
        this.moveVector.x = 0;
        this.moveVector.y = 0;
        this.moveVector.z = 0;
        this.game_edge_return.right_y -= Math.PI / 2;
        this.rotationVector.y -= Math.PI / 2;
        this.rotationVector.x -= Math.PI / 2;
    } else {
        this.rotationVector.y = 0;
    }

    if (this.game_edge_return.right_z > 0) {
        this.accelerate = false;
        this.moveVector.x = 0;
        this.moveVector.y = 0;
        this.moveVector.z = 0;
        this.game_edge_return.right_z -= Math.PI / 2;
        this.rotationVector.z -= Math.PI / 2;
        this.rotationVector.y -= Math.PI / 2;
    } else {
        this.rotationVector.z = 0;
    }

    if (this.game_edge_return.left_x > 0) {
        this.accelerate = false;
        this.moveVector.x = 0;
        this.moveVector.y = 0;
        this.moveVector.z = 0;
        this.game_edge_return.left_x -= Math.PI / 2;
        this.rotationVector.x -= Math.PI / 2;
        this.rotationVector.y -= Math.PI / 2;
    } else {
        this.rotationVector.x = 0;
    }

    if (this.game_edge_return.left_y > 0) {
        this.accelerate = false;
        this.moveVector.x = 0;
        this.moveVector.y = 0;
        this.moveVector.z = 0;
        this.game_edge_return.left_y -= Math.PI / 2;
        this.rotationVector.y -= Math.PI / 2;
        this.rotationVector.x -= Math.PI / 2;
    } else {
        this.rotationVector.y = 0;
    }

    if (this.game_edge_return.left_z > 0) {
        this.accelerate = false;
        this.moveVector.x = 0;
        this.moveVector.y = 0;
        this.moveVector.z = 0;
        this.game_edge_return.left_z -= Math.PI / 2;
        this.rotationVector.z -= Math.PI / 2;
        this.rotationVector.y -= Math.PI / 2;
    } else {
        this.rotationVector.z = 0;
    }

    window.addEventListener('keydown', _keydown, false);
    window.addEventListener('keyup', _keyup, false);

    this.updateMovementVector();
    this.updateRotationVector();
};

// from PointerLockControls.js, do we need this?
Controls.prototype = Object.create(EventDispatcher.prototype);
Controls.prototype.constructor = Controls;

export { Controls };
