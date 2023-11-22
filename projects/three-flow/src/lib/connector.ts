import { AnchorType, FlowConnectorParameters, FlowEventType, FlowTransform } from "./model"
import { BufferGeometry, CircleGeometry, Mesh, Object3D } from "three"
import { FlowDiagram } from "./diagram"
import { FlowNode } from "./node"
import { FlowLabel } from "./label"
import { FlowUtils } from "./utils"

export class FlowConnectors {
  private connectorsMap = new Map<string, NodeConnectors>()

  constructor(public diagram: FlowDiagram) {
    diagram.addEventListener(FlowEventType.NODE_ADDED, (e: any) => {
      const node = e.node as FlowNode
      if (!node.node.connectors) node.node.connectors = []
      this.createConnectors(node, node.node.connectors)
    })
  }


  private createConnectors(node: FlowNode, connectors: Array<FlowConnectorParameters>): NodeConnectors {
    const nodeconnectors = new NodeConnectors(this, node, connectors)
    this.connectorsMap.set(node.name, nodeconnectors)

    const getConnector = (id?: string): Object3D => {
      if (!id) return node

      const mesh = nodeconnectors.hasConnector(id)
      return mesh ? mesh : node
    }
    node.getConnector = getConnector
    return nodeconnectors
  }

  hasNode(id: string): NodeConnectors | undefined {
    return this.connectorsMap.get(id)
  }

  addConnectors(node: FlowNode, connectors: Array<FlowConnectorParameters>) {
    let nodeconnectors = this.connectorsMap.get(node.name)
    if (nodeconnectors) {
      // add to existing
      connectors.forEach(connector => {
        if (nodeconnectors) nodeconnectors.addConnector(connector)

        if (!node.node.connectors) node.node.connectors = []
        node.node.connectors.push(connector)
      })
    }
    else {
      this.createConnectors(node, connectors)
      node.node.connectors = connectors
    }
  }

  removeConnectors(node: FlowNode, connectors: Array<FlowConnectorParameters>) {
    let nodeconnectors = this.connectorsMap.get(node.name)
    if (nodeconnectors) {
      connectors.forEach(connector => {
        if (nodeconnectors) nodeconnectors.removeConnector(connector)
      });

      // use copy for safe removal
      [...connectors].forEach(connector => {
        if (node.node.connectors) {
          const index = node.node.connectors.findIndex(x => x.id == connector.id)
          if (index != -1) node.node.connectors.splice(index, 1)
        }
      })
    }
  }

  // overridables
  createGeometry(parameters: FlowConnectorParameters): BufferGeometry {
    return new CircleGeometry(parameters.radius)
  }
}

export class NodeConnectors {
  // options
  spacing = 0.1
  total: any = { left: 0, right: 0, top: 0, bottom: 0 }

  constructor(public connectors: FlowConnectors, private node: FlowNode, public parameters: Array<FlowConnectorParameters>) {

    if (node.node.connectors) {
      node.node.connectors.forEach(connector => {
        this.addConnector(connector)
      });
    }

    this.node.addEventListener(FlowEventType.WIDTH_CHANGED, () => {
      this.moveConnectors()
    })

    this.node.addEventListener(FlowEventType.HEIGHT_CHANGED, () => {
      this.moveConnectors()
    })

  }

  hasConnector(id: string): ConnectorMesh | undefined {

    for (const child of this.node.children) {
      if (child.type == 'flowconnector') {
        const connector = child as ConnectorMesh
        if (connector.name == id) return connector
      }
    }

    return undefined
  }

  addConnector(item: FlowConnectorParameters): ConnectorMesh {
    if (!item.anchor) item.anchor = 'left'
    const connector = new ConnectorMesh(this, item)

    this.node.add(connector)
    this.total[item.anchor]++;

    this.moveConnectors()

    this.updateVisuals()
    return connector
  }

  removeConnector(connector: FlowConnectorParameters): void {
    const item = this.hasConnector(connector.id)
    if (item) this.removeConnectorMesh(item)
  }


