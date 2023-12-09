import { AmbientLight, Color, Material, MaterialParameters, MathUtils, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, PlaneGeometry, PointLight, RingGeometry, Scene, Shape, ShapeGeometry } from "three";
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

    let value = 15857
    let max = 30000
    const kpi1params = <KPIParameters>{
      x: 0, y: 0, label: { text: 'Oil Wells' }, labelanchor: 'top', labeltransform: { translate: { y: -0.1 } },
      value, units: 'bbl', lowthreshold: 5000, highthreshold: 26000,
      ranges: [
        { min: 0, max: 10000, material: <MeshBasicMaterialParameters>{ color: 'yellow' } },
        { min: 10000, max: 25000, material: <MeshBasicMaterialParameters>{ color: 'green' } },
        { min: 25000, max, material: <MeshBasicMaterialParameters>{ color: 'red' } },
      ]
    }
    const kpi1 = flow.addNode(kpi1params) as KPINode

    let change = 250
    setInterval(() => {
      if (kpi1params.value >= max || kpi1params.value <= 0)
        change = -change

      kpi1params.value = MathUtils.clamp(kpi1params.value + change, 0, max)

      kpi1.update()//dispatchEvent<any>({ type: 'update' })
    }, 1000 / 30)


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

    this.update = () => {
      const shape = new Shape();

      shape.absarc(0, 0, parameters.outerRadius, 0, parameters.length);
      shape.absarc(0, 0, parameters.innerRadius, parameters.length, 0, true);

      this.geometry = new ShapeGeometry(shape);

      // rotate so ring starts at 9 o'clock instead of 3 o'clock
      this.geometry.rotateZ(Math.PI - parameters.length)
    }

    this.addEventListener('update', this.update)
    this.update()
  }

  update: () => void
}

class RingMarker extends Object3D {

  private tick: Mesh
  get material() { return this.tick.material }
  set material(newvalue: Material | Material[]) {
    if (this.tick.material != newvalue) {
      this.tick.material = newvalue
    }
  }

  constructor(public parameters: RingMarkerParameters) {
    super()

    if (parameters.width == undefined) parameters.width = 0.1
    if (parameters.height == undefined) parameters.height = 0.02

    const tick = new Mesh()
    tick.geometry = new PlaneGeometry(parameters.width, parameters.height)
    this.add(tick)
    this.tick = tick

    this.update = () => {
      this.rotation.z = parameters.position
      tick.position.x = parameters.offset
    }

    this.addEventListener('update', this.update)
    this.update()
  }

  update: () => void
}

class KPINode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: KPIParameters) {
    super(diagram, parameters)

    const value = diagram.createLabel({ text: `${parameters.value} ${parameters.units}`, alignY: 'bottom' })
    value.updateLabel()
    this.add(value)
    value.position.set(0, -0.1, 0.001)

    const max = parameters.ranges[parameters.ranges.length - 1].max

    const baseRing = new RingChart({
      length: Math.PI, material: <MeshBasicMaterialParameters>{ color: '#eee' },
      innerRadius: 0.37, outerRadius: 0.4
    })
    this.add(baseRing)

    baseRing.material = diagram.getMaterial('geometry', 'kpi', baseRing.parameters.material)

    baseRing.position.set(0, -0.1, 0.001)

    let lastvalue = MathUtils.clamp(parameters.value, 0, max)
    let radians = MathUtils.mapLinear(lastvalue, 0, max, 0, Math.PI)

    let ringMaterial = this.getRangeMaterial(lastvalue, parameters.ranges)

    const valueRing = new RingChart({
      length: radians, material: ringMaterial,
      innerRadius: 0.35, outerRadius: 0.42
    })
    this.add(valueRing)
    valueRing.position.set(0, -0.1, 0.002)
    valueRing.material = diagram.getMaterial('geometry', 'kpi', valueRing.parameters.material)

    if (parameters.lowthreshold) {
      const offset = (valueRing.parameters.outerRadius + valueRing.parameters.innerRadius) / 2
      let lowthreshold = MathUtils.mapLinear(parameters.lowthreshold, 0, max, Math.PI, 0)
      const tick = new RingMarker({
        material: <MeshBasicMaterialParameters>{ color: 'yellow' },
        offset, position: lowthreshold
      })
      tick.material = diagram.getMaterial('geometry', 'kpi', tick.parameters.material)
      this.add(tick)
      tick.position.set(0, -0.1, 0.003)
    }
    if (parameters.highthreshold) {
      const offset = (valueRing.parameters.outerRadius + valueRing.parameters.innerRadius) / 2
      let highthreshold = MathUtils.mapLinear(parameters.highthreshold, 0, max, Math.PI, 0)
      const tick = new RingMarker({
        material: <MeshBasicMaterialParameters>{ color: 'red' },
        offset, position: highthreshold
      })
      tick.material = diagram.getMaterial('geometry', 'kpi', tick.parameters.material)
      this.add(tick)
      tick.position.set(0, -0.1, 0.003)

      //  let change = 0.05
      //  setInterval(() => {
      //    if (highthreshold >= Math.PI || highthreshold <= 0)
      //      change = -change

      //    highthreshold = MathUtils.clamp(highthreshold + change, 0, Math.PI)
      //    tick.parameters.position = highthreshold
      //    tick.update()//dispatchEvent<any>({ type: 'update' })
      //  }, 1000 / 30)
    }

    this.update = () => {
      if (parameters.value != lastvalue) {
        radians = MathUtils.mapLinear(parameters.value, 0, max, 0, Math.PI)
        valueRing.parameters.length = radians
        valueRing.update()//dispatchEvent<any>({ type: 'update' })

        value.text = `${parameters.value} ${parameters.units}`
        value.updateLabel()

        const newMaterial = this.getRangeMaterial(parameters.value, parameters.ranges)
        if (ringMaterial.color != newMaterial.color) {
          valueRing.material = diagram.getMaterial('geometry', 'kpi', newMaterial)
          ringMaterial = newMaterial
        }

        lastvalue = parameters.value
      }
    }

    this.addEventListener('update', this.update)
  }

  update: () => void

  private getRangeMaterial(value: number, ranges: Array<KPIRange>): MeshBasicMaterialParameters {
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i]
      if (value > range.min && value <= range.max) {
        return range.material
      }
    }
    return { color: 'black' }

  }
}

