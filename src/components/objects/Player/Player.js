import { Vector3, Group, Sphere } from 'three';
import {
    MeshBasicMaterial,
    DoubleSide,
    RingBufferGeometry,
    SphereBufferGeometry,
    Mesh,
} from 'three';

class Player extends Group {
    constructor(parent, positionVec) {
        // Call parent Group() constructor
        super();



        let boundingSphere = createBoundingSphere();

        boundingSphere.center.x = positionVec.x;
        boundingSphere.center.y = positionVec.y;
        boundingSphere.center.z = positionVec.z;

        this.boundingSphere = boundingSphere;

        this.positionVec = positionVec;

        // debugging mesh just in case we need to visualize boudingSphere
        // let energyOrbMesh = createEnergyOrbMesh();

        // energyOrbMesh.position.x = positionVec.x;
        // energyOrbMesh.position.y = positionVec.y;
        // energyOrbMesh.position.z = positionVec.z;
        // this.add(energyOrbMesh);
        // this.energyOrb = energyOrbMesh

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
      this.boundingSphere.center.x = this.positionVec.x;
      this.boundingSphere.center.y = this.positionVec.y;
      this.boundingSphere.center.z = this.positionVec.z;

      // debugging mesh
      // this.energyOrb.position.x = this.positionVec.x;
      // this.energyOrb.position.y = this.positionVec.y;
      // this.energyOrb.position.z = this.positionVec.z;
    }
}

function createBoundingSphere() {

  let boundingSphere = {}

  boundingSphere = new Sphere(new Vector3(), 0.6);
  return boundingSphere;
}

// function createEnergyOrbMesh() {
//   let energyOrb = {}
//
//     energyOrb.material = new MeshBasicMaterial({
//      color: 0xff,
//      side: DoubleSide,
//      wireframe: false,
//    });
//
//   // use orb geometry
//   energyOrb.geometry = new SphereBufferGeometry(.6, 10, 10);
//
//   // create orb mesh
//   energyOrb.mesh = new Mesh( energyOrb.geometry,  energyOrb.material);
//   return energyOrb.mesh;
// }

export default Player;