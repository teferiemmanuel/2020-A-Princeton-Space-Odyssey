import { Group, SpotLight, AmbientLight, HemisphereLight } from 'three';

class BasicLights extends Group {
    constructor(...args) {
        // Invoke parent Group() constructor with our args
        super(...args);

        const dir = new SpotLight(0xffffff, 1.6, 7, 0.8, 1, 1);
        const ambi = new AmbientLight(0x404040, 1.32);

        dir.position.set(5, 2, 2);
        dir.target.position.set(0, 10, 0);

        this.add(ambi, dir);
    }
}

export default BasicLights;
