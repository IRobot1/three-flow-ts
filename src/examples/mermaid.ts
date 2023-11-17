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
import { parse } from './mermaid/parser.js';
import { DagreLayout } from "./dagre-layout";
import { GraphLabel } from "@dagrejs/dagre";

type ShapeType = 'circle' | 'square'
interface MermaidNode {
  id: string
  label?: { type: ShapeType, label?: string }
}

interface MermaidEdge {
  from: MermaidNode
  to: MermaidNode
  arrow: string
}
interface MermaidFlowchart {
  layout: { type: string, direction: string }
  edges: Array<MermaidEdge>
}

export class MermaidExample {

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
    const loader = new FontLoader();

    // Example Mermaid flowchart
    const flowchart = `
graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Do Something]
    B -->|No| D[Do Something Else]
    C --> E[End]
    D --> E




    `;

    let parsedOutput: MermaidFlowchart;
    // Parse the flowchart
    try {
      parsedOutput = parse(flowchart) as MermaidFlowchart;
      console.log(parsedOutput);
    } catch (error) {
      console.error('Parsing error:', error);
    }

    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      const options: FlowDiagramOptions = {
        gridsize: 0.3,
        fonts: new Map<string, Font>([
          ['default', font],
        ]),
        layout: new DagreLayout()
      }

      // read-only flow
      const flow = new FlowDiagram(options)
      scene.add(flow);

      // make the flow interactive
      new FlowInteraction(flow, app, app.camera)

      parsedOutput.edges.forEach(edge => {
        const from = edge.from
        let node = flow.hasNode(from.id)
        if (!node) {
          if (!from.label) from.label = { type:'square', label:from.id}
          flow.setNode({ text: from.id, label: from.label.label, labelsize:0.15 })
        }

        const to = edge.to
        node = flow.hasNode(to.id)
        if (!node) {
          if (!to.label) to.label = { type: 'square', label: to.id }
          flow.setNode({ text: to.id, label: to.label.label, labelsize: 0.15 })
        }

        // TODO: arrows
        flow.setEdge({ v: from.id, w: to.id })
      })

      flow.layout(<GraphLabel>{ rankdir: parsedOutput.layout.direction, ranksep: 1 })
      console.warn(flow.save())
    });


    this.dispose = () => {
      orbit.dispose()
    }

  }
}
