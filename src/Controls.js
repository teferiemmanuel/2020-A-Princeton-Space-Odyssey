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

// DO A BARREL ROLL
import Barrel_roll from './components/audio/barrel_roll.mp3';

const splash = document.getElementById('splash');
//const finishGame = document.getElementById('finishGameScreen');

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

    this.barrel_left = false;
    this.barrel_right = false;

    this.autoForward = false;

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
    this.moveVector = new Vector3(0, 0, 0);
    this.rotationVector = new Vector3(0, 0, 0);

    // camera is locked (from PointerLockControls)
    this.isLocked = false;
    var scope = this;
    var changeEvent = { type: 'change' };
    var lockEvent = { type: 'lock' };
    var unlockEvent = { type: 'unlock' };

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

    /*
    this.onMouseMove = function (event) {
        var container = this.getContainerDimensions();
        var halfWidth = container.size[0] / 2;
        var halfHeight = container.size[1] / 2;

        this.moveState.yawLeft =
            -(event.pageX - container.offset[0] - halfWidth) / halfWidth;
        this.moveState.pitchDown =
            (event.pageY - container.offset[1] - halfHeight) / halfHeight;

        this.updateRotationVector();
    };
    */

    function onPointerlockChange() {
        if (this.domElement.pointerLockElement === scope.domElement) {
            scope.dispatchEvent(lockEvent);

            scope.isLocked = true;
        } else {
            scope.dispatchEvent(unlockEvent);

            scope.isLocked = false;
        }
    }

    function onPointerlockError() {
        console.error('Controls: Unable to use Pointer Lock API');
    }

    this.lock = function () {
        this.domElement.requestPointerLock();
    };

    this.unlock = function () {
        this.domElement.exitPointerLock();
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

    this.moveRight = function (distance) {
        vec.setFromMatrixColumn(this.object.matrix, 0);

        this.object.position.addScaledVector(vec, distance);
    };

    this.keydown = function (event) {
        if (event.altKey) {
            return;
        }

        //event.preventDefault();

        switch (event.keyCode) {
            // case 65:
            //     /*A*/ this.moveState.left = 1;
            //     break;
            // case 68:
            //     /*D*/ this.moveState.right = 1;
            //     break;

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

            case 84:
                /*T*/ this.moveState.forward = 1;
                break;
            case 71:
                /*G*/ this.moveState.back = 1;
                break;

            case 38:
                /*up*/ this.moveState.pitchUp = 1;
                break;
            case 40:
                /*down*/ this.moveState.pitchDown = 1;
                break;

            case 37:
                /*left*/ this.moveState.yawLeft = 1;
                break;
            case 39:
                /*right*/ this.moveState.yawRight = 1;
                break;

            case 81:
                /*Q*/ this.moveState.rollLeft = 1;
                if (
                    !this.br_audio.isPlaying &&
                    splash.style.display == 'none'
                ) {
                    br_loader.load(Barrel_roll, function (buffer) {
                        br_audio.setBuffer(buffer);
                        br_audio.setLoop(false);
                        br_audio.setVolume(0.15);
                        br_audio.play();
                    });
                }
                break;
            case 69:
                /*E*/ this.moveState.rollRight = 1;
                if (
                    !this.br_audio.isPlaying &&
                    splash.style.display == 'none'
                ) {
                    br_loader.load(Barrel_roll, function (buffer) {
                        br_audio.setBuffer(buffer);
                        br_audio.setLoop(false);
                        br_audio.setVolume(0.15);
                        br_audio.play();
                    });
                }
                break;
        }

        this.updateMovementVector();
        this.updateRotationVector();
    };

    this.keyup = function (event) {
        switch (event.keyCode) {
            // case 65:
            //     /*A*/ this.moveState.left = 0;
            //     break;
            // case 68:
            //     /*D*/ this.moveState.right = 0;
            //     break;

            case 32:
                /*Space*/ this.speed_multiplier *= 0.99;
                this.accelerate = false;
                break;
            case 16:
                /*Shift*/ this.speed_multiplier *= 0.69;
                this.brake = false;
                break;

            case 84:
                /*T*/ this.moveState.forward = 0;
                break;
            case 71:
                /*G*/ this.moveState.back = 0;
                break;

            case 38:
                /*up*/ this.moveState.pitchUp = 0;
                break;
            case 40:
                /*down*/ this.moveState.pitchDown = 0;
                break;

            case 37:
                /*left*/ this.moveState.yawLeft = 0;
                break;
            case 39:
                /*right*/ this.moveState.yawRight = 0;
                break;

            case 81:
                /*Q*/ this.moveState.rollLeft = 0;
                break;
            case 69:
                /*E*/ this.moveState.rollRight = 0;
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

        /*
        if (splash.style.display == 'none' || finishGame.style.display == 'none') {
            this.isLocked = true;
        }
        else {
            this.isLocked = false;
        }
        */
    };

    this.updateMovementVector = function () {
        var forward =
            this.moveState.forward || (this.autoForward && !this.moveState.back)
                ? 1
                : 0;

        this.moveVector.x = -this.moveState.left + this.moveState.right;
        this.moveVector.y = -this.moveState.down + this.moveState.up;
        this.moveVector.z = -forward + this.moveState.back;

        //console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );
    };

    this.updateRotationVector = function () {
        this.rotationVector.x =
            -this.moveState.pitchDown + this.moveState.pitchUp;
        this.rotationVector.y =
            -this.moveState.yawRight + this.moveState.yawLeft;
        this.rotationVector.z =
            -this.moveState.rollRight + this.moveState.rollLeft;

        //console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );
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
        //this.domElement.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
        //this.domElement.removeEventListener( 'pointerlockerror', onPointerlockError, false );

        window.removeEventListener('keydown', _keydown, false);
        window.removeEventListener('keyup', _keyup, false);

        // account for pointer lock functions
        /*
        this.domElement.removeEventListener(
            'pointerlockchange',
            onPointerlockChange,
            false
        );
        this.domElement.removeEventListener(
            'pointerlockerror',
            onPointerlockError,
            false
        );
        */
    };

    var _mousemove = bind(this, this.onMouseMove);
    var _keydown = bind(this, this.keydown);
    var _keyup = bind(this, this.keyup);

    this.domElement.addEventListener('contextmenu', contextmenu, false);

    this.domElement.addEventListener('mousemove', _mousemove, false);
    /*
    this.domElement.addEventListener(
        'pointerlockchange',
        onPointerlockChange,
        false
    );
    this.domElement.addEventListener(
        'pointerlockerror',
        onPointerlockError,
        false
    );
    */

    window.addEventListener('keydown', _keydown, false);
    window.addEventListener('keyup', _keyup, false);

    this.updateMovementVector();
    this.updateRotationVector();
};

// from PointerLockControls.js, do we need this?
Controls.prototype = Object.create(EventDispatcher.prototype);
Controls.prototype.constructor = Controls;

export { Controls };
