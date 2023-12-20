import { AnchorType, FlowConnectorParameters, FlowEventType, FlowTransform } from "./model"
import { BufferGeometry, CircleGeometry, ColorRepresentation, Mesh, MeshBasicMaterialParameters, Object3D, Vector3 } from "three"
import { FlowDiagram } from "./diagram"
import { FlowNode } from "./node"
import { FlowLabel } from "./label"
import { FlowUtils } from "./utils"
import { FlowRoute } from "./route"

export class FlowConnectors {
  private connectorsMap = new Map<string, NodeConnectors>()

  constructor(public diagram: FlowDiagram) {
    diagram.addEventListener(FlowEventType.NODE_ADDED, (e: any) => {
      const node = e.node as FlowNode
      if (!node.parameters.connectors) node.parameters.connectors = []
      this.createConnectors(node, node.parameters.connectors)
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

  addConnectors(node: FlowNode, connectors: Array<FlowConnectorParameters>): NodeConnectors {
    let nodeconnectors = this.connectorsMap.get(node.name)
    if (nodeconnectors) {
      // add to existing
      connectors.forEach(connector => {
        if (nodeconnectors) nodeconnectors.addConnector(connector)

        if (!node.parameters.connectors) node.parameters.connectors = []
        node.parameters.connectors.push(connector)
      })
    }
    else {
      nodeconnectors = this.createConnectors(node, connectors)
      node.parameters.connectors = connectors
    }
    return nodeconnectors
  }

  removeConnectors(node: FlowNode, connectors: Array<FlowConnectorParameters>) {
    let nodeconnectors = this.connectorsMap.get(node.name)
    if (nodeconnectors) {
      connectors.forEach(connector => {
        if (nodeconnectors) nodeconnectors.removeConnector(connector)
      });

      // use copy for safe removal
      [...connectors].forEach(connector => {
        if (node.parameters.connectors) {
          const index = node.parameters.connectors.findIndex(x => x.id == connector.id)
          if (index != -1) node.parameters.connectors.splice(index, 1)
        }
      })
    }
  }

  // overridables
  createGeometry(parameters: FlowConnectorParameters): BufferGeometry {
    return new CircleGeometry(parameters.radius)
  }

  createConnector(nodeconnectors: NodeConnectors, parameters: FlowConnectorParameters): ConnectorMesh {
    return new ConnectorMesh(nodeconnectors, parameters)
  }
}

export class NodeConnectors {
  // options
  spacing = 0.1
  private total: any = { left: 0, right: 0, top: 0, bottom: 0, front:0, back: 0, center: 0, count: 0 }

  constructor(public flowconnectors: FlowConnectors, public node: FlowNode, public parameters: Array<FlowConnectorParameters>) {
    if (node.parameters.connectors) {
      node.parameters.connectors.forEach(parameters => {
        this.addConnector(parameters)
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

  addConnector(parameters: FlowConnectorParameters): ConnectorMesh {
    if (!parameters.anchor) parameters.anchor = 'left'

    let count = this.total.count
    let index = 0
    if (parameters.index != undefined) index = parameters.index
    if (!parameters.id || parameters.id == '') {
      parameters.id = `c${count + 1}${this.node.name}`
      if (index > 0) parameters.id += `-${index}`
    }

    const connector = this.flowconnectors.createConnector(this, parameters)!
    this.node.add(connector)
    this.total[parameters.anchor]++;
    this.total.count++

    this.moveConnectors()
    if (connector.transform)
      FlowUtils.transformObject(connector.transform, connector)

    this.node.diagram.dispatchEvent<any>({ type: FlowEventType.CONNECTOR_ADDED, connector })
    return connector
  }

  removeConnector(parameters: FlowConnectorParameters): void {
    const connector = this.hasConnector(parameters.id)
    if (connector) {
      this.node.remove(connector)
      this.total[connector.anchor]--;
      this.total.count--

      this.moveConnectors()

      this.node.diagram.dispatchEvent<any>({ type: FlowEventType.CONNECTOR_REMOVED, connector })
    }
  }

  public getConnectors() {
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
    let x = 0, y = 0, z =0.001
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
      case 'front':
        //z = 0.001
        break;
      case 'back':
        z = -0.001
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
      connector.position.set(x, position, z)
    }
    else if (anchor == 'top' || anchor == 'bottom') {
      const position = x + this.calculateOffset(count, connector.index, connector.width)
      connector.position.set(position, y, z)
    }
    else {
      connector.position.z =  z
    }
  }

  private moveConnectors() {

    this.getConnectors().sort((a, b) => a.index - b.index).forEach(connector => {
      this.positionConnector(connector)
      connector.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
    })
  }


  // overridables
  createGeometry(parameters: FlowConnectorParameters): BufferGeometry {
    return this.flowconnectors.createGeometry(parameters)
  }

}

export class ConnectorMesh extends Mesh {
  index: number
  anchor: AnchorType
  get oppositeAnchor(): AnchorType {
    const lookup = {
      left: 'right',
      right: 'left',
      top: 'bottom',
      bottom: 'top',
      center: 'center',
      front: 'front',
      back: 'back',
    }
    return lookup[this.anchor] as AnchorType
  }

  private _matparams!: MeshBasicMaterialParameters
  get color() { return this._matparams.color! }
  set color(newvalue: ColorRepresentation) {
    if (this._matparams.color != newvalue) {
      this._matparams.color = newvalue;
      if (newvalue)
        this.material = this.connectors.flowconnectors.diagram.getMaterial('geometry', 'connector', this._matparams)
    }
  }

  label?: FlowLabel
  labeloffset: number
  transform?: FlowTransform; // adjust position and rotation
  shape!: string
  hidden = false
  width: number
  height: number
  radius: number

  private _selectable: boolean;
  get selectable() { return this._selectable }
  set selectable(newvalue: boolean) {
    if (this._selectable != newvalue) {
      this._selectable = newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.SELECTABLE_CHANGED })
    }
  }

  private _draggable: boolean;
  get draggable() { return this._draggable }
  set draggable(newvalue: boolean) {
    if (this._draggable != newvalue) {
      this._draggable = newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.SELECTABLE_CHANGED })
    }
  }

  disabled: boolean
  selectcursor: string
  startDragDistance: number
  createOnDrop: boolean

  isFlow = true
  constructor(public connectors: NodeConnectors, public parameters: FlowConnectorParameters) {
    super()

    //@ts-ignore
    this.type = 'flowconnector'
    this.name = parameters.id
    this.index = (parameters.index != undefined) ? parameters.index : 0
    this.anchor = parameters.anchor ? parameters.anchor : 'left'
    this.labeloffset = parameters.labeloffset ? parameters.labeloffset : 1.5
    this.transform = parameters.transform
    this.shape = parameters.shape ? parameters.shape : 'circle'
    this._matparams = parameters.material ? parameters.material : { color: 'black' }
    this.radius = parameters.radius = parameters.radius != undefined ? parameters.radius : 0.1
    this.width = parameters.width = parameters.width != undefined ? parameters.width : this.radius * 2
    this.height = parameters.height = parameters.height != undefined ? parameters.height : this.radius * 2
    this._selectable = parameters.selectable ? parameters.selectable : false
    this._draggable = parameters.draggable ? parameters.draggable : false
    this.selectcursor = parameters.selectcursor ? parameters.selectcursor : 'grab'
    this.disabled = parameters.disabled ? parameters.disabled : false
    this.startDragDistance = parameters.startDragDistance != undefined ? parameters.startDragDistance : 0.2
    this.createOnDrop = parameters.createOnDrop != undefined ? parameters.createOnDrop : true
    this.hidden = parameters.hidden != undefined ? parameters.hidden : false
    this.visible = !this.hidden

    const diagram = connectors.flowconnectors.diagram

    if (parameters.label) {
      this.label = diagram.createLabel(parameters.label)
      this.add(this.label)
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

    this.geometry = this.connectors.createGeometry(parameters)
    this.material = diagram.getMaterial('geometry', 'connector', this._matparams)

    requestAnimationFrame(() => {
      if (this.label) this.label.updateLabel()
    })
  }

  // overridables
  // return a cursor https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#keyword
  pointerEnter(): string | undefined {
    return 'grab'
  }

  pointerLeave(): void { }

  dragStarting(diagram: FlowDiagram, start: Vector3): FlowRoute | undefined {
    return diagram.addRoute({ x: start.x, y: start.y, dragging: true })
  }

  dropCompleted(diagram: FlowDiagram, position: Vector3): FlowNode | undefined {
    console.warn('drop complete not handled')
    return undefined
  }

}

