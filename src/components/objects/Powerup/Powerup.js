import { Vector3, Group, Sphere } from 'three';
import {
    MeshBasicMaterial,
    DoubleSide,
    TorusBufferGeometry,
    TetrahedronBufferGeometry,
    Mesh,
} from 'three';
import { Body } from 'cannon';
import { Sphere as SpherePhysics } from 'cannon';

class Powerup extends Group {
    constructor(parent, color, pos, world) {
        // Call parent Group() constructor
        super();

        if (color === 'orange') {
            this.powerupColor = 0xff8b00;
        } else if (color === 'pink') {
            this.powerupColor = 0xee34ee;
        } else if (color === 'green') {
            this.powerupColor = 0x34ee43;
        } else if (color === 'turquoise') {
            this.powerupColor = 0x34eeee;
        } else {
            //default option is orange
            this.powerupColor = 0xff8b00;
        }

        let powerup_out = {};

        powerup_out.material = new MeshBasicMaterial({
            color: this.powerupColor,
            side: DoubleSide,
            wireframe: true,
        });

        // use torus geometry
        powerup_out.geometry = new TorusBufferGeometry(0.25, 0.16);

        // create torus mesh
        powerup_out.mesh = new Mesh(powerup_out.geometry, powerup_out.material);
        powerup_out.mesh.layers.enable(1);
        powerup_out.isMesh = true;

        let powerup_in = {};

        powerup_in.material = new MeshBasicMaterial({
            color: 0xffffff, //0x0a242a,
            side: DoubleSide,
            wireframe: true,
        });

        // use tetrahedron geometry
        powerup_in.geometry = new TetrahedronBufferGeometry(0.1);

        // create tetrahedron mesh
        powerup_in.mesh = new Mesh(powerup_in.geometry, powerup_in.material);
        powerup_in.mesh.layers.enable(1);
        powerup_in.isMesh = true;

        this.boundingSphere = new Sphere(new Vector3(), 0.25);

        this.boundingSphere.center.x = pos.x;
        this.boundingSphere.center.y = pos.y;
        this.boundingSphere.center.z = pos.z;

        powerup_out.mesh.position.x = pos.x;
        powerup_out.mesh.position.y = pos.y;
        powerup_out.mesh.position.z = pos.z;

        powerup_in.mesh.position.x = pos.x;
        powerup_in.mesh.position.y = pos.y;
        powerup_in.mesh.position.z = pos.z;

        this.add(powerup_out.mesh);
        this.powerup_out = powerup_out;
        this.add(powerup_in.mesh);
        this.powerup_in = powerup_in;

        const shape = new SpherePhysics(this.boundingSphere.radius);
        const body = new Body({
            position: pos.clone(),
        });
        body.addShape(shape);
        this.body = body;
        this.body.powerup = this;

        world.addBody(body);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        // Bob up and down
        this.powerup_out.mesh.rotation.y = 0.05 * Math.sin(timeStamp / 300);
        this.powerup_in.mesh.rotation.y = 0.05 * Math.sin(timeStamp / 300);

        // rotate outer torus
        this.powerup_out.mesh.rotation.z += 0.0069;
        this.powerup_out.mesh.rotation.x -= 0.0069;
        // rotate inner tetrahedron
        this.powerup_in.mesh.rotation.z -= 0.001137;
        this.powerup_in.mesh.rotation.x += 0.00069;
    }
}

export default Powerup;
