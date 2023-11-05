import { AxesHelper, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { ThreeJSApp } from "../app/threejs-app";

export class DiagramExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
    app.camera.position.z = 10


    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    //orbit.enableRotate = false;
    orbit.update();

    scene.add(new AxesHelper(3))


    const loader = new FontLoader();

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      //barchart.showLabels(font);
    });
    this.dispose = () => {
      orbit.dispose()
    }

  }
}