  private removeConnectorMesh(item: ConnectorMesh): void {
    this.node.remove(item)
    this.total[item.anchor]--;

    this.moveConnectors()
  }


  getConnectors() {
    return (this.node.children as Array<ConnectorMesh>)
      .filter(item => item.type == 'flowconnector')
  }

  private calculateOffset(count: number, index: number, width: number): number {
    const totalWidth = count * width + (count - 1) * this.spacing;
    const startPosition = -totalWidth / 2;

    // Calculate the x position of the center of the specified mesh
    return startPosition + (width / 2) + (index * (width + this.spacing));
  }

  private positionConnector(connector: ConnectorMesh) {
    const anchor = connector.anchor
    let x = 0, y = 0
    switch (anchor) {
      case 'left':
        x = -this.node.width / 2
        break
      case 'right':
        x = this.node.width / 2
        break
      case 'top':
        y = this.node.height / 2
        break
      case 'bottom':
        y = -this.node.height / 2
        break;
      case 'center':
        break;
      default:
        console.warn('Unhandled connector anchor type', anchor)
        break;
    }

    const count = this.total[anchor]
    // left and right
    if (anchor == 'left' || anchor == 'right') {
      const position = y + this.calculateOffset(count, connector.index, connector.width)
      connector.position.set(x, position, 0.001)
    }
    else {
      const position = x + this.calculateOffset(count, connector.index, connector.width)
      connector.position.set(position, y, 0.001)
    }
  }

  private moveConnectors() {

    this.getConnectors().forEach(connector => {
      this.positionConnector(connector)
      connector.dispatchEvent<any>({ type: 'dragged' })
    })
  }

  updateVisuals() { }


  // overridables
  createGeometry(parameters: FlowConnectorParameters): BufferGeometry {
    return this.connectors.createGeometry(parameters)
  }

}

class ConnectorMesh extends Mesh {
  index: number
  anchor: AnchorType
  color: number | string = 'black'
  label?: FlowLabel
  labeloffset: number
  transform?: FlowTransform; // adjust position and rotation
  shape!: string
  hidden = false
  width: number
  height: number
  radius: number

  isFlow = true
  constructor(private node: NodeConnectors, public parameters: FlowConnectorParameters) {
    super()

    //@ts-ignore
    this.type = 'flowconnector'
    this.name = parameters.id
    this.index = (parameters.index != undefined) ? parameters.index : 0
    this.anchor = parameters.anchor ? parameters.anchor : 'left'
    this.labeloffset = parameters.labeloffset ? parameters.labeloffset : 1.5
    this.transform = parameters.transform
    this.shape = parameters.shape ? parameters.shape : 'circle'
    this.color = parameters.color ? parameters.color : 'black'
    this.radius = parameters.radius = parameters.radius != undefined ? parameters.radius : 0.1
    this.width = parameters.width = parameters.width != undefined ? parameters.width : this.radius * 2
    this.height = parameters.height = parameters.height != undefined ? parameters.height : this.radius * 2

    this.hidden = parameters.hidden != undefined ? parameters.hidden : false
    this.visible = !this.hidden

    const diagram = node.connectors.diagram

    if (parameters.label) {
      this.label = diagram.createLabel(parameters.label)
      this.add(this.label)
      this.label.updateLabel()
      switch (this.anchor) {
        case 'left':
          this.label.position.x = this.width / 2 * this.labeloffset
          break
        case 'right':
          this.label.position.x = -this.width / 2 * this.labeloffset
          break
        case 'top':
          this.label.position.y = -this.height / 2 * this.labeloffset
          break
        case 'bottom':
          this.label.position.y = this.height / 2 * this.labeloffset
          break
      }
    }
    if (parameters.userData) this.userData = parameters.userData

    this.geometry = this.node.createGeometry(parameters)
    if (this.transform)
      FlowUtils.transformGeometry(this.transform, this.geometry)

    this.material = diagram.getMaterial('geometry', 'connector', this.color)
  }

  updateVisuals() { }
}

