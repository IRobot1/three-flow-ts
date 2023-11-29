import { AmbientLight, BufferGeometry, CircleGeometry, Color, CurvePath, LineCurve3, PlaneGeometry, PointLight, Scene, TubeGeometry, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { ThreeJSApp } from '../app/threejs-app';
import {
  FlowDiagram,
  FlowConnectors,
  FlowLabelParameters,
  FlowNodeParameters,
  FlowNode,
  FlowEdgeParameters,
  FlowEdge,
} from 'three-flow';
import { TroikaFlowLabel } from './troika-label';


type DocumentShapeType = 'circle' | 'square'
interface DocumentShapeParameters extends FlowNodeParameters {
  shape?: DocumentShapeType
}

const hidden = true

const nodes: Array<DocumentShapeParameters> = [
  {
    id: 'core', x: -1, y: -0.5, z: -0.01, color: 'lightsteelblue',
    width: 3.5, height: 4.5,
    label: { text: 'Core Library', material: { color: 'black' }, size: 0.15 },
    labeltransform: { translate: { y: -0.1 } },
    labelanchor: 'top', connectors: []
  },
  {
    id: 'optional', x: 0.25, y: 1, z: -0.02, color: '#ccc',
    width: 10, height: 4.5,
    label: { text: 'Optional Extensions', material: { color: 'black' }, size: 0.15 },
    labeltransform: { translate: { x: -1, y: -0.1 } },
    labelanchor: 'top', connectors: []
  },
  {
    id: 'diagram', x: -2, y: 1, color: '#222',
    label: { text: 'Flow Diagram', material: { color: 'white' }, },
    connectors: [
      { id: 'c1diagram', anchor: 'right', material: { color: 'white' }, hidden },
      { id: 'c3diagram', anchor: 'bottom', material: { color: 'white' }, hidden },
      { id: 'c4diagram', anchor: 'left', material: { color: 'black' }, hidden },
    ],
  },
  {
    id: 'node', x: 0, y: 1, color: 'steelblue',
    label: { text: 'Flow Node\nFlow Route', },
    connectors: [
      { id: 'c1node', anchor: 'left', material: { color: 'white' }, hidden },
      { id: 'c2node', anchor: 'right', material: { color: 'white' }, hidden },
      { id: 'c3node', anchor: 'right', index: 1, hidden },
      { id: 'c4node', anchor: 'right', index: 2, hidden, material: { color: 'darkgreen' } },
    ],
  },
  {
    id: 'edge', x: 0, y: -0.5, color: 'lime',
    label: { text: 'Flow Edge', },
    connectors: [
      { id: 'c1edge', anchor: 'left', material: { color: 'white' }, hidden },
      { id: 'c2edge', anchor: 'right', material: { color: 'white' }, hidden },
      { id: 'c3edge', anchor: 'right', index: 1, hidden, material: { color: 'darkblue' } },
      { id: 'c4edge', anchor: 'right', index: 2, hidden, material: { color: 'darkgreen' } },
    ],
  },
  {
    id: 'label', x: 0, y: -2, color: '#fd5c63',
    label: { text: 'Flow Label', material: { color: 'white' }, },
    connectors: [
      { id: 'c1label', anchor: 'left', material: { color: 'white' }, hidden },
    ],
  },
  {
    id: 'material', x: -2, y: -0.5, color: '#555', shape: 'circle',
    label: { text: 'Three Material Theme', material: { color: 'white' }, wrapwidth: 0.7, textalign: 'center' },
    connectors: [
      { id: 'c1material', anchor: 'top', material: { color: 'white' }, hidden },
    ],
  },
  {
    id: 'connectors', x: 1.5, y: 2.5, color: 'green',
    label: { text: 'Connectors', material: { color: 'white' }, },
    connectors: [
      { id: 'c1connectors', anchor: 'bottom', material: { color: 'darkgreen' }, hidden },
    ],
  },
  {
    id: 'interaction', x: 3, y: 2.5, color: 'blue',
    label: { text: 'Interactive', material: { color: 'white' }, },
    connectors: [
      { id: 'c1interaction', anchor: 'bottom', material: { color: 'darkblue' }, hidden },
      { id: 'c2interaction', anchor: 'right', material: { color: 'white' }, hidden },
    ],
  },
  {
    id: 'dragnode', x: 4.5, y: 2.5, color: '#555', shape: 'circle',
    label: { text: 'Drag Node', material: { color: 'white' }, },
    connectors: [
      { id: 'c1dragnode', anchor: 'left', material: { color: 'white' }, hidden },
    ],
  },
  {
    id: 'resizenode', x: 4.5, y: 1.25, color: '#555', shape: 'circle',
    label: { text: 'Resize Node', material: { color: 'white' }, },
    connectors: [
      { id: 'c1resizenode', anchor: 'left', material: { color: 'white' }, hidden },
    ],
  },
  {
    id: 'scalenode', x: 4.5, y: 0, color: '#555', shape: 'circle',
    label: { text: 'Scale Node', material: { color: 'white' }, },
    connectors: [
      { id: 'c1scalenode', anchor: 'left', material: { color: 'white' }, hidden },
    ],
  },
  {
    id: 'layout', x: -4, y: 2.5, color: '#555',
    label: { text: 'Layout', material: { color: 'white' }, },
    connectors: [
      { id: 'c1layout', anchor: 'right', material: { color: 'black' }, hidden },
    ],
  },
]

const edges: Array<FlowEdgeParameters> = [
  { from: 'diagram', to: 'node', fromconnector: 'c1diagram', toconnector: 'c1node' },
  { from: 'diagram', to: 'edge', fromconnector: 'c1diagram', toconnector: 'c1edge', },
  { from: 'diagram', to: 'label', fromconnector: 'c1diagram', toconnector: 'c1label', },
  { from: 'diagram', to: 'material', fromconnector: 'c3diagram', toconnector: 'c1material', },
  { from: 'connectors', to: 'node', fromconnector: 'c1connectors', toconnector: 'c4node', color: 'darkgreen' },
  { from: 'connectors', to: 'edge', fromconnector: 'c1connectors', toconnector: 'c4edge', color: 'darkgreen' },
  { from: 'interaction', to: 'node', fromconnector: 'c1interaction', toconnector: 'c3node', color: 'darkblue' },
  { from: 'interaction', to: 'edge', fromconnector: 'c1interaction', toconnector: 'c3edge', color: 'darkblue' },
  { from: 'interaction', to: 'dragnode', fromconnector: 'c2interaction', toconnector: 'c1dragnode', },
  { from: 'interaction', to: 'resizenode', fromconnector: 'c2interaction', toconnector: 'c1resizenode', },
  { from: 'interaction', to: 'scalenode', fromconnector: 'c2interaction', toconnector: 'c1scalenode', },
  { from: 'layout', to: 'diagram', fromconnector: 'c1layout', toconnector: 'c4diagram', color: 'black' },
]



export class DocumentationExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.x = 0
    app.camera.position.y = 0.25
    app.camera.position.z = 4

    scene.background = new Color(0x888888)

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


    const flow = new FlowDiagram({ linestyle: 'split' })
    scene.add(flow);

    const circle = new CircleGeometry(0.5)

    flow.createLabel = (label: FlowLabelParameters) => { return new TroikaFlowLabel(flow, label) }

    flow.createNode = (parameters: DocumentShapeParameters): FlowNode => {
      const node = new FlowNode(flow, parameters)
      node.createGeometry = (parameters: DocumentShapeParameters): BufferGeometry => {
        if (parameters.shape == 'circle') return circle
        return new PlaneGeometry(parameters.width, parameters.height)
      }
      return node
    }

    flow.createEdge = (parameters: FlowEdgeParameters): FlowEdge => {
      const edge = new FlowEdge(flow, parameters)

      edge.createGeometry = (curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined => {
        const curve = new CurvePath<Vector3>()
        for (let i = 0; i < curvepoints.length - 1; i++) {
          curve.add(new LineCurve3(curvepoints[i], curvepoints[i + 1]))
        }
        return new TubeGeometry(curve, 64, thickness * 1.5)
      }

      return edge
    }

    new FlowConnectors(flow)

    flow.load({ nodes, edges })


    this.dispose = () => {
      orbit.dispose()
    }

  }
}
