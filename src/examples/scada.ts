import { AmbientLight, AxesHelper, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { ConnectorMesh, FlowConnectorParameters, FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowInteraction, FlowLabel, FlowNode, FlowNodeParameters, FlowPointerEventType, FlowPointerLayers, NodeConnectors } from "three-flow";
import { CommunicationDevice, CommunicationNetwork, Operator, SCADASystem, SecurityGroup, SystemResource } from "./scada-model";
import { DagreLayout } from "./dagre-layout";
import { AcmeGas } from "./scada-gas-production";

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

        case 'securitygroup':
          return new SCADASecurityGroupNode(flow, parameters)

        case 'operator':
          return new SCADAOperatorNode(flow, parameters)

        case 'network':
          return new SCADANetworkNode(flow, parameters)

        case 'resource':
          return new SCADAResourceNode(flow, parameters)

        case 'device':
          return new SCADADeviceNode(flow, parameters)

        case 'zone':
          return new SCADAZoneNode(flow, parameters)

        default:
          return new FlowNode(flow, parameters)
      }
    }

    const scada = AcmeGas

    const systemconnectors: Array<FlowConnectorParameters> = [
      { id: 'system-security', anchor: 'bottom', index: 0 },
      { id: 'system-network', anchor: 'bottom', index: 1, },
      { id: 'system-operator', anchor: 'bottom', index: 2, },
      { id: 'system-resource', anchor: 'bottom', index: 3, },
    ]
    const system = flow.addNode(<SCADANodeParameters>{
      scadatype: 'system', data: scada, connectors: systemconnectors
    })

    const groupconnectors: Array<FlowConnectorParameters> = [
      { id: 'system-group', anchor: 'top' },
      { id: 'group-zone', anchor: 'bottom' },
    ]
    scada.securitygroups.forEach(item => {
      const group = flow.addNode(<SCADANodeParameters>{
        scadatype: 'securitygroup', data: item, connectors: groupconnectors
      })
      flow.addEdge({ from: system.name, to: group.name, fromconnector: systemconnectors[0].id, toconnector: groupconnectors[0].id })

      item.zones.forEach(item => {
        const connectors: Array<FlowConnectorParameters> = [
          { id: 'group-zone', anchor: 'top' },
        ]
        const zone = flow.addNode(<SCADANodeParameters>{
          scadatype: 'zone', data: item, connectors: connectors
        })
        flow.addEdge({ from: group.name, to: zone.name, fromconnector: groupconnectors[1].id, toconnector: connectors[0].id })
      })
    })

    const networkconnectors: Array<FlowConnectorParameters> = [
      { id: 'system-network', anchor: 'top' },
      { id: 'network-device', anchor: 'bottom' },
      { id: 'network-zone', anchor: 'top', index: 1 },
    ]
    scada.networks.forEach(item => {
      const network = flow.addNode(<SCADANodeParameters>{ scadatype: 'network', data: item, connectors: networkconnectors })
      flow.addEdge({ from: system.name, to: network.name, fromconnector: systemconnectors[1].id, toconnector: networkconnectors[0].id })

      const group = flow.hasNode(item.zone.name)
      if (group)
        flow.addEdge({ from: network.name, to: group.name, fromconnector: networkconnectors[2].id, toconnector: groupconnectors[1].id })

      item.devices.forEach(item => {
        const connectors: Array<FlowConnectorParameters> = [
          { id: 'device-network', anchor: 'top' },
        ]
        const device = flow.addNode(<SCADANodeParameters>{ scadatype: 'device', data: item, connectors })
        flow.addEdge({ from: network.name, to: device.name, fromconnector: networkconnectors[1].id, toconnector: connectors[0].id })
      })
    })

    scada.operators.forEach(item => {
      const connectors: Array<FlowConnectorParameters> = [
        { id: 'operator-zone', anchor: 'top' },
      ]
      const operator = flow.addNode(<SCADANodeParameters>{ scadatype: 'operator', data: item, connectors })
      flow.addEdge({ from: system.name, to: operator.name, fromconnector: systemconnectors[2].id, toconnector: connectors[0].id })
    })

    scada.resources.forEach(item => {
      const connectors: Array<FlowConnectorParameters> = [
        { id: 'resource-zone', anchor: 'top' },
      ]
      const resource = flow.addNode(<SCADANodeParameters>{ scadatype: 'resource', data: item, connectors })
      flow.addEdge({ from: system.name, to: resource.name, fromconnector: systemconnectors[3].id, toconnector: connectors[0].id })
    })

    flow.layout(false)

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


      this.addEventListener(FlowPointerEventType.CLICK, () => {
        if (icon.text == 'add')
          icon.text = 'remove'
        else
          icon.text = 'add'
      })
    }
  }

}


