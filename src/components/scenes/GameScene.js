import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land, Fuel } from 'objects';
import { BasicLights } from 'lights';

class GameScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            rotationSpeed: 0,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const land = new Land();
        const flower = new Flower(this);
        const lights = new BasicLights();
        const fuel = new Fuel(this);
        this.add(land, flower, lights, fuel);

        // Populate GUI
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default GameScene;
