import { AmbientLight, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { ThreeJSApp } from "../app/threejs-app";
import {
  AbstractEdge,
  AbstractGraph,
  FlowInteractive,
  FlowGraph,
  FlowGraphOptions
} from "three-flow";

import { civilizationdata } from "./civilization-data";

export class CivilizationExample {

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



    const interactive = new FlowInteractive(app, app.camera)

    const loader = new FontLoader();


    const graph: AbstractGraph = {
      version: 1,
      nodes: [], connectors: [], edges: []
    }

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const options: FlowGraphOptions = {
        gridsize: 0.3,
        fonts: new Map<string, Font>([
          ['default', font],
        ])
      }
      const flow = new FlowGraph(graph, interactive, options)
      scene.add(flow);

      civilizationdata.forEach(tech => {
        const from = tech.tech_name;

        tech.leads_to.forEach(item => {
          const to = item;

          let outlink = 'out' + from
          let inlink = 'in' + to

          const fromnode = flow.hasNode(from)
          if (!fromnode) {
            const node = flow.addNode({ id: from, label: from, width: 2 });
            node.addOutputConnector({ id: outlink })
          }
          else {
            outlink = 'out' + from
            if (!fromnode.getConnector(outlink)) {
              fromnode.addOutputConnector({ id: outlink })
            }
          }

          if (!flow.hasNode(to)) {
            const node = flow.addNode({ id: to, label: to, width: 2 });
            node.addInputConnector({ id: inlink })
          }

          const edge: Partial<AbstractEdge> = {
            from: outlink, to: inlink
          }
          flow.addEdge(edge);
        })
      });

      console.warn(graph)
    });

    this.dispose = () => {
      orbit.dispose()
    }


  }
}
