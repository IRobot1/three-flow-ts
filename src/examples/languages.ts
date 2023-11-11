import { AmbientLight, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { ThreeJSApp } from "../app/threejs-app";
import {
  AbstractEdge,
  FlowInteractive,
  FlowGraph,
  FlowGraphOptions
} from "three-flow";
import { languagedata } from "./langauge-data";
import { Exporter } from "./export";


export class LanguagesExample {

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


    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const options: FlowGraphOptions = {
        gridsize: 0.3,
        fonts: new Map<string, Font>([
          ['default', font],
        ])
      }
      const flow = new FlowGraph(options)
      scene.add(flow);

      languagedata.forEach(item => {
        const from = item[0];
        const to = item[1];

        let outlink = 'out' + from
        let inlink = 'in' + to

        const fromnode = flow.hasNode(from)
        if (!fromnode) {
          const node = flow.setNode({ text: from, label: from, labelsize: 0.2, width: 3 });
          //node.addOutputConnector({ text: outlink })
        }
        else {
          outlink = 'out' + from
          if (!fromnode.getConnector(outlink)) {
            //fromnode.addOutputConnector({ text: outlink })
          }
        }

        if (!flow.hasNode(to)) {
          const node = flow.setNode({ text: to, label: to, labelsize: 0.2, width: 3 });
          // node.addInputConnector({ text: inlink })
        }

        const edge: AbstractEdge = {
          v: from, w: to
        }
        flow.addEdge(edge);

        // export to mermaid
        //console.log(`${from.replace(/ /g, '')}[${from}] --> ${to.replace(/ /g, '')}[${to}]`);

      });

      flow.layout({ rankdir: 'TB', nodesep: 0.1, edgesep: 1, ranksep: 4 });

      const center = flow.getCenter()
      app.camera.position.x = center.x
      app.camera.position.y = center.y
      orbit.target.set(app.camera.position.x, app.camera.position.y, 0)
      app.camera.position.z = 16

      //  const exporter = new Exporter()
      //  exporter.saveJSON(flow.save(), 'languages')
    });



    this.dispose = () => {
      orbit.dispose()
    }


  }
}