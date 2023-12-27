import { AmbientLight, AxesHelper, Color, MathUtils, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowEdgeParameters,
  FlowDiagram,
  FlowDiagramOptions,
  FlowInteraction,
  FlowEventType
} from "three-flow";

import { civilizationdata } from "./civilization-data";
import { Exporter } from "three-flow";
import { DagreLayout } from "./dagre-layout";

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

    //scene.add(new AxesHelper())

    const loader = new FontLoader();
    let interaction: FlowInteraction

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const options: FlowDiagramOptions = {
        gridsize: 0.3,
        fonts: new Map<string, Font>([
          ['default', font],
        ]),
        linedivisions: 5,
        layout: new DagreLayout()
      }
      const flow = new FlowDiagram(options)
      scene.add(flow);
      flow.rotation.x = MathUtils.degToRad(-15)

      // make the flow interactive
      interaction = new FlowInteraction(flow, app.interactive)

      civilizationdata.forEach(tech => {
        const from = tech.tech_name;

        let outlink = 'out' + from
        const fromnode = flow.hasNode(from)
        if (!fromnode) {
          const node = flow.addNode({ id: from, label: { text: from, size: 0.25 }, width: 3 });
          //node.addOutputConnector({ text: outlink })
        }
        else {
          //  if (!fromnode.getConnector(outlink)) {
          //    //fromnode.addOutputConnector({ text: outlink })
          //  }
        }
        tech.leads_to.forEach(item => {
          const to = item;

          let inlink = 'in' + to

          const tonode = flow.hasNode(to)
          if (!tonode) {
            const node = flow.addNode({ id: to, label: { text: to, size: 0.25 }, width: 3 });
            //node.addInputConnector({ text: inlink })
          }
          //else {
          //  if (!tonode.getConnector(inlink)) {
          //    //tonode.addInputConnector({ text: inlink })
          //  }
          //}


          const edgeparams: FlowEdgeParameters = {
            from: from, to: to, toarrow: { indent: 0, scale: 1, offset: 0 }
          }
          const edge = flow.addEdge(edgeparams);
          edge.addEventListener(FlowEventType.DRAGGED, () => { edge.removeArrows() })

          // export to mermaid
          //console.log(`${from.replace(/ /g, '')}[${from}] --> ${to.replace(/ /g, '')}[${to}]`);
        })

      });

      flow.layout({ rankdir: 'LR', nodesep: 0.1, edgesep: 1, ranksep: 4 });

      const center = flow.getCenter()
      app.camera.position.x = center.x
      app.camera.position.y = center.y
      orbit.target.set(app.camera.position.x, app.camera.position.y, 0)
      app.camera.position.z = 16

      //  const exporter = new Exporter()
      //  exporter.saveJSON(flow.save(), 'civilization')
    });

    this.dispose = () => {
      interaction.dispose()
      orbit.dispose()
    }


  }
}
