import { AmbientLight, AxesHelper, BufferGeometry, CircleGeometry, Color, MeshBasicMaterial, PointLight, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowEdgeParameters, FlowRoute,
  FlowNodeParameters,
  FlowConnectorParameters,
  FlowDiagram,
  FlowDiagramOptions,
  FlowDiagramParameters,
  FlowInteraction,
  FlowConnectors,
  ConnectorMesh,
  InteractiveEventType,
  FlowNode, FlowEdge, FlowEventType, FlowRouteParameters
} from "three-flow";

export class BasicExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
    app.camera.position.z = 3

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
        id: "1",
        x: 0, y: 0, z: 0,
        label: {
          text: "Title1",
          size: 0.1,
          material: { color: 0xffffff },
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
        material: { color: 0x297029, transparent: true, opacity: 0.5 },
        resizematerial: { color: 0xff0000 },
        scalematerial: { color: 0xfff370 },
        connectors: [
          { id: "n1c1", anchor: 'left', index: 0, label: { text: 'input', font: 'helvetika', material: { color: 'white' }, alignX: 'left' } },
          { id: "n1c2", anchor: 'left', index: 1 },
          { id: "n1c3", anchor: 'right', index: 0, label: { text: 'output', font: 'helvetika', material: { color: 'white' }, alignX: 'right' } }
        ],
      },
      {
        id: "2",
        x: 2, y: 0, z: 0,
        label: {
          text: "Title2",
          size: 0.1,
          material: { color: 0xffffff },
          font: 'helvetika'
        },
        labelanchor: 'right',
        labeltransform: {
          translate: { x: -0.1 },
          rotate: { z: 90 },
        },
        draggable: true,
        resizable: true,
        scalable: true,
        scale: 1,
        width: 1,
        height: 1,
        material: { color: 'red' },
        resizematerial: { color: 0xff0000 },
        scalematerial: { color: 0xfff370 },
        connectors: [
          { id: "n2c1", anchor: 'left', shape: 'cube', transform: { rotate: { z: 180 } } },
        ],
      },
      {
        id: "3",
        x: -2, y: 0, z: 0,
        label: {
          text: "Title3",
          size: 0.1,
          material: { color: 0xffffff },
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
        material: { color: 'gold' },
        resizematerial: { color: 0xff0000 },
        scalematerial: { color: 0xfff370 },
        connectors: [
          { id: "n3c1", anchor: 'right', hidden: true },
          { id: "n3c2", anchor: 'right', index: 1, material: { color: 'green' } },
        ]
      }

    ];


    const edges: FlowEdgeParameters[] = [
      {
        from: "1",
        to: "3",
        fromconnector: "n1c1",
        toconnector: "n3c1",
      },
      {
        from: "1",
        to: "3",
        fromconnector: "n1c2",
        toconnector: "n3c2",
      },
      {
        from: "2",
        to: "1",
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
    let interaction: FlowInteraction

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
      //flow.position.y = 1

      flow.createRoute = (parameters: FlowRouteParameters) => {
        const route = new FlowRoute(flow, parameters)

        if (parameters.dragging) {
          route.createGeometry = () => {
            return new CircleGeometry(route.radius, 6)
          }
        }

        return route

      }

      // make the flow interactive
      interaction = new FlowInteraction(flow, app, app.camera)
      const connectors = new FlowConnectors(flow)

      let triangle: BufferGeometry
      let hexagon: BufferGeometry

      // globally override connector shape based on parameters
      connectors.createGeometry = (parameters: FlowConnectorParameters): BufferGeometry => {
        if (!triangle) triangle = new CircleGeometry(parameters.radius, 3)
        if (!hexagon) hexagon = new CircleGeometry(parameters.radius, 6)

        if (parameters.anchor == 'left')
          return triangle
        else
          return hexagon
      }

      flow.load(diagram)

      //
      // how to override connector shape for a specific node or type of node
      //
      const node4 = flow.addNode({
        id: '4', x: -2, y: 1.5, material: { color: 'blue' },
        label: { text: 'Title4', font: 'helvetika', material: { color: 'white' }, },
        resizable: false, draggable: false
      })

      // for a specific node, override connector shape based on parameters
      const connectors1 = connectors.hasNode('4')!
      let square: BufferGeometry
      let octagon: BufferGeometry

      connectors1.createGeometry = (parameters: FlowConnectorParameters): BufferGeometry => {
        if (!square) square = new CircleGeometry(parameters.radius, 4)
        if (!octagon) octagon = new CircleGeometry(parameters.radius, 8)

        if (parameters.anchor == 'left')
          return square
        else
          return octagon
      }
      connectors1.createConnector = (parameters: FlowConnectorParameters): ConnectorMesh => {
        const mesh = new ConnectorMesh(connectors1, parameters)

        const original = (mesh.material as MeshBasicMaterial).clone()
        const white = new MeshBasicMaterial({ color: 'white' })

        mesh.addEventListener(InteractiveEventType.POINTERENTER, () => {
          mesh.material = white
          document.body.style.cursor = 'grab'
        })
        mesh.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
          mesh.material = original
          document.body.style.cursor = 'default'
        })

        // make a parameter
        const distanceBeforeCreate = 0.2
        const createOnDrop = true

        let newnode: FlowNode | undefined
        const createNode = (start: Vector3) => {
          newnode = flow.addNode({
            x: start.x, y: start.y, material: { color: 'blue' },
            label: { text: 'New Node', font: 'helvetika', material: { color: 'white' }, },
            resizable: false,
            connectors: [
              { id: '', anchor: mesh.oppositeAnchor, index: 0 },
            ]
          })

          flow.addEdge({ from: node4.name, to: newnode.name, fromconnector: mesh.name, toconnector: newnode.node.connectors![0].id })
        }

        let dragnode: FlowNode | undefined
        let dragedge: FlowEdge | undefined
        const createDragNode = (start: Vector3) => {
          dragnode = flow.addRoute({
            x: start.x, y: start.y, material: { color: 'blue' }, dragging: true
            //label: { text: 'New Node', font: 'helvetika', material: { color: 'white' }, },
          })

          dragedge = flow.addEdge({ from: node4.name, to: dragnode.name, fromconnector: mesh.name, })
        }

        let dragStart: Vector3 | undefined
        let flowStart: Vector3 | undefined
        mesh.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
          dragStart = e.position.clone()
          flowStart = flow.getFlowPosition(mesh)
        })

        let dragDistance = 0
        mesh.addEventListener(InteractiveEventType.DRAG, (e: any) => {
          const position = e.position.clone()
          const diff = position.sub(dragStart) as Vector3
          dragDistance = diff.length()
          if (dragDistance > distanceBeforeCreate) {
            if (!createOnDrop) {
              if (!newnode) createNode(flowStart!)
            }
            else {
              if (!dragnode) createDragNode(flowStart!)
            }
          }

          if (newnode) {
            newnode.position.copy(position.add(flowStart) as Vector3)
            newnode.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
          }
          if (dragnode) {
            dragnode.position.copy(position.add(flowStart) as Vector3)
            dragnode.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
          }
        })

        mesh.addEventListener(InteractiveEventType.DRAGEND, (e: any) => {
          if (dragDistance > distanceBeforeCreate) {
            if (createOnDrop)
              createNode(e.position.clone().add(flowStart) as Vector3)

            if (dragnode) flow.removeNode(dragnode)
            dragnode = undefined
            if (dragedge) flow.removeEdge(dragedge)
            dragedge = undefined
          }
          newnode = undefined
        })
        return mesh
      }

      connectors.addConnectors(node4, [{ id: 'n4c1', anchor: 'right' }])
      connectors.addConnectors(node4, [{ id: 'n4c2', anchor: 'left', selectable: true, draggable: true }])

      // add the edge between nodes and specific connectors
      flow.addEdge({ from: '4', to: '1', fromconnector: 'n4c1', toconnector: 'n1c2' })

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
      //folder.addColor(node1, 'resizecolor').name('Resize Color')
      folder.add<any, any>(node1, 'draggable').name('Draggable')
      folder.add<any, any>(node1, 'scalable').name('Scalable')
      //folder.addColor(node1, 'scalecolor').name('Scale Color')
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
      interaction.dispose()
      gui.destroy()
      orbit.dispose()
    }

  }
}
