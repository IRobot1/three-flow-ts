import { AmbientLight, Color, MaterialParameters, MathUtils, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, PlaneGeometry, PointLight, RingGeometry, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowNodeParameters,
  FlowDiagram,
  FlowInteraction,
  FlowNode,
  FlowLabelParameters,
} from "three-flow";
import { TroikaFlowLabel } from "./troika-label";

type KPIIndicatorType = 'higher is better' | 'lower is better'

interface KPIRange {
  min: number
  max: number
  material: MaterialParameters
}

interface KPIParameters extends FlowNodeParameters {
  value: number
  ranges: Array<KPIRange> // ordered from lowest to highest - min of the first range is min value, max of the last range is max value

  indicator?: KPIIndicatorType // default is higher is better
  units?: string
  highthreshold?: number
  lowthreshold?: number // default is zero
  lastvalue?: number //different than current value
}

export class KPIExample {

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


    // read-only flow
    const flow = new FlowDiagram()
    scene.add(flow);
    flow.createLabel = (label: FlowLabelParameters) => { return new TroikaFlowLabel(flow, label) }
    flow.createNode = (node: KPIParameters) => { return new KPINode(flow, node) }

    // make the flow interactive
    //const interaction = new FlowInteraction(flow, app, app.camera)

    const kpi1 = <KPIParameters>{
      x: 0, y: 0, label: { text: 'Oil Wells' }, labelanchor: 'top', labeltransform: { translate: { y: -0.1 } },
      value: 15857, units: 'bbl', lowthreshold: 5000, highthreshold: 26000,
      ranges: [
        { min: 0, max: 10000, material: <MeshBasicMaterialParameters>{ color: 'yellow' } },
        { min: 10000, max: 25000, material: <MeshBasicMaterialParameters>{ color: 'green' } },
        { min: 25000, max: 30000, material: <MeshBasicMaterialParameters>{ color: 'red' } },
      ]
    }
    flow.addNode(kpi1)

    this.dispose = () => {
      //interaction.dispose()
      orbit.dispose()
    }

  }
}

interface ChartParameters {
  length: number
  material: MaterialParameters
}

interface RingChartParameters extends ChartParameters {
  innerRadius: number
  outerRadius: number
}

interface RingMarkerParameters {
  width?: number // default is 0.1
  height?: number // default is 0.02
  material: MaterialParameters

  offset: number // offset from center
  position: number // angle in radians or distance along length
}

class RingChart extends Mesh {
  constructor(public parameters: RingChartParameters) {
    super()

    const updateChart = (geometry: boolean, material: boolean) => {
      if (geometry) {
        this.geometry = new RingGeometry(parameters.innerRadius, parameters.outerRadius, 32, 1, 0, parameters.length)
        // rotate so ring starts at 9 o'clock instead of 3 o'clock
        this.geometry.rotateZ(Math.PI - parameters.length)
      }
      if (material)
        this.material = new MeshBasicMaterial(parameters.material)
    }

    this.addEventListener('update', (e: any) => { updateChart(e.geometry, e.material) })
    updateChart(true, true)
  }
}

class RingMarker extends Object3D {
  constructor(public parameters: RingMarkerParameters) {
    super()

    if (parameters.width == undefined) parameters.width = 0.1
    if (parameters.height == undefined) parameters.height = 0.02

    const tick = new Mesh()
    tick.geometry = new PlaneGeometry(parameters.width, parameters.height)
    tick.material = new MeshBasicMaterial(parameters.material)
    this.add(tick)

    const updateTick = () => {
      this.rotation.z = parameters.position
      tick.position.x = parameters.offset
    }

    this.addEventListener('update', (e: any) => {
      if (e.material)
        tick.material = new MeshBasicMaterial(parameters.material)

      if (e.geometry)
        tick.geometry = new PlaneGeometry(parameters.width, parameters.height)

      if (e.position)
        updateTick()
    })
    updateTick()
  }
}

class KPINode extends FlowNode {
  constructor(diagram: FlowDiagram, node: KPIParameters) {
    super(diagram, node)

    //value: 15857, units: 'bbl', highthreshold: 30000,
    //  ranges: [
    //    { min: 0, max: 32000, material: <MeshBasicMaterialParameters>{ color: 'red' } }
    //  ]

    const value = diagram.createLabel({ text: `${node.value} ${node.units}`, alignY: 'bottom' })
    value.updateLabel()
    this.add(value)
    value.position.set(0, -0.1, 0.001)

    const max = node.ranges[node.ranges.length - 1].max

    const baseRing = new RingChart({
      length: Math.PI, material: <MeshBasicMaterialParameters>{ color: '#eee' },
      innerRadius: 0.37, outerRadius: 0.4
    })
    this.add(baseRing)
    baseRing.position.set(0, -0.1, 0.001)

    let length = MathUtils.mapLinear(node.value, 0, max, 0, Math.PI)

    let ringMaterial = this.getRangeMaterial(node.value, node.ranges)

    const valueRing = new RingChart({
      length, material: ringMaterial,
      innerRadius: 0.35, outerRadius: 0.42
    })
    this.add(valueRing)
    valueRing.position.set(0, -0.1, 0.002)

    if (node.lowthreshold) {
      const offset = (valueRing.parameters.outerRadius + valueRing.parameters.innerRadius) / 2
      let lowthreshold = MathUtils.mapLinear(node.lowthreshold, 0, max, Math.PI, 0)
      const tick = new RingMarker({
        material: <MeshBasicMaterialParameters>{ color: 'black' },
        offset, position: lowthreshold
      })
      this.add(tick)
      tick.position.set(0, -0.1, 0.003)
    }
    if (node.highthreshold) {
      const offset = (valueRing.parameters.outerRadius + valueRing.parameters.innerRadius) / 2
      let highthreshold = MathUtils.mapLinear(node.highthreshold, 0, max, Math.PI, 0)
      const tick = new RingMarker({
        material: <MeshBasicMaterialParameters>{ color: 'black' },
        offset, position: highthreshold
      })
      this.add(tick)
      tick.position.set(0, -0.1, 0.003)

      //let change = 0.1
      //setInterval(() => {
      //  if (highthreshold > Math.PI || highthreshold < 0)
      //    change = -change

      //  highthreshold += change
      //  tick.parameters.position = highthreshold
      //  tick.dispatchEvent<any>({ type: 'update', position: true })
      //}, 1000 / 30)
    }

  //  let change = 250
  //  let newvalue = node.value
  //  let lastcolor = ringMaterial.color
  //  setInterval(() => {
  //    if (newvalue > max || newvalue < 0)
  //      change = -change

  //    newvalue += change

  //    let material = false
  //    ringMaterial = this.getRangeMaterial(MathUtils.clamp(newvalue, 0, max), node.ranges)
  //    if (ringMaterial.color != lastcolor) {
  //      valueRing.parameters.material = ringMaterial
  //      material = true
  //      lastcolor = ringMaterial.color
  //    }

  //    valueRing.parameters.length = MathUtils.mapLinear(newvalue, 0, max, 0, Math.PI)
  //    valueRing.dispatchEvent<any>({ type: 'update', geometry: true, material })
  //  }, 1000 / 30)
  }

  getRangeMaterial(value: number, ranges: Array<KPIRange>): MeshBasicMaterialParameters {
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i]
      if (value > range.min && value <= range.max) {
        return range.material
      }
    }
    return { color: 'black' }

  }
}

