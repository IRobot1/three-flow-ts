import { AmbientLight, AxesHelper, BufferGeometry, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { ConnectorMesh, FlowConnectorParameters, FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowEdgeParameters, FlowEventType, FlowInteraction, FlowLabel, FlowNode, FlowNodeParameters, FlowPointerEventType, FlowPointerLayers, NodeConnectors, RoundedRectangleGeometry } from "three-flow";
import { AnalogTelemetry, Application, CommunicationDevice, CommunicationNetwork, DigitalTelemetry, SCADAData, SCADASystem, StringTelemetry } from "./scada-model";
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
      layoutoptions: { rankdir: 'TB', nodesep: 0.3, edgesep: 1, ranksep: 0.5 },
      linestyle: 'step',
      gridsize: 0.1,
    }

    const flow = new FlowDiagram(options)
    scene.add(flow);

    const interaction = new FlowInteraction(flow, app.pointer)

    const connectors = new FlowConnectors(flow)
    connectors.createConnector = (nodeconnectors: NodeConnectors, parameters: SCADAConnectorParameters): ConnectorMesh => {
      return new SCADAConnectorMesh(nodeconnectors, parameters)
    }

    flow.createNode = (parameters: SCADANodeParameters): FlowNode => {
      switch (parameters.scadatype) {
        case 'system':
          return new SCADASystemNode(flow, parameters)

        case 'network':
          return new SCADANetworkNode(flow, parameters)

        case 'device':
          return new SCADADeviceNode(flow, parameters)

        case 'application':
          return new SCADAApplicationNode(flow, parameters)

        case 'analog':
          return new SCADAAnalogNode(flow, parameters)

        case 'digital':
          return new SCADADigitalNode(flow, parameters)

        case 'string':
          return new SCADAStringNode(flow, parameters)

        default:
          return new FlowNode(flow, parameters)
      }
    }

    const scada = AcmeGas

    flow.addNode(<SCADANodeParameters>{
      scadatype: 'system', data: scada, icon: 'dns'
    })

    requestAnimationFrame(() => {
      flow.layout(true)
    })

    this.dispose = () => {
      interaction.dispose()
      orbit.dispose()
    }
  }
}

class SCADAConnectorMesh extends ConnectorMesh {
  constructor(nodeconnectors: NodeConnectors, parameters: SCADAConnectorParameters) {
    parameters.radius = 0.04
    if (parameters.anchor == 'bottom' && !parameters.material) parameters.material = { color: 'gray' }
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
          node.dispatchEvent<any>({ type: NodeEventType.COLLAPSE, scadatype: parameters.scadatype })
          icon.text = 'remove'
        }
        else {
          node.dispatchEvent<any>({ type: NodeEventType.EXPAND, scadatype: parameters.scadatype })
          icon.text = 'add'
        }
      })
    }
  }

}


type SCADANodeType = 'system' | 'network' | 'device' | 'application' | 'analog' | 'digital' | 'string'

interface SCADANodeParameters extends FlowNodeParameters {
  scadatype: SCADANodeType
  data: SCADAData
  icon: string
  iconcolor?: string
}

interface SCADAConnectorParameters extends FlowConnectorParameters {
  scadatype: SCADANodeType
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

    this.addEventListener(FlowEventType.WIDTH_CHANGED, () => {
      icon.position.set(-this.width / 2 + 0.1, this.height / 2, 0.001)
    })

    let hidden = false
    this.addEventListener(NodeEventType.EXPAND, (e: any) => {
      this.childnodes.forEach(node => {
        const params = node.parameters as SCADANodeParameters
        if (params.scadatype == e.scadatype)
          node.hidden = false
      })
      hidden = false
    })

    this.addEventListener(NodeEventType.COLLAPSE, (e: any) => {
      this.childnodes.forEach(node => {
        const params = node.parameters as SCADANodeParameters
        if (params.scadatype == e.scadatype)
          node.hidden = true
      })
      hidden = true
    })

    this.addEventListener(FlowEventType.HIDDEN_CHANGED, (e: any) => {
      if (hidden) return
      this.childnodes.forEach(node => node.hidden = this.hidden)
    })
  }

  override createGeometry(parameters: FlowNodeParameters): BufferGeometry {
    return new RoundedRectangleGeometry(this.width, this.height)
  }

}

