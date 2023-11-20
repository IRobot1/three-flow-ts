import { AnchorType, FlowConnectorParameters, FlowEventType } from "./model"
import { BufferGeometry, CircleGeometry, Mesh, Object3D } from "three"
import { FlowDiagram } from "./diagram"
import { FlowNode } from "./node"

const CONNECTOR_SIZE = 0.2
export class FlowConnectors {
  private connectors = new Map<string, NodeConnectors>()

  constructor(diagram: FlowDiagram) {
    diagram.addEventListener(FlowEventType.NODE_ADDED, (e: any) => {
      const node = e.node as FlowNode
      if (node.node.connectors) {
        this.createConnectors(node, node.node.connectors)
      }
    })
  }


  private createConnectors(node: FlowNode, connectors: Array<FlowConnectorParameters>): NodeConnectors {
    const nodeconnectors = new NodeConnectors(node, connectors)
    this.connectors.set(node.name, nodeconnectors)

    const getConnector = (id?: string): Object3D => {
      if (!id) return node

      const mesh = nodeconnectors.hasConnector(id)
      return mesh ? mesh : node
    }
    node.getConnector = getConnector
    return nodeconnectors
  }

  addConnectors(node: FlowNode, connectors: Array<FlowConnectorParameters>) {
    let nodeconnectors = this.connectors.get(node.name)
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
    let nodeconnectors = this.connectors.get(node.name)
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
}

class NodeConnectors {
  // options
  spacing = 0.1
  total: any = { left: 0, right: 0, top: 0, bottom: 0 }

  constructor(private node: FlowNode, public connectors: Array<FlowConnectorParameters>) {

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
    const connector = this.createConnector(this.node.diagram, item)

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

  private calculateOffset(count: number, index: number): number {
    const totalWidth = count * CONNECTOR_SIZE + (count - 1) * this.spacing;
    const startPosition = -totalWidth / 2;

    // Calculate the x position of the center of the specified mesh
    return startPosition + (CONNECTOR_SIZE / 2) + (index * (CONNECTOR_SIZE + this.spacing));
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
    }

    const count = this.total[anchor]
    // left and right
    if (anchor == 'left' || anchor == 'right') {
      const position = y + this.calculateOffset(count, connector.index)
      connector.position.set(x, position, 0.001)
    }
    else {
      const position = x + this.calculateOffset(count, connector.index)
      connector.position.set(position, y, 0.001)
    }
  }

  moveConnectors() {

    this.getConnectors().forEach(connector => {
      this.positionConnector(connector)
      connector.dispatchEvent<any>({ type: 'dragged' })
    })
    //  this.inputConnectors.forEach(connector => {
    //    this.positionConnector(connector, 'left')
    //    connector.dispatchEvent<any>({ type: 'dragged' })
    //  })
    //  this.outputConnectors.forEach(connector => {
    //    this.positionConnector(connector, 'right')
    //    connector.dispatchEvent<any>({ type: 'dragged' })
    //  })
  }

  updateVisuals() {

  }
  // overridable

  createConnector(diagram: FlowDiagram, connector: FlowConnectorParameters): ConnectorMesh {
    return new ConnectorMesh(diagram, connector)
  }
}

class ConnectorMesh extends Mesh {
  index: number
  anchor: AnchorType
  color = 'black'

  isFlow = true
  constructor(private diagram: FlowDiagram, public connector: FlowConnectorParameters) {
    super()

    //@ts-ignore
    this.type = 'flowconnector'
    this.name = connector.id
    this.index = (connector.index != undefined) ? connector.index : 0
    this.anchor = connector.anchor ? connector.anchor : 'left'

    if (connector.userData) this.userData = connector.userData

    this.geometry = this.createGeometry(CONNECTOR_SIZE / 2)

    this.material = diagram.getMaterial('geometry', 'connector', this.color)

  }

  createGeometry(size: number): BufferGeometry {
    return new CircleGeometry(size)
  }

  updateVisuals() {
  }
}

