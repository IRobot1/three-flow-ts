import { AmbientLight, AxesHelper, Color, MathUtils, Mesh, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowEdgeParameters,
  FlowDiagram,
  FlowDiagramOptions,
  FlowNode,
  FlowNodeParameters,
  FlowLabel,
  FlowLabelParameters
} from "three-flow";
import { languagedata } from "./langauge-data";
import { Exporter } from "three-flow";
import { DagreLayout } from "./dagre-layout";
import { TroikaFlowLabel } from "./troika-label";


export class LanguagesExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 15

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
    orbit.enableRotate = true;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    // scene.add(new AxesHelper())

    const loader = new FontLoader();


    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const options: FlowDiagramOptions = {
        gridsize: 0.3,
        fonts: new Map<string, Font>([
          ['default', font],
        ]),
        linestyle: 'bezier',
        layout: new DagreLayout()
      }
      const flow = new MyFlowDiagram(options)
      scene.add(flow);

      languagedata.forEach(item => {
        const from = item[0];
        const to = item[1];

        let outlink = 'out' + from
        let inlink = 'in' + to

        const fromnode = flow.hasNode(from)
        if (!fromnode) {
          const node = flow.addNode({ id: from, label: { text: from, size: 0.2 }, width: 3 });
          //node.addOutputConnector({ text: outlink })
        }
        //else {
        //  outlink = 'out' + from
        //  if (!fromnode.getConnector(outlink)) {
        //    //fromnode.addOutputConnector({ text: outlink })
        //  }
        //}

        if (!flow.hasNode(to)) {
          const node = flow.addNode({ id: to, label: { text: to, size: 0.2 }, width: 3 });
          // node.addInputConnector({ text: inlink })
        }

        const edge: FlowEdgeParameters = {
          from: from, to: to
        }
        flow.addEdge(edge);

        // export to mermaid
        //console.log(`${from.replace(/ /g, '')}[${from}] --> ${to.replace(/ /g, '')}[${to}]`);

      });

      flow.layout({ rankdir: 'TB', nodesep: 0.1, edgesep: 1, ranksep: 4 });

      flow.rotation.y = MathUtils.degToRad(-45)

      //  const exporter = new Exporter()
      //  exporter.saveJSON(flow.save(), 'languages')
    });



    this.dispose = () => {
      orbit.dispose()
    }


  }
}

class MyFlowDiagram extends FlowDiagram {
  override createLabel(label: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, label)
  }
}
