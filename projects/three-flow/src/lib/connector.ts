import { AnchorType, FlowConnectorParameters, FlowEventType } from "./model"
import { BufferGeometry, CircleGeometry, Mesh, Object3D } from "three"
import { FlowDiagram } from "./diagram"
import { FlowNode } from "./node"

const CONNECTOR_SIZE = 0.2
export class FlowConnectors {
  connectors: Array<NodeConnectors> = []
  constructor(diagram: FlowDiagram) {
    diagram.addEventListener(FlowEventType.NODE_ADDED, (e: any) => {
      const node = e.node as FlowNode
      if (node.node.connectors) {
        const connectors = new NodeConnectors(node, node.node.connectors)
        this.connectors.push(connectors)

        const getConnector = (id?: string): Object3D => {
          if (!id) return node

          const mesh = connectors.hasConnector(id)
          return mesh ? mesh : node
        }
        node.getConnector = getConnector
      }
    })
  }


  //addConnectors(node: FlowNode, connectors: Array<FlowConnectorParameters>): NodeConnectors {
  //  if (!node.node.connectors) node.node.connectors = []
  //  node.node.connectors.concat(connectors)
  //  const connector = new NodeConnectors(node, connectors)
  //  this.connectors.push(connector)
  //  return connector
  //}

  //removeConnectors(node: FlowNode, connectors: Array<FlowConnectorParameters>) {
  //  connectors.forEach(connector => {

  //  })
  //}
}

export class NodeConnectors {
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

    // TODO: add to node.connectors, might need set method which doesn't add

    this.moveConnectors()

    this.updateVisuals()
    return connector
  }

  removeConnector(item: ConnectorMesh): void {
    this.node.remove(item)
    this.total[item.anchor]--;

    // TODO: remove from node.connectors

    this.moveConnectors()
  }


  //get inputConnectors() {
  //  return (this.node.children as Array<ConnectorMesh>)
  //    .filter(item => item.type == 'flowconnector' && item.anchor == 'left')
  //    .sort((a, b) => a.index - b.index)
  //}

  //get outputConnectors() {
  //  return (this.node.children as Array<ConnectorMesh>)
  //    .filter(item => item.type == 'flowconnector' && item.anchor == 'right')
  //    .sort((a, b) => a.index - b.index)
  //}

  getConnectors() {
    return (this.node.children as Array<ConnectorMesh>)
      .filter(item => item.type == 'flowconnector')
  }

  private calculateOffset(n: number, index: number): number {
    const totalWidth = n * CONNECTOR_SIZE + (n - 1) * this.spacing;
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

    this.geometry = this.createGeometry(CONNECTOR_SIZE/2)

    this.material = diagram.getMaterial('geometry', 'connector', this.color)

  }

  createGeometry(size: number): BufferGeometry {
    return new CircleGeometry(size)
  }

  updateVisuals() {
  }
}

