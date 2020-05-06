import { Vector3, Group, Sphere } from 'three';
import {
    MeshBasicMaterial,
    DoubleSide,
    RingBufferGeometry,
    SphereBufferGeometry,
    Mesh,
} from 'three';

class Fuel extends Group {
    constructor(parent, color, positionVec) {
        // Call parent Group() constructor
        super();

        // this.layers.set(1);

        if (color === 'red') {
            this.fuelColor = 0xff0000;
        } else if (color === 'green') {
            this.fuelColor = 0x00ff22;
        } else if (color === 'yellow') {
            this.fuelColor = 0xf6ff00;
        } else {
            //default option is red
            this.fuelColor = 0xff0000;
        }

        let outerRing = createOuterRingMesh();
        let innerRing = createInnerRingMesh(this.fuelColor);
        let energyOrb = createEnergyOrbMesh();

        let boundingSphere = createBoundingSphere();

        boundingSphere.center.x = positionVec.x;
        boundingSphere.center.y = positionVec.y;
        boundingSphere.center.z = positionVec.z;

        this.boundingSphere = boundingSphere;

        outerRing.mesh.position.x = positionVec.x;
        outerRing.mesh.position.y = positionVec.y;
        outerRing.mesh.position.z = positionVec.z;
        this.add(outerRing.mesh);
        this.outerRing = outerRing;

        innerRing.mesh.position.x = positionVec.x;
        innerRing.mesh.position.y = positionVec.y;
        innerRing.mesh.position.z = positionVec.z;
        this.add(innerRing.mesh);
        this.innerRing = innerRing;

        energyOrb.mesh.position.x = positionVec.x;
        energyOrb.mesh.position.y = positionVec.y;
        energyOrb.mesh.position.z = positionVec.z;
        this.add(energyOrb.mesh);
        this.energyOrb = energyOrb.mesh;

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        // if this starts moving, be sure add code to update the bounding Sphere location

        this.outerRing.mesh.rotation.z -= 0.005;
        this.innerRing.mesh.rotation.z += 0.015;
        this.innerRing.mesh.rotation.y += 0.015;
    }
}

function createOuterRingMesh() {
    let outerRing = {};

    outerRing.material = new MeshBasicMaterial({
        color: 0x00ffff,
        side: DoubleSide,
        wireframe: true,
    });

    // use ring geometry
    outerRing.geometry = new RingBufferGeometry(0.29, 0.53, 6);

    // create ring mesh
    outerRing.mesh = new Mesh(outerRing.geometry, outerRing.material);
    outerRing.mesh.layers.enable(1);
    outerRing.isMesh = true;

    return outerRing;
}

function createInnerRingMesh(color) {
    let innerRing = {};

    innerRing.material = new MeshBasicMaterial({
        color: color,
        side: DoubleSide,
        wireframe: true,
    });

    // use ring geometry
    innerRing.geometry = new RingBufferGeometry(0.39, 0.43, 6);

    // create ring mesh
    innerRing.mesh = new Mesh(innerRing.geometry, innerRing.material);
    innerRing.mesh.layers.enable(1);
    innerRing.isMesh = true;

    return innerRing;
}

function createEnergyOrbMesh() {
    let energyOrb = {};

    energyOrb.material = new MeshBasicMaterial({
        color: 0xffffff,
        side: DoubleSide,
        wireframe: true,
    });

    // use orb geometry
    energyOrb.geometry = new SphereBufferGeometry(0.11, 10, 10);

    // create orb mesh
    energyOrb.mesh = new Mesh(energyOrb.geometry, energyOrb.material);
    energyOrb.mesh.layers.enable(1);
    energyOrb.isMesh = true;

    return energyOrb;
}

function createBoundingSphere() {
    let boundingSphere = {};

    boundingSphere = new Sphere(new Vector3(), 0.35);

    return boundingSphere;
}

export default Fuel;
