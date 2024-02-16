import { AmbientLight, AxesHelper, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { ConnectorMesh, FlowConnectorParameters, FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowEdgeParameters, FlowEventType, FlowInteraction, FlowLabel, FlowNode, FlowNodeParameters, FlowPointerEventType, FlowPointerLayers, NodeConnectors } from "three-flow";
import { CommunicationDevice, CommunicationNetwork, SCADAData, SCADASystem } from "./scada-model";
import { DagreLayout } from "./dagre-layout";
import { AcmeGas } from "./scada-gas-production";
import { connect } from "rxjs";

export class SCADAExample {

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

    const disableRotate = () => { orbit.enableRotate = false }
    const enableRotate = () => { orbit.enableRotate = true }
    app.interactive.addEventListener(FlowPointerEventType.DRAGSTART, disableRotate)
    app.interactive.addEventListener(FlowPointerEventType.DRAGEND, enableRotate)

    //scene.add(new AxesHelper(3))
    const options: FlowDiagramOptions = {
      layout: new DagreLayout(),
      layoutoptions: { rankdir: 'TB', nodesep: 0.1, edgesep: 1, ranksep: 0.5 },
    }

    const flow = new FlowDiagram(options)
    scene.add(flow);

    const interaction = new FlowInteraction(flow, app.pointer)

    const connectors = new FlowConnectors(flow)
    connectors.createConnector = (nodeconnectors: NodeConnectors, parameters: FlowConnectorParameters): ConnectorMesh => {
      return new SCADAConnectorMesh(nodeconnectors, parameters)
    }

    flow.createNode = (parameters: SCADANodeParameters): FlowNode => {
      switch (parameters.scadatype) {
        case 'system':
          return new SCADASystemNode(flow, parameters)

        //case 'securitygroup':
        //  return new SCADASecurityGroupNode(flow, parameters)

        //case 'operator':
        //  return new SCADAOperatorNode(flow, parameters)

        case 'network':
          return new SCADANetworkNode(flow, parameters)

        //case 'resource':
        //  return new SCADAResourceNode(flow, parameters)

        case 'device':
          return new SCADADeviceNode(flow, parameters)

        //case 'zone':
        //  return new SCADAZoneNode(flow, parameters)

        default:
          return new FlowNode(flow, parameters)
      }
    }

    const scada = AcmeGas

    //const systemconnectors: Array<FlowConnectorParameters> = [
    //  { id: 'system-network', anchor: 'bottom', index: 1, },
    //]
    flow.addNode(<SCADANodeParameters>{
      scadatype: 'system', data: scada, icon: 'dns'
    })

    requestAnimationFrame(() => {
      flow.layout(false)
    })

    this.dispose = () => {
      interaction.dispose()
      orbit.dispose()
    }
  }
}

class SCADAConnectorMesh extends ConnectorMesh {
  constructor(nodeconnectors: NodeConnectors, parameters: FlowConnectorParameters) {
    parameters.radius = 0.04
    if (parameters.anchor == 'bottom') parameters.material = { color: 'gray' }
    parameters.draggable = false
    parameters.selectable = true

    super(nodeconnectors, parameters)

    if (this.anchor == 'bottom') {

      const diagram = nodeconnectors.flowconnectors.diagram

      const icon = new FlowLabel(diagram, { isicon: true, material: { color: 'white' } })
      icon.text = 'add'
      this.add(icon)
      icon.position.z = 0.001


      const node = nodeconnectors.node
      this.addEventListener(FlowPointerEventType.CLICK, () => {
        if (icon.text == 'add') {
          node.dispatchEvent<any>({ type: NodeEventType.COLLAPSE })
          icon.text = 'remove'
        }
        else {
          node.dispatchEvent<any>({ type: NodeEventType.EXPAND })
          icon.text = 'add'
        }
      })
    }
  }

}


type SCADANodeType = 'system' | 'network' | 'device'
interface SCADANodeParameters extends FlowNodeParameters {
  scadatype: SCADANodeType
  data: SCADAData
  icon: string
  iconcolor?: string
}

enum NodeEventType {
  EXPAND = 'expand',
  COLLAPSE = 'collapse'
}

class SCADANode extends FlowNode {
  childnodes: Array<FlowNode> = []
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    parameters.label = { text: parameters.data.name }
    if (!parameters.iconcolor) parameters.iconcolor = 'black'
    parameters.resizable = parameters.scalable = false

    super(diagram, parameters)

    const icon = new FlowLabel(diagram, { isicon: true, material: { color: parameters.iconcolor } })
    icon.text = parameters.icon
    this.add(icon)
    icon.position.set(-this.width / 2 + 0.1, this.height / 2, 0.001)

    let hidden = false
    this.addEventListener(NodeEventType.EXPAND, () => {
      this.childnodes.forEach(node => node.hidden = false)
      hidden = false
    })

    this.addEventListener(NodeEventType.COLLAPSE, () => {
      this.childnodes.forEach(node => node.hidden = true)
      hidden = true
    })

    this.addEventListener(FlowEventType.HIDDEN_CHANGED, () => {
      if (hidden) return
      this.childnodes.forEach(node => node.hidden = this.hidden)
    })
  }
}

class SCADASystemNode extends SCADANode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    parameters.height = 0.2

    const systemconnectors: Array<FlowConnectorParameters> = [
      { id: 'system-network', anchor: 'bottom' }
    ]
    parameters.connectors = systemconnectors

    super(diagram, parameters);

    const system = parameters.data as SCADASystem

    system.networks.forEach(item => {
      const networkparams: SCADANodeParameters = {
        scadatype: 'network', data: item, icon: 'lan', 
      }
      const network = diagram.addNode(networkparams)
      this.childnodes.push(network)

      const connectors = networkparams.connectors!

      const edgeparams: FlowEdgeParameters = {
        from: this.name, to: network.name,
        fromconnector: systemconnectors[0].id, toconnector: connectors[0].id
      }

      // allow construtor to finish before adding edge
      requestAnimationFrame(() => {
        diagram.addEdge(edgeparams)
      })
    })
  }
}
class SCADANetworkNode extends SCADANode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    parameters.height = 0.2
    const networkconnectors: Array<FlowConnectorParameters> = [
      { id: 'system-network', anchor: 'top' },
      { id: 'network-device', anchor: 'bottom' },
    ]
    parameters.connectors = networkconnectors

    super(diagram, parameters);

    const network = parameters.data as CommunicationNetwork

    network.devices.forEach(item => {
      const deviceparams: SCADANodeParameters = {
        scadatype: 'device', data: item, icon: 'sim_card', 
      }
      const device = diagram.addNode(deviceparams)
      this.childnodes.push(device)

      const deviceconnectors = deviceparams.connectors!

      const edgeparams: FlowEdgeParameters = {
        from: this.name, to: device.name,
        fromconnector: networkconnectors[1].id, toconnector: deviceconnectors[0].id
      }

      // allow construtor to finish before adding edge
      requestAnimationFrame(() => {
        diagram.addEdge(edgeparams)
      })
    })
  }
}

class SCADADeviceNode extends SCADANode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    parameters.height = 0.2
    const deviceconnectors: Array<FlowConnectorParameters> = [
      { id: 'network-device', anchor: 'top' },
      { id: 'device-analogs', anchor: 'bottom' },
    ]
    parameters.connectors = deviceconnectors

    super(diagram, parameters);

  }
}
