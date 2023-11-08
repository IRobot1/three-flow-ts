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
import { languagedata } from "./langauge-data";

//import { graphlib, layout } from "@dagrejs/dagre";

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

      languagedata.forEach(item => {
        const from = item[0];
        const to = item[1];

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
      });

      console.warn(graph)

    //  // Create a new directed graph 
    //  var g = new graphlib.Graph();

    //  // Set an object for the graph label
    //  g.setGraph({ rankdir: 'TB' });

    //  // Default to assigning a new object as a label for each new edge.
    //  g.setDefaultEdgeLabel(function () { return {}; });

    //  // Add nodes to the graph. The first argument is the node id. The second is
    //  // metadata about the node. In this case we're going to add labels to each of
    //  // our nodes.
    //  graph.nodes.forEach(node => {
    //    g.setNode(node.id!, { label: node.label, width: node.width!, height: node.height! });
    //  })

    //  graph.edges.forEach(edge => {
    //    g.setEdge(edge.from!, edge.to!);
    //  })

    //  layout(g)
    //  console.warn(g)

    //  g.nodes().forEach(v => {
    //    const node = g.node(v)
    //    const x = flow.hasNode(v)
    //    if (x) {
    //      x.position.set(node.x/10, node.y, 0)
    //    }
    //  })
    });



    this.dispose = () => {
      orbit.dispose()
    }


  }
}
