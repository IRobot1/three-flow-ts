import { AmbientLight, BufferGeometry, Color, CurvePath, LineCurve3, PointLight, Scene, TubeGeometry, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import {
  EdgeLineStyle,
  FlowConnectors,
  FlowDiagram, FlowEdge, FlowEdgeParameters, FlowEventType, FlowLabel, FlowLabelParameters,
} from "three-flow";
import { TroikaFlowLabel } from "./troika-label";

class EdgeStylesFlowDiagram extends FlowDiagram {
  override createLabel(label: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, label)
  }

  override createEdge(edge: FlowEdgeParameters): FlowEdge {
    return new EdgeStyle(this, edge)
  }
}

class EdgeStyle extends FlowEdge {

  //  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
  //    const curve = new CurvePath<Vector3>()
  //    for (let i = 0; i < curvepoints.length - 1; i++) {
  //      curve.add(new LineCurve3(curvepoints[i], curvepoints[i + 1]))
  //    }
  //    return new TubeGeometry(curve, 64, 0.05)
  //  }
}


export class EdgeStylesExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 12

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

    // TODO: option for global edge style
    const flow = new EdgeStylesFlowDiagram();
    scene.add(flow)

    const connectors = new FlowConnectors(flow)

    const timers: Array<any> = []
    const row1 = 6
    timers.push(this.addLineAcross(flow, 'straight', 'cornflowerblue', -9, row1))
    timers.push(this.addLineAcross(flow, 'step', 'blue', -3, row1))
    timers.push(this.addLineAcross(flow, 'spline', 'green', 3, row1))
    //timers.push(this.addLineAcross(flow, 'split', 'red', 9, row1))

    const row2 = 0
    timers.push(this.addLineDiagonal1(flow, 'straight', 'cornflowerblue', -9, row2))
    timers.push(this.addLineDiagonal1(flow, 'step', 'blue', -3, row2))
    timers.push(this.addLineDiagonal1(flow, 'spline', 'green', 3, row2))
    //timers.push(this.addLineDiagonal1(flow, 'split', 'red', 9, row2))

    const row3 = -6
    timers.push(this.addLineDiagonal2(flow, 'step', 'blue', -3, row3))
    timers.push(this.addLineDiagonal2(flow, 'spline', 'green', 3, row3))

    this.dispose = () => {
      timers.forEach(timer => clearInterval(timer))
      orbit.dispose()
    }

  }

  private addLineDiagonal1(flow: FlowDiagram, linestyle: EdgeLineStyle, color: string, x = 0, y = 0): any {
    const hidden = true

    const centerconnector = linestyle + 'center1'
    const center = flow.addNode({
      id: centerconnector, x, y, material: {color},
      label: {
        text: linestyle, material: { color: 'white' }, size: 0.25
      },
      connectors: [
        { id: 'c1' + centerconnector, anchor: 'left', hidden },
        { id: 'c2' + centerconnector, anchor: 'top', hidden },
        { id: 'c3' + centerconnector, anchor: 'right', hidden },
        { id: 'c4' + centerconnector, anchor: 'bottom', hidden },
      ]
    })

    const nwid = linestyle + 'nw'
    const nw = flow.addNode({
      id: nwid, x: x - 2, y: y + 2, material: {color},
      connectors: [
        { id: 'c1' + nwid, anchor: 'right', hidden },
        { id: 'c2' + nwid, anchor: 'bottom', hidden },
      ]
    })

    const neid = linestyle + 'ne'
    const ne = flow.addNode({
      id: neid, x: x + 2, y: y + 2, material: { color },
      connectors: [
        { id: 'c1' + neid, anchor: 'left', hidden },
        { id: 'c2' + neid, anchor: 'bottom', hidden },
      ]
    })

    const swid = linestyle + 'sw'
    const sw = flow.addNode({
      id: swid, x: x - 2, y: y - 2, material: { color },
      connectors: [
        { id: 'c1' + swid, anchor: 'right', hidden },
        { id: 'c2' + swid, anchor: 'top', hidden },
      ]
    })

    const seid = linestyle + 'se'
    const se = flow.addNode({
      id: seid, x: x + 2, y: y - 2, material: { color },
      connectors: [
        { id: 'c1' + seid, anchor: 'left', hidden },
        { id: 'c2' + seid, anchor: 'top', hidden },
      ]
    })

    flow.addEdge({ from: nw.name, to: center.name, linestyle, fromconnector: 'c1' + nwid, toconnector: 'c2' + centerconnector })
    flow.addEdge({ from: ne.name, to: center.name, linestyle, fromconnector: 'c1' + neid, toconnector: 'c2' + centerconnector })
    flow.addEdge({ from: sw.name, to: center.name, linestyle, fromconnector: 'c1' + swid, toconnector: 'c4' + centerconnector })
    flow.addEdge({ from: se.name, to: center.name, linestyle, fromconnector: 'c1' + seid, toconnector: 'c4' + centerconnector })

    flow.addEdge({ from: nw.name, to: center.name, linestyle, fromconnector: 'c2' + nwid, toconnector: 'c1' + centerconnector })
    flow.addEdge({ from: ne.name, to: center.name, linestyle, fromconnector: 'c2' + neid, toconnector: 'c3' + centerconnector })
    flow.addEdge({ from: sw.name, to: center.name, linestyle, fromconnector: 'c2' + swid, toconnector: 'c1' + centerconnector })
    flow.addEdge({ from: se.name, to: center.name, linestyle, fromconnector: 'c2' + seid, toconnector: 'c3' + centerconnector })

    const position = center.position.clone()
    let angle = 0
    const timer = setInterval(() => {
      let x = Math.sin(angle) * 0.25
      let y = Math.cos(angle) * 0.25
      angle += 0.03
      center.position.set(position.x + x, position.y + y, position.z)

      // force edges to redraw
      center.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
    }, 1000 / 30)
    return timer
  }

  private addLineAcross(flow: FlowDiagram, linestyle: EdgeLineStyle, color: string, x = 0, y = 0): any {
    const hidden = true

    const centerconnector = linestyle + 'center'
    const center = flow.addNode({
      id: centerconnector, x, y, material: { color },
      label: {
        text: linestyle, material: { color: 'white' }, size: 0.25
      },
      connectors: [
        { id: 'c1' + centerconnector, anchor: 'left', hidden },
        { id: 'c2' + centerconnector, anchor: 'top', hidden },
        { id: 'c3' + centerconnector, anchor: 'right', hidden },
        { id: 'c4' + centerconnector, anchor: 'bottom', hidden },
      ]
    })

    const topconnectorid = 'c1' + linestyle + 'top'
    const top = flow.addNode({
      id: linestyle + 'top', x, y: y + 2, material: { color },
      connectors: [
        { id: topconnectorid, anchor: 'bottom', hidden },
      ]
    })

    const bottomconnectorid = 'c1' + linestyle + 'bottom'
    const bottom = flow.addNode({
      id: linestyle + 'bottom', x, y: y - 2, material: { color },
      connectors: [
        { id: bottomconnectorid, anchor: 'top', hidden },
      ]
    })

    const leftconnectorid = 'c1' + linestyle + 'left'
    const left = flow.addNode({
      id: linestyle + 'left', x: x - 2, y, material: { color },
      connectors: [
        { id: leftconnectorid, anchor: 'right', hidden },
      ]
    })

    const rightconnectorid = 'c1' + linestyle + 'right'
    const right = flow.addNode({
      id: linestyle + 'right', x: x + 2, y, material: { color },
      connectors: [
        { id: rightconnectorid, anchor: 'left', hidden },
      ]
    })

    flow.addEdge({ from: left.name, to: center.name, linestyle, fromconnector: leftconnectorid, toconnector: 'c1' + centerconnector })
    flow.addEdge({ from: top.name, to: center.name, linestyle, fromconnector: topconnectorid, toconnector: 'c2' + centerconnector })
    flow.addEdge({ from: right.name, to: center.name, linestyle, fromconnector: rightconnectorid, toconnector: 'c3' + centerconnector })
    flow.addEdge({ from: bottom.name, to: center.name, linestyle, fromconnector: bottomconnectorid, toconnector: 'c4' + centerconnector })

    const position = center.position.clone()
    let angle = 0
    const timer = setInterval(() => {
      let x = Math.sin(angle) * 0.25
      let y = Math.cos(angle) * 0.25
      angle += 0.03
      center.position.set(position.x + x, position.y + y, position.z)

      // force edges to redraw
      center.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
    }, 1000 / 30)
    return timer
  }

  private addLineDiagonal2(flow: FlowDiagram, linestyle: EdgeLineStyle, color: string, x = 0, y = 0): any {
    const hidden = true

    const centerconnector = linestyle + 'center2'
    const center = flow.addNode({
      id: centerconnector, x, y, material: { color },
      label: {
        text: linestyle, material: { color: 'white' }, size: 0.25
      },
      connectors: [
        { id: 'c1' + centerconnector, anchor: 'left', hidden },
        { id: 'c2' + centerconnector, anchor: 'top', hidden },
        { id: 'c3' + centerconnector, anchor: 'right', hidden },
        { id: 'c4' + centerconnector, anchor: 'bottom', hidden },
      ]
    })

    const nwid = linestyle + 'nw2'
    const nw = flow.addNode({
      id: nwid, x: x - 2, y: y + 2, material: { color },
      connectors: [
        { id: 'c1' + nwid, anchor: 'right', hidden },
        { id: 'c2' + nwid, anchor: 'bottom', hidden },
      ]
    })

    const neid = linestyle + 'ne2'
    const ne = flow.addNode({
      id: neid, x: x + 2, y: y + 2, material: { color },
      connectors: [
        { id: 'c1' + neid, anchor: 'left', hidden },
        { id: 'c2' + neid, anchor: 'bottom', hidden },
      ]
    })

    const swid = linestyle + 'sw2'
    const sw = flow.addNode({
      id: swid, x: x - 2, y: y - 2, material: { color },
      connectors: [
        { id: 'c1' + swid, anchor: 'right', hidden },
        { id: 'c2' + swid, anchor: 'top', hidden },
      ]
    })

    const seid = linestyle + 'se2'
    const se = flow.addNode({
      id: seid, x: x + 2, y: y - 2, material: { color },
      connectors: [
        { id: 'c1' + seid, anchor: 'left', hidden },
        { id: 'c2' + seid, anchor: 'top', hidden },
      ]
    })

    flow.addEdge({ from: nw.name, to: center.name, linestyle, fromconnector: 'c2' + nwid, toconnector: 'c2' + centerconnector })
    flow.addEdge({ from: ne.name, to: center.name, linestyle, fromconnector: 'c2' + neid, toconnector: 'c2' + centerconnector })
    flow.addEdge({ from: sw.name, to: center.name, linestyle, fromconnector: 'c2' + swid, toconnector: 'c4' + centerconnector })
    flow.addEdge({ from: se.name, to: center.name, linestyle, fromconnector: 'c2' + seid, toconnector: 'c4' + centerconnector })

    flow.addEdge({ from: nw.name, to: center.name, linestyle, fromconnector: 'c1' + nwid, toconnector: 'c1' + centerconnector })
    flow.addEdge({ from: ne.name, to: center.name, linestyle, fromconnector: 'c1' + neid, toconnector: 'c3' + centerconnector })
    flow.addEdge({ from: sw.name, to: center.name, linestyle, fromconnector: 'c1' + swid, toconnector: 'c1' + centerconnector })
    flow.addEdge({ from: se.name, to: center.name, linestyle, fromconnector: 'c1' + seid, toconnector: 'c3' + centerconnector })

    const position = center.position.clone()
    let angle = 0
    const timer = setInterval(() => {
      let x = Math.sin(angle) * 0.25
      let y = Math.cos(angle) * 0.25
      angle += 0.03
      center.position.set(position.x + x, position.y + y, position.z)

      // force edges to redraw
      center.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
    }, 1000 / 30)
    return timer
  }

}
