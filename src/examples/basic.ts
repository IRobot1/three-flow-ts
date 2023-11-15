import { AmbientLight, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowEdgeParameters,
  FlowNodeParameters,
  FlowDiagram,
  FlowDiagramOptions,
  FlowDiagramParameters,
  FlowInteraction,
} from "three-flow";

export class BasicExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
    app.camera.position.z = 5

    scene.background = new Color(0x444444)

    const ambient = new AmbientLight()
    ambient.intensity = 1
    scene.add(ambient)

    const light = new PointLight(0xffffff, 1, 100)
    light.position.set(-1, 1, 2)
    light.castShadow = true
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 * 2
    scene.add(light)

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = false;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })


    //scene.add(new AxesHelper(3))


    const nodes: FlowNodeParameters[] = [
      {
        text: "1",
        x: 0, y: 0, z: 0,
        label: "Title1",
        labelsize: 0.1,
        labelcolor: 0xffffff,
        labelfont: 'helvetika',
        draggable: true,
        resizable: true,
        scalable: true,
        scale: 1,
        width: 1,
        height: 2,
        color: 0x297029,
        resizecolor: 0xff0000,
        scalecolor: 0xfff370,
      },
      {
        text: "2",
        x: 2, y: 0, z: 0,
        label: "Title2",
        labelsize: 0.1,
        labelcolor: 0xffffff,
        labelfont: 'helvetika',
        draggable: true,
        resizable: false,
        scalable: true,
        scale: 1,
        width: 1,
        height: 1,
        color: 'red',
        resizecolor: 0xff0000,
        scalecolor: 0xfff370,
      },
      {
        text: "3",
        x: -2, y: 0, z: 0,
        label: "Title3",
        labelsize: 0.1,
        labelcolor: 0xffffff,
        labelfont: 'helvetika',
        draggable: true,
        resizable: false,
        scalable: true,
        scale: 1,
        width: 1,
        height: 1,
        color: 'gold',
        resizecolor: 0xff0000,
        scalecolor: 0xfff370,
      }

    ];


    const edges: FlowEdgeParameters[] = [
      {
        name: "7",
        v: "1",
        w: "3",
      },
      {
        name: "8",
        v: "2",
        w: "1",
      }
    ];

    const loader = new FontLoader();

    const diagram: FlowDiagramParameters = {
      version: 1,
      nodes, edges
    }


    const gui = new GUI();

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const options: FlowDiagramOptions = {
        gridsize: 0.3,
        fonts: new Map<string, Font>([
          ['helvetika', font],
        ])
      }

      // read-only flow
      const flow = new FlowDiagram(options)
      scene.add(flow);

      // make the flow interactive
      new FlowInteraction(flow, app, app.camera)

      flow.load(diagram)

      const node1 = flow.hasNode('1')!

      gui.add(flow, 'gridsize', 0, 1).name('Snap-to-Grid Size')

      const folder = gui.addFolder('Node Properties')
      folder.add<any, any>(node1, 'width', 0.3, 3).name('Width')
      folder.add<any, any>(node1, 'minwidth', 0.3, 3).name('Min Width')
      folder.add<any, any>(node1, 'maxwidth', 0.3, 3).name('Max Width')
      folder.add<any, any>(node1, 'height', 0.3, 3).name('Height')
      folder.add<any, any>(node1, 'minheight', 0.3, 3).name('Min Height')
      folder.add<any, any>(node1, 'maxheight', 0.3, 3).name('Max Height')
      folder.addColor(node1, 'color').name('Color')
      folder.add<any, any>(node1, 'label').name('Label')
      folder.add<any, any>(node1, 'labelsize', 0.05, 0.3).name('Label Size')
      folder.addColor(node1, 'labelcolor').name('Label Color')
      //labelfont ?: string;
      //userData ?: { [key: string]: any };
      folder.add<any, any>(node1, 'resizable').name('Resizable')
      folder.addColor(node1, 'resizecolor').name('Resize Color')
      folder.add<any, any>(node1, 'draggable').name('Draggable')
      folder.add<any, any>(node1, 'scalable').name('Scalable')
      folder.addColor(node1, 'scalecolor').name('Scale Color')
      folder.add<any, any>(node1, 'scalar', 0.1, 5).name('Scale')
      folder.add<any, any>(node1, 'minscale', 0.1, 2).name('Min Scale')
      folder.add<any, any>(node1, 'maxscale', 0.1, 3).name('Max Scale')
      folder.add<any, any>(node1, 'hidden').name('Hidden')

      //
      // After moving a node, dispatch dragged event to notify all edges to redraw
      //
      //const node2 = flow.hasNode('2')!
      //let factor = 0.1
      //setInterval(() => {
      //  if (node2.position.y < -2 || node2.position.y > 2)
      //    factor = -factor
      //  node2.position.y += factor
      //  node2.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
      //}, 100)
    });


    this.dispose = () => {
      gui.destroy()
      orbit.dispose()
    }

  }
}
