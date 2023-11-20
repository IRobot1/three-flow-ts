import { FlowConnectorParameters, FlowEventType } from "./model"
import { BufferGeometry, CircleGeometry, Mesh, Object3D } from "three"
import { FlowDiagram } from "./diagram"
import { FlowNode } from "./node"

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

  constructor(private node: FlowNode, public connectors: Array<FlowConnectorParameters>) {

    if (node.node.connectors) {
      node.node.connectors.forEach((connector, index) => {
        connector.index = index
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

    // TODO: add to node.connectors

    const side = item.anchor == 'left' ? -1 : 1
    connector.position.set(side * this.node.width / 2, this.spacing * connector.index, 0.001)

    this.updateVisuals()
    return connector
  }

  removeConnector(item: ConnectorMesh): void {
    this.node.remove(item)
    // TODO: remove from node.connectors
    this.moveConnectors()
  }


  get inputConnectors() {
    return (this.node.children as Array<ConnectorMesh>)
      .filter(item => item.type == 'flowconnector' && item.connectortype == 'left')
      .sort((a, b) => a.index - b.index)
  }

  get outputConnectors() {
    return (this.node.children as Array<ConnectorMesh>)
      .filter(item => item.type == 'flowconnector' && item.connectortype == 'right')
      .sort((a, b) => a.index - b.index)
  }

  moveConnectors() {
    this.inputConnectors.forEach(connector => {
      connector.position.x = -this.node.width / 2
      connector.dispatchEvent<any>({ type: 'dragged' })
    })
    this.outputConnectors.forEach(connector => {
      connector.position.x = this.node.width / 2
      connector.dispatchEvent<any>({ type: 'dragged' })
    })
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
  connectortype: string
  color = 'black'

  isFlow = true
  constructor(private diagram: FlowDiagram, public connector: FlowConnectorParameters) {
    super()

    //@ts-ignore
    this.type = 'flowconnector'
    this.name = connector.id
    this.index = (connector.index != undefined) ? connector.index : 0
    this.connectortype = connector.anchor ? connector.anchor : 'left'

    if (connector.userData) this.userData = connector.userData

    this.geometry = this.createGeometry(0.1)

    this.material = diagram.getMaterial('geometry', 'connector', this.color)

  }

  createGeometry(size: number): BufferGeometry {
    return new CircleGeometry(size)
  }

  updateVisuals() {
  }
}

