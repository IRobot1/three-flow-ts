import { AmbientLight, BufferGeometry, CatmullRomCurve3, Color, PointLight, Scene, TubeGeometry, Vector3 } from "three";
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

  //override createEdge(edge: FlowEdgeParameters): FlowEdge {
  //  if (edge.linestyle == 'split')
  //    return super.createEdge(edge)
  //  return new EdgeStyle(this, edge)
  //}
}

class EdgeStyle extends FlowEdge {

  override createGeometry(curvepoints: Array<Vector3>, thickness: number): BufferGeometry | undefined {
    const curve = new CatmullRomCurve3(curvepoints);
    return new TubeGeometry(curve, curvepoints.length, 0.05)
  }
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
    timers.push(this.addLineAcross(flow, 'straight', 'cornflowerblue', -9, 3))
    timers.push(this.addLineAcross(flow, 'offset', 'blue', -3, 3))
    timers.push(this.addLineAcross(flow, 'spline', 'green', 3, 3))
    timers.push(this.addLineAcross(flow, 'split', 'red', 9, 3))

    timers.push(this.addLineDiagonal(flow, 'straight', 'cornflowerblue', -9, -3))
    timers.push(this.addLineDiagonal(flow, 'offset', 'cornflowerblue', -3, -3))
    timers.push(this.addLineDiagonal(flow, 'spline', 'cornflowerblue', 3, -3))
    timers.push(this.addLineDiagonal(flow, 'split', 'cornflowerblue', 9, -3))

    this.dispose = () => {
      timers.forEach(timer => clearInterval(timer))
      orbit.dispose()
    }

  }

  private addLineDiagonal(flow: FlowDiagram, linestyle: EdgeLineStyle, color: string, x = 0, y = 0): any {
    const hidden = true

    const centerconnector = linestyle + 'center1'
    const center = flow.addNode({
      text: centerconnector, x, y, color,
      label: {
        text: linestyle, color: 'white', size: 0.25
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
      text: linestyle + 'nw', x: x - 2, y: y + 2, color,
      connectors: [
        { id: 'c1' + nwid, anchor: 'right', hidden },
        { id: 'c2' + nwid, anchor: 'bottom', hidden },
      ]
    })

    const neid = linestyle + 'ne'
    const ne = flow.addNode({
      text: linestyle + 'ne', x: x+2, y: y +2, color,
      connectors: [
        { id: 'c1' + neid, anchor: 'left', hidden },
        { id: 'c2' + neid, anchor: 'bottom', hidden },
      ]
    })

    const swid =  linestyle + 'sw'
    const sw = flow.addNode({
      text: linestyle + 'sw', x: x - 2, y:y-2, color,
      connectors: [
        { id: 'c1' + swid, anchor: 'right', hidden },
        { id: 'c2' + swid, anchor: 'top', hidden },
      ]
    })

    const seid = linestyle + 'se'
    const se = flow.addNode({
      text: linestyle + 'se', x: x + 2, y:y-2, color,
      connectors: [
        { id: 'c1' + seid, anchor: 'left', hidden },
        { id: 'c2' + seid, anchor: 'top', hidden },
      ]
    })

    flow.addEdge({ v: nw.name, w: center.name, linestyle, fromconnector: 'c1'+nwid, toconnector: 'c2' + centerconnector })
    flow.addEdge({ v: ne.name, w: center.name, linestyle, fromconnector: 'c1' + neid, toconnector: 'c2' + centerconnector })
    flow.addEdge({ v: sw.name, w: center.name, linestyle, fromconnector: 'c1' + swid, toconnector: 'c4' + centerconnector })
    flow.addEdge({ v: se.name, w: center.name, linestyle, fromconnector: 'c1' + seid, toconnector: 'c4' + centerconnector })

    flow.addEdge({ v: nw.name, w: center.name, linestyle, fromconnector: 'c2' + nwid, toconnector: 'c1' + centerconnector })
    flow.addEdge({ v: ne.name, w: center.name, linestyle, fromconnector: 'c2' + neid, toconnector: 'c3' + centerconnector })
    flow.addEdge({ v: sw.name, w: center.name, linestyle, fromconnector: 'c2' + swid, toconnector: 'c1' + centerconnector })
    flow.addEdge({ v: se.name, w: center.name, linestyle, fromconnector: 'c2' + seid, toconnector: 'c3' + centerconnector })

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
      text: centerconnector, x, y, color,
      label: {
        text: linestyle, color: 'white', size: 0.25
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
      text: linestyle + 'top', x, y: y + 2, color,
      connectors: [
        { id: topconnectorid, anchor: 'bottom', hidden },
      ]
    })

    const bottomconnectorid = 'c1' + linestyle + 'bottom'
    const bottom = flow.addNode({
      text: linestyle + 'bottom', x, y: y - 2, color,
      connectors: [
        { id: bottomconnectorid, anchor: 'top', hidden },
      ]
    })

    const leftconnectorid = 'c1' + linestyle + 'left'
    const left = flow.addNode({
      text: linestyle + 'left', x: x - 2, y, color,
      connectors: [
        { id: leftconnectorid, anchor: 'right', hidden },
      ]
    })

    const rightconnectorid = 'c1' + linestyle + 'right'
    const right = flow.addNode({
      text: linestyle + 'right', x: x + 2, y, color,
      connectors: [
        { id: rightconnectorid, anchor: 'left', hidden },
      ]
    })

    flow.addEdge({ v: left.name, w: center.name, linestyle, fromconnector: leftconnectorid, toconnector: 'c1' + centerconnector })
    flow.addEdge({ v: top.name, w: center.name, linestyle, fromconnector: topconnectorid, toconnector: 'c2' + centerconnector })
    flow.addEdge({ v: right.name, w: center.name, linestyle, fromconnector: rightconnectorid, toconnector: 'c3' + centerconnector })
    flow.addEdge({ v: bottom.name, w: center.name, linestyle, fromconnector: bottomconnectorid, toconnector: 'c4' + centerconnector })

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
