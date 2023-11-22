import { AmbientLight, BufferGeometry, CircleGeometry, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowEdgeParameters,
  FlowNodeParameters,
  FlowConnectorParameters,
  FlowDiagram,
  FlowDiagramOptions,
  FlowDiagramParameters,
  FlowInteraction,
  FlowConnectors,
} from "three-flow";

export class BasicExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
    app.camera.position.z = 2

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
        label: {
          text: "Title1",
          size: 0.1,
          color: 0xffffff,
          font: 'helvetika'
        },
        labelanchor: 'top',
        labeltransform: { translate: { y: -0.1 } },
        draggable: true,
        resizable: true,
        scalable: true,
        scale: 1,
        width: 1,
        height: 2,
        color: 0x297029,
        resizecolor: 0xff0000,
        scalecolor: 0xfff370,
        connectors: [
          { id: "n1c1", anchor: 'left', index: 0, label: { text: 'input', font: 'helvetika', color: 'white', alignX: 'left' } },
          { id: "n1c2", anchor: 'left', index: 1 },
          { id: "n1c3", anchor: 'right', index: 0, label: { text: 'output', font: 'helvetika', color: 'white', alignX: 'right' } }
        ],
      },
      {
        text: "2",
        x: 2, y: 0, z: 0,
        label: {
          text: "Title2",
          size: 0.1,
          color: 0xffffff,
          font: 'helvetika'
        },
        labelanchor: 'right',
        labeltransform: {
          translate: { y: 0.1 },
          rotate: { z: 90 },
        },
        draggable: true,
        resizable: false,
        scalable: true,
        scale: 1,
        width: 1,
        height: 1,
        color: 'red',
        resizecolor: 0xff0000,
        scalecolor: 0xfff370,
        connectors: [
          { id: "n2c1", anchor: 'left', shape: 'cube', transform: { rotate: { z: 180 } } },
        ],
      },
      {
        text: "3",
        x: -2, y: 0, z: 0,
        label: {
          text: "Title3",
          size: 0.1,
          color: 0xffffff,
          font: 'helvetika'
        },
        labelanchor: 'bottom',
        labeltransform: {
          translate: { y: 0.1 },
        },
        draggable: true,
        resizable: false,
        scalable: true,
        scale: 1,
        width: 1,
        height: 1,
        color: 'gold',
        resizecolor: 0xff0000,
        scalecolor: 0xfff370,
        connectors: [
          { id: "n3c1", anchor: 'right' },
          { id: "n3c2", anchor: 'right', index: 1 },
        ]
      }

    ];


    const edges: FlowEdgeParameters[] = [
      {
        v: "1",
        w: "3",
        fromconnector: "n1c1",
        toconnector: "n3c1",
      },
      {
        v: "1",
        w: "3",
        fromconnector: "n1c2",
        toconnector: "n3c2",
      },
      {
        v: "2",
        w: "1",
        fromconnector: "n2c1",
        toconnector: "n1c3"
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
      const connectors = new FlowConnectors(flow)

      // globally override connector shape based on parameters
      connectors.createGeometry = (size: number, parameters: FlowConnectorParameters): BufferGeometry => {
        if (parameters.anchor == 'left')
          return new CircleGeometry(size, 3)
        else
          return new CircleGeometry(size, 6)
      }

      flow.load(diagram)

      //
      // how to add connectors dynamically
      //
      //const connectors = new FlowConnectors(flow)
      //diagram.nodes.forEach(item => {
      //  const node = flow.hasNode(item.text!)!
      //  connectors.addConnectors(node, item.connectors!)
      //})

      //diagram.edges.forEach(item => {
      //  const edge = flow.hasEdge(item.name!)!
      //  edge.addConnector(item.fromconnector, item.toconnector)
      //})

      //
      // how to remove connectors dynamically, order doesn't matter, but remember to do both edge and node
      //
      //diagram.edges.forEach(item => {
      //  const edge = flow.hasEdge(item.name!)!
      //  edge.removeConnector()
      //})
      //diagram.nodes.forEach(item => {
      //  const node = flow.hasNode(item.text!)!
      //  connectors.removeConnectors(node, item.connectors!)
      //})

      const node1 = flow.hasNode('1')!

      //
      // how to add and remove edges and connectors at runtime
      //
      //const connector = <FlowConnectorParameters>{ id: "n1c4", anchor: 'right', index: 1 }
      //connectors.addConnectors(node1, [connector])
      ////connectors.removeConnectors(node1, [connector])

      //const edge4 = flow.addEdge({ v: "2", w: "1" })
      //edge4.addConnector("n2c1", "n1c4")
      ////flow.removeEdge(edge4)
      ////edge4.removeConnector()

      console.warn(flow.save())

      gui.add(flow, 'gridsize', 0, 1).name('Snap-to-Grid Size')

      const folder = gui.addFolder('Node Properties')
      folder.add<any, any>(node1, 'width', 0.3, 3).name('Width')
      folder.add<any, any>(node1, 'minwidth', 0.3, 3).name('Min Width')
      folder.add<any, any>(node1, 'maxwidth', 0.3, 3).name('Max Width')
      folder.add<any, any>(node1, 'height', 0.3, 3).name('Height')
      folder.add<any, any>(node1, 'minheight', 0.3, 3).name('Min Height')
      folder.add<any, any>(node1, 'maxheight', 0.3, 3).name('Max Height')
      folder.addColor(node1, 'color').name('Color')
      folder.add<any, any>(node1.label, 'text').name('Label')
      folder.add<any, any>(node1.label, 'size', 0.05, 0.3).name('Label Size')
      folder.addColor(node1.label, 'color').name('Label Color')
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