type SCADANodeType = 'system' | 'securitygroup' | 'network' | 'operator' | 'resource' | 'device' | 'zone'
interface SCADANodeParameters extends FlowNodeParameters {
  scadatype: SCADANodeType
  data: any
}

class SCADASystemNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    const system = parameters.data as SCADASystem

    parameters.label = { text: system.name }
    parameters.height = 0.2

    super(diagram, parameters);

    const icon = new FlowLabel(diagram, { text: 'dns', isicon: true, material: { color: 'black' } })
    this.add(icon)
    icon.position.set(-this.width / 2 + 0.1, this.height / 2, 0.01)
    icon.updateLabel()
  }
}
class SCADASecurityGroupNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    const group = parameters.data as SecurityGroup

    parameters.label = { text: group.name }
    parameters.height = 0.2

    super(diagram, parameters);

    const icon = new FlowLabel(diagram, { text: 'vpn_lock', isicon: true, material: { color: 'green' } })
    this.add(icon)
    icon.position.set(-this.width / 2 + 0.1, this.height / 2, 0.01)
    icon.updateLabel()

  }
}
class SCADANetworkNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    const network = parameters.data as CommunicationNetwork

    parameters.label = { text: network.name }
    parameters.height = 0.2

    super(diagram, parameters);

    const icon = new FlowLabel(diagram, { text: 'lan', isicon: true, material: { color: 'gray' } })
    this.add(icon)
    icon.position.set(-this.width / 2 + 0.1, this.height / 2, 0.01)
    icon.updateLabel()

  }
}
class SCADAOperatorNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    const operator = parameters.data as Operator

    parameters.label = { text: operator.name }
    parameters.height = 0.2


    super(diagram, parameters);

    const icon = new FlowLabel(diagram, { text: 'person', isicon: true, material: { color: 'blue' } })
    this.add(icon)
    icon.position.set(-this.width / 2 + 0.1, this.height / 2, 0.01)
    icon.updateLabel()

  }
}
class SCADAResourceNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    const resource = parameters.data as SystemResource

    parameters.label = { text: resource.name }
    parameters.height = 0.2


    super(diagram, parameters);

    const icon = new FlowLabel(diagram, { text: 'computer', isicon: true, material: { color: 'black' } })
    this.add(icon)
    icon.position.set(-this.width / 2 + 0.1, this.height / 2, 0.01)
    icon.updateLabel()

  }
}

class SCADADeviceNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    const device = parameters.data as CommunicationDevice

    parameters.label = { text: device.name }
    parameters.height = 0.2


    super(diagram, parameters);

    const icon = new FlowLabel(diagram, { text: 'gas_meter', isicon: true, material: { color: 'black' } })
    this.add(icon)
    icon.position.set(-this.width / 2 + 0.1, this.height / 2, 0.01)
    icon.updateLabel()

  }
}
class SCADAZoneNode extends FlowNode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    const device = parameters.data as CommunicationDevice

    parameters.label = { text: device.name }
    parameters.height = 0.2


    super(diagram, parameters);

    const icon = new FlowLabel(diagram, { text: 'security', isicon: true, material: { color: 'black' } })
    this.add(icon)
    icon.position.set(-this.width / 2 + 0.1, this.height / 2, 0.01)
    icon.updateLabel()

  }
}