class SCADASystemNode extends SCADANode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    parameters.height = 0.2

    const systemconnectors: Array<SCADAConnectorParameters> = [
      { id: 'system-network', anchor: 'bottom', scadatype: 'network' }
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
    const networkconnectors: Array<SCADAConnectorParameters> = [
      { id: 'system-network', anchor: 'top', scadatype: 'network' },
      { id: 'network-device', anchor: 'bottom', scadatype: 'device' },
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

    const deviceconnectors: Array<SCADAConnectorParameters> = [
      { id: 'network-device', anchor: 'top', scadatype: 'device' },
      { id: 'device-application', anchor: 'bottom', scadatype: 'application' },
    ]
    parameters.connectors = deviceconnectors

    super(diagram, parameters);

    const device = parameters.data as CommunicationDevice

    device.applications.forEach(item => {
      const applicationparams: SCADANodeParameters = {
        scadatype: 'application', data: item, icon: 'apps',
      }
      const application = diagram.addNode(applicationparams)
      this.childnodes.push(application)

      const appconnectors = applicationparams.connectors!

      const edgeparams: FlowEdgeParameters = {
        from: this.name, to: application.name,
        fromconnector: deviceconnectors[1].id, toconnector: appconnectors[0].id
      }

      // allow construtor to finish before adding edge
      requestAnimationFrame(() => {
        diagram.addEdge(edgeparams)
      })
    })
  }
}

class SCADAApplicationNode extends SCADANode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    parameters.height = 0.2

    const applicationconnectors: Array<SCADAConnectorParameters> = [
      { id: 'device-application', anchor: 'top', scadatype: 'application' },
      { id: 'application-analog', anchor: 'bottom', index: 0, scadatype: 'analog', material: { color: 'blue' } },
      { id: 'application-digital', anchor: 'bottom', index: 1, scadatype: 'digital', material: { color: 'green' } },
      { id: 'application-string', anchor: 'bottom', index: 2, scadatype: 'string', material: { color: 'purple' } },
    ]
    parameters.connectors = applicationconnectors

    super(diagram, parameters);

    const application = parameters.data as Application

    application.analogs?.forEach(item => {
      const analogparams: SCADANodeParameters = {
        scadatype: 'analog', data: item, icon: 'swap_calls',
      }
      const analog = diagram.addNode(analogparams)
      this.add(analog)
      this.childnodes.push(analog)

      const analogconnectors = analogparams.connectors!

      const edgeparams: FlowEdgeParameters = {
        from: this.name, to: analog.name,
        fromconnector: applicationconnectors[1].id, toconnector: analogconnectors[0].id,
        material: { color: 'blue' },
      }

      // allow construtor to finish before adding edge
      requestAnimationFrame(() => {
        diagram.addEdge(edgeparams)
      })
    })

    application.digitals?.forEach(item => {
      const digitalparams: SCADANodeParameters = {
        scadatype: 'digital', data: item, icon: 'bar_chart',
      }
      const digital = diagram.addNode(digitalparams)
      this.add(digital)
      this.childnodes.push(digital)

      const digitalconnectors = digitalparams.connectors!

      const edgeparams: FlowEdgeParameters = {
        from: this.name, to: digital.name,
        fromconnector: applicationconnectors[2].id, toconnector: digitalconnectors[0].id,
        material: { color: 'green' }
      }

      // allow construtor to finish before adding edge
      requestAnimationFrame(() => {
        diagram.addEdge(edgeparams)
      })
    })

    application.strings?.forEach(item => {
      const stringparams: SCADANodeParameters = {
        scadatype: 'string', data: item, icon: 'notes',
      }
      const telemetry = diagram.addNode(stringparams)
      this.add(telemetry)
      this.childnodes.push(telemetry)

      const stringconnectors = stringparams.connectors!

      const edgeparams: FlowEdgeParameters = {
        from: this.name, to: telemetry.name,
        fromconnector: applicationconnectors[3].id, toconnector: stringconnectors[0].id,
        material: { color: 'purple' }
      }

      // allow construtor to finish before adding edge
      requestAnimationFrame(() => {
        diagram.addEdge(edgeparams)
      })
    })
  }
}

class SCADAAnalogNode extends SCADANode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    parameters.height = 0.2

    const applicationconnectors: Array<SCADAConnectorParameters> = [
      { id: 'application-analog', anchor: 'top', scadatype: 'analog' },
    ]
    parameters.connectors = applicationconnectors

    super(diagram, parameters);

    const telemetry = parameters.data as AnalogTelemetry
  }
}
class SCADADigitalNode extends SCADANode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    parameters.height = 0.2

    const applicationconnectors: Array<SCADAConnectorParameters> = [
      { id: 'application-digital', anchor: 'top', scadatype: 'digital' },
    ]
    parameters.connectors = applicationconnectors

    super(diagram, parameters);

    const telemetry = parameters.data as DigitalTelemetry
  }
}
class SCADAStringNode extends SCADANode {
  constructor(diagram: FlowDiagram, parameters: SCADANodeParameters) {
    parameters.height = 0.2

    const applicationconnectors: Array<SCADAConnectorParameters> = [
      { id: 'application-string', anchor: 'top', scadatype: 'string' },
    ]
    parameters.connectors = applicationconnectors

    super(diagram, parameters);

    const telemetry = parameters.data as StringTelemetry
  }
}
