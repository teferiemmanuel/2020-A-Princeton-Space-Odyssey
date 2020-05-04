import { Vector3, Group } from 'three';
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

        if (color === 'red') {
          this.fuelColor = 0xff0000;
        }
        else if (color === 'green') {
          this.fuelColor = 0x00ff22;
        }
        else if (color === 'yellow') {
          this.fuelColor = 0xf6ff00;
        }
        else {
          //default option is red
          this.fuelColor = 0xff0000;
        }


        let outerRingMesh = createOuterRingMesh();
        let innerRingMesh = createInnerRingMesh(this.fuelColor);
        let energyOrbMesh = createEnergyOrbMesh();

        outerRingMesh.position.x = positionVec.x;
        outerRingMesh.position.y = positionVec.y;
        outerRingMesh.position.z = positionVec.z;
        this.add(outerRingMesh);
        this.outerRingMesh = outerRingMesh

        innerRingMesh.position.x = positionVec.x;
        innerRingMesh.position.y = positionVec.y;
        innerRingMesh.position.z = positionVec.z;
        this.add(innerRingMesh);
        this.innerRingMesh = innerRingMesh

        energyOrbMesh.position.x = positionVec.x;
        energyOrbMesh.position.y = positionVec.y;
        energyOrbMesh.position.z = positionVec.z;
        this.add(energyOrbMesh);
        this.energyOrb = energyOrbMesh

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
      this.outerRingMesh.rotation.z -= 0.005
      this.innerRingMesh.rotation.z += 0.015;
      this.innerRingMesh.rotation.y += 0.015;
    }
}

function createOuterRingMesh() {
  let outerRing = {}

   outerRing.material = new MeshBasicMaterial({
     color: 0x00ffff,
     side: DoubleSide,
     wireframe: true
   });

  // use ring geometry
  outerRing.geometry = new RingBufferGeometry(0.29, .53, 6);

  // create ring mesh
  outerRing.mesh = new Mesh(outerRing.geometry, outerRing.material);
  outerRing.mesh.position.x = 0;
  outerRing.mesh.position.y = 0;
  outerRing.mesh.position.z = 5;

  return outerRing.mesh;
}

function createInnerRingMesh(color) {
  let innerRing = {}

   innerRing.material = new MeshBasicMaterial({
     color: color,
     side: DoubleSide,
     wireframe: true
   });

  // use ring geometry
  innerRing.geometry = new RingBufferGeometry(0.39, .43, 6);

  // create ring mesh
  innerRing.mesh = new Mesh(innerRing.geometry, innerRing.material);
  innerRing.mesh.position.x = 0;
  innerRing.mesh.position.y = 0;
  innerRing.mesh.position.z = 5;

  return innerRing.mesh;
}

function createEnergyOrbMesh() {
  let energyOrb = {}

    energyOrb.material = new MeshBasicMaterial({
     color: 0xffffff,
     side: DoubleSide,
     wireframe: true
   });

  // use orb geometry
  energyOrb.geometry = new SphereBufferGeometry(0.11, 10, 10);

  // create orb mesh
  energyOrb.mesh = new Mesh( energyOrb.geometry,  energyOrb.material);
  energyOrb.mesh.position.x = 0;
  energyOrb.mesh.position.y = 0;
  energyOrb.mesh.position.z = 5;

  return energyOrb.mesh;
}

export default Fuel;
