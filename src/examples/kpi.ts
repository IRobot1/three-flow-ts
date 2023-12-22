import { AmbientLight, CircleGeometry, Color, MaterialParameters, MathUtils, Mesh, MeshBasicMaterialParameters, PointLight, Scene, Vector2 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import {
  FlowNodeParameters,
  FlowDiagram,
  FlowNode,
  FlowLabelParameters,
} from "three-flow";
import { TroikaFlowLabel } from "./troika-label";
import { ChartGrid, ChartGridParameters, LineChart, LineChartParameters, RingChart, RingMarker } from "./charts";

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
  currency?: string
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
    //const interaction = new FlowInteraction(flow, app.interactive)

    let value = 15857
    let max = 30000
    const kpi1params = <KPIParameters>{
      x: 0, y: 0, label: { text: 'Operating Costs' }, labelanchor: 'top', labeltransform: { translate: { y: -0.1 } },
      value, currency: '$', lowthreshold: 5000, highthreshold: 26000,
      ranges: [
        { min: 0, max: 10000, material: <MeshBasicMaterialParameters>{ color: 'yellow' } },
        { min: 10000, max: 25000, material: <MeshBasicMaterialParameters>{ color: 'green' } },
        { min: 25000, max, material: <MeshBasicMaterialParameters>{ color: 'red' } },
      ]
    }
    const kpi1 = flow.addNode(kpi1params) as KPINode

    //let change = 250
    //setInterval(() => {
    //  if (kpi1params.value >= max || kpi1params.value <= 0)
    //    change = -change

    //  kpi1params.value = MathUtils.clamp(kpi1params.value + change, 0, max)

    //  kpi1.update()//dispatchEvent<any>({ type: 'update' })
    //}, 1000 / 30)

    let i = 0
    const values: Array<Vector2> = []
    while (i < 48)
      values.push(new Vector2(i++, Math.random()))
    kpi1.updateChart(values)

    //setInterval(() => {
    //  if (values.length > 48)
    //    values.shift()
    //  values.push(new Vector2(i, Math.random()))
    //  kpi1.updateChart(values) //dispatchEvent<any>({ type: 'update_values', values })
    //  i++
    //}, 1000 / 10)


    this.dispose = () => {
      //interaction.dispose()
      orbit.dispose()
    }

  }
}


class KPINode extends FlowNode {

  constructor(diagram: FlowDiagram, parameters: KPIParameters) {
    super(diagram, parameters)

    const gridparams: ChartGridParameters = {
      width: this.width - 0.1, height: this.height / 2 - 0.2,
      rows: 5, columns: 10
    }
    const grid = new ChartGrid(gridparams)
    grid.material = diagram.getMaterial('line', 'grid', <MeshBasicMaterialParameters>{ color: 'black' })
    this.add(grid)
    grid.position.set(-this.width / 2 + 0.05, -this.height / 2 + 0.05, 0.001)

    const lineparams: LineChartParameters = {
      width: this.width, height: this.height / 2 - 0.1,
      margin: 0.05, values: [], material: { color: 'black' }
    }

    const markerGeometry = new CircleGeometry(0.01)
    const markerMaterial = diagram.getMaterial('geometry', 'marker', <MeshBasicMaterialParameters>{ color: 'green' })
    const lineChart = new LineChart(lineparams)
    lineChart.adornPoints = (points: Array<Vector2>) => {
      points.forEach(point => {
        const marker = new Mesh(markerGeometry, markerMaterial)
        marker.position.set(point.x, point.y, 0.001)
        lineChart.add(marker)
      })
    }
    const minmaxGeometry = new CircleGeometry(0.02)
    const minMaterial = diagram.getMaterial('geometry', 'marker', <MeshBasicMaterialParameters>{ color: 'blue' })
    lineChart.adornMinPoint = (point: Vector2) => {
      const marker = new Mesh(minmaxGeometry, minMaterial)
      marker.position.set(point.x, point.y, 0.002)
      lineChart.add(marker)
    }

    const maxMaterial = diagram.getMaterial('geometry', 'marker', <MeshBasicMaterialParameters>{ color: 'red' })
    lineChart.adornMaxPoint = (point: Vector2) => {
      const marker = new Mesh(minmaxGeometry, maxMaterial)
      marker.position.set(point.x, point.y, 0.002)
      lineChart.add(marker)
    }

    lineChart.material = diagram.getMaterial('line', 'linechart', lineparams.material)
    this.add(lineChart)
    lineChart.position.set(-this.width / 2, -this.height / 2, 0.001)

    this.updateChart = (values: Array<Vector2>) => {
      lineparams.values = values
      lineChart.update()
    }

    const amount = (): string => {
      if (parameters.currency)
        return `${parameters.currency}${parameters.value}`
      else if (parameters.units)
        return `${parameters.value} ${parameters.units}`

      return parameters.value.toString()
    }
    const value = diagram.createLabel({ text: amount(), alignY: 'bottom' })
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

        value.text = amount()
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
    this.addEventListener('update_values', (e: any) => { this.updateChart(e.values) })
  }

  update: () => void
  updateChart: (values: Array<Vector2>) => void

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

