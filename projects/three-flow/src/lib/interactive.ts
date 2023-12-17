import { Camera, Material, MeshBasicMaterial, MeshBasicMaterialParameters, Vector3, WebGLRenderer } from "three";
import { DragNode } from "./drag-node";
import { FlowDiagram } from "./diagram";
import { InteractiveEventType, ThreeInteractive } from "./three-interactive";
import { FlowNode } from "./node";
import { ResizeNode } from "./resize-node";
import { ScaleNode } from "./scale-node";
import { FlowEdgeParameters, FlowEventType } from "./model";
import { ConnectorMesh } from "./connector";
import { FlowEdge } from "./edge";
import { FlowRoute } from "./route";

export class FlowInteraction {
  private nodes: Array<NodeInteractive> = []
  private connectors: Array<ConnectorInteractive> = []

  readonly interactive: ThreeInteractive

  private _draggable = true
  get draggable() { return this._draggable }
  set draggable(newvalue: boolean) {
    if (this._draggable != newvalue) {
      this._draggable = newvalue;
      this.nodes.forEach(item => item.node.draggable = newvalue)
    }
  }

  private _selectable = true
  get selectable() { return this._selectable }
  set selectable(newvalue: boolean) {
    if (this._selectable != newvalue) {
      this._selectable = newvalue;
      this.nodes.forEach(item => item.node.selectable = newvalue)
    }
  }

  private _resizable = true
  get resizable() { return this._resizable }
  set resizable(newvalue: boolean) {
    if (this._resizable != newvalue) {
      this._resizable = newvalue;
      this.nodes.forEach(item => item.node.resizable = newvalue)
    }
  }

  private _scalable = true
  get scalable() { return this._scalable }
  set scalable(newvalue: boolean) {
    if (this._scalable != newvalue) {
      this._scalable = newvalue;
      this.nodes.forEach(item => item.node.scalable = newvalue)
    }
  }

  constructor(public diagram: FlowDiagram, renderer: WebGLRenderer, camera: Camera) {
    this.interactive = this.createThreeInteractive(renderer, camera)

    diagram.addEventListener(FlowEventType.NODE_REMOVED, (e: any) => {
      const node = e.node as FlowNode
      const index = this.nodes.findIndex(x => x.node == node)
      if (index != -1) {
        this.nodes[index].dispose()
        this.nodes.splice(index, 1)

        if (node.selectable) this.interactive.selectable.remove(node)
      }
    })


    diagram.addEventListener(FlowEventType.NODE_ADDED, (e: any) => {
      const node = e.node as FlowNode
      this.nodes.push(new NodeInteractive(node, this))

      const selectableChanged = () => {
        if (node.selectable)
          this.interactive.selectable.add(node)
        else
          this.interactive.selectable.remove(node)
      }
      // enable mouse enter/leave/missed events
      node.addEventListener(FlowEventType.SELECTABLE_CHANGED, () => { selectableChanged() })
      selectableChanged()
    })

    diagram.addEventListener(FlowEventType.CONNECTOR_ADDED, (e: any) => {
      const connector = e.connector as ConnectorMesh

      if (connector.selectable || connector.draggable)
        this.connectors.push(new ConnectorInteractive(connector, this))

      if (connector.selectable) {
        const selectableChanged = () => {
          if (connector.selectable)
            this.interactive.selectable.add(connector)
          else
            this.interactive.selectable.remove(connector)
        }
        // enable mouse enter/leave/missed events
        connector.addEventListener(FlowEventType.SELECTABLE_CHANGED, () => { selectableChanged() })
        selectableChanged()
      }

      if (connector.draggable) {
        const draggableChanged = () => {
          if (connector.draggable)
            this.interactive.draggable.add(connector)
          else
            this.interactive.draggable.remove(connector)
        }
        // enable mouse enter/leave/missed events
        connector.addEventListener(FlowEventType.DRAGGABLE_CHANGED, () => { draggableChanged() })
        draggableChanged()
      }
    })

    diagram.addEventListener(FlowEventType.CONNECTOR_REMOVED, (e: any) => {
      const connector = e.connector as ConnectorMesh
      const index = this.connectors.findIndex(x => x.mesh == connector)
      if (index != -1) {
        this.connectors[index].dispose()
        this.connectors.splice(index, 1)

        if (connector.selectable) this.interactive.selectable.remove(connector)
      }
    })

    diagram.addEventListener(FlowEventType.DISPOSE, () => {
      this.nodes.forEach(node => node.dispose())
    })

    const handleKeyDown = (keyboard: KeyboardEvent) => {
      diagram.dispatchEvent<any>({ type: FlowEventType.KEY_DOWN, keyboard })
    }
    const handleKeyUp = (keyboard: KeyboardEvent) => {
      diagram.dispatchEvent<any>({ type: FlowEventType.KEY_UP, keyboard })
    }
    const element = document
    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('keyup', handleKeyUp);

    this._dispose = () => {
      element.removeEventListener('keydown', handleKeyDown)
      element.removeEventListener('keyup', handleKeyUp)
    }

  }

  getConnectorInteractive(mesh: ConnectorMesh): ConnectorInteractive | undefined {
    return this.connectors.find(x => x.mesh == mesh)
  }

  createThreeInteractive(renderer: WebGLRenderer, camera: Camera): ThreeInteractive {
    return new ThreeInteractive(renderer, camera)
  }

  private _dispose: () => void

  dispose() {
    this.nodes.forEach(node => node.dispose())
    this.interactive.dispose()
    this._dispose()
  }
}

class NodeInteractive {
  private nodeResizer: ResizeNode
  private nodeDragger: DragNode
  private nodeScaler: ScaleNode

  dispose = () => { }

  constructor(public node: FlowNode, source: FlowInteraction) {
    const diagram = source.diagram

    node.addEventListener(InteractiveEventType.CLICK, () => {
      if (!node.selectable) return
      diagram.active = node
      diagram.dispatchEvent<any>({ type: FlowEventType.NODE_SELECTED, node })
    })

    node.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      if (diagram.active == node) {
        diagram.active = undefined
        diagram.dispatchEvent<any>({ type: FlowEventType.NODE_SELECTED, node: undefined })
      }
    })

    this.nodeResizer = this.createResizer(node, diagram.getMaterial('geometry', 'resizing', <MeshBasicMaterialParameters>{ color: node.resizecolor }))
    const resizableChanged = () => {
      if (node.resizable) {
        source.interactive.selectable.add(...this.nodeResizer.selectable)
        source.interactive.draggable.add(...this.nodeResizer.selectable)
      }
      else {
        this.nodeResizer.stopResizing()
        source.interactive.selectable.remove(...this.nodeResizer.selectable)
        source.interactive.draggable.remove(...this.nodeResizer.selectable)
      }
    }
    node.addEventListener(FlowEventType.RESIZABLE_CHANGED, () => { resizableChanged() })
    resizableChanged()

    this.nodeScaler = this.createScaler(node, diagram.getMaterial('geometry', 'scaling', <MeshBasicMaterialParameters>{ color: node.scalecolor }))
    const scalebleChanged = () => {
      if (node.scalable) {
        source.interactive.selectable.add(...this.nodeScaler.selectable)
        source.interactive.draggable.add(...this.nodeScaler.selectable)
      }
      else {
        this.nodeScaler.stopScaling()
        source.interactive.selectable.remove(...this.nodeScaler.selectable)
        source.interactive.draggable.remove(...this.nodeScaler.selectable)
      }
    }
    node.addEventListener(FlowEventType.SCALABLE_CHANGED, () => { scalebleChanged() })
    scalebleChanged()

    this.nodeDragger = this.createDragger(node, diagram.gridsize)
    const drag = () => {
      if (node.draggable)
        source.interactive.draggable.add(node)
      else {
        this.nodeDragger.stopDragging()
        source.interactive.draggable.remove(node)
      }
    }
    node.addEventListener(FlowEventType.DRAGGABLE_CHANGED, () => { drag() })
    drag()

    //
    // To intercept dragged event in derived class, add the following
    //
    // node.addEventListener(FlowEventType.DRAGGED, () => { })


    this.dispose = () => {
      if (this.nodeResizer) {
        source.interactive.selectable.remove(...this.nodeResizer.selectable)
        source.interactive.draggable.remove(...this.nodeResizer.selectable)
      }
      if (this.nodeDragger) {
        source.interactive.selectable.remove(node)
        source.interactive.draggable.remove(node)
      }
      if (this.nodeScaler) {
        source.interactive.selectable.remove(...this.nodeScaler.selectable)
        source.interactive.draggable.remove(...this.nodeScaler.selectable)
      }

    }
  }

  createResizer(node: FlowNode, material: Material): ResizeNode {
    return new ResizeNode(node, material)
  }

  createDragger(node: FlowNode, gridSize: number): DragNode {
    return new DragNode(node, gridSize)
  }

  createScaler(node: FlowNode, material: Material): ScaleNode {
    return new ScaleNode(node, material)
  }
}

export class ConnectorInteractive {

  dispose = () => { }

  constructor(public mesh: ConnectorMesh, source: FlowInteraction) {
    const diagram = source.diagram
    const parentNode = mesh.parent as FlowNode


    mesh.addEventListener(InteractiveEventType.CLICK, () => {
      if (!mesh.selectable) return
      diagram.dispatchEvent<any>({ type: FlowEventType.CONNECTOR_SELECTED, connector: mesh })
    })

    mesh.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      diagram.dispatchEvent<any>({ type: FlowEventType.NODE_SELECTED, connector: undefined })
    })

    mesh.addEventListener(InteractiveEventType.POINTERENTER, () => {
      if (!mesh.selectable) return
      if (mesh.disabled) {
        document.body.style.cursor = 'not-allowed'
      }
      else {
        let cursor = mesh.pointerEnter() ?? mesh.selectcursor
        if (cursor)
          document.body.style.cursor = cursor
      }
    })
    mesh.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
      if (!mesh.selectable) return
      mesh.pointerLeave()
      document.body.style.cursor = 'default'
    })

    const createNode = (start: Vector3): FlowNode | undefined => {
      const newnode = mesh.dropCompleted(diagram, start)
      if (newnode) {
        const params: FlowEdgeParameters = { from: parentNode.name, to: newnode.name, }

        const anchor = mesh.oppositeAnchor
        if (newnode.parameters.connectors) {
          const connector = newnode.parameters.connectors.find(c => c.anchor == anchor)

          if (connector) {
            params.fromconnector = mesh.name
            params.toconnector = connector.id
          }
        }
        diagram.addEdge(params)
      }
      return newnode
    }
    this.createNode = createNode

    const createDragRoute = (start: Vector3): FlowRoute | undefined => {
      const route = mesh.dragStarting(diagram, start)
      if (route) {
        const params: FlowEdgeParameters = { from: parentNode.name, to: route.name, fromconnector: mesh.name, }
        dragedge = diagram.addEdge(params)
      }
      return route
    }
    this.createDragRoute = createDragRoute

    let dragStart: Vector3 | undefined
    let flowStart: Vector3 | undefined
    let dragging = false
    mesh.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
      if (!mesh.draggable || mesh.disabled) return

      dragStart = e.position.clone()
      flowStart = diagram.getFlowPosition(mesh)
      document.body.style.cursor = 'grabbing'
      dragging = true
    })

    let newnode: FlowNode | undefined
    let dragroute: FlowNode | undefined
    let dragedge: FlowEdge | undefined
    let dragDistance = 0
    mesh.addEventListener(InteractiveEventType.DRAG, (e: any) => {
      if (!mesh.draggable || mesh.disabled || !dragging) return

      const position = e.position.clone()
      const diff = position.sub(dragStart) as Vector3
      dragDistance = diff.length()
      if (dragDistance > mesh.startDragDistance) {
        if (!mesh.createOnDrop) {
          if (!newnode) newnode = createNode(flowStart!)
        }
        else {
          if (!dragroute) dragroute = createDragRoute(flowStart!)
        }
      }

      if (newnode) {
        newnode.position.copy(position.add(flowStart) as Vector3)
        newnode.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
      }
      if (dragroute) {
        dragroute.position.copy(position.add(flowStart) as Vector3)
        dragroute.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
      }
    })

    const cancelDrag = () => {
      if (dragroute) diagram.removeNode(dragroute)
      dragroute = undefined
      if (dragedge) diagram.removeEdge(dragedge)
      dragedge = undefined
      dragging = false
    }

    mesh.addEventListener(InteractiveEventType.DRAGEND, (e: any) => {
      if (!mesh.draggable || mesh.disabled) return

      if (dragging && dragDistance > mesh.startDragDistance) {
        if (mesh.createOnDrop) {
          if (dragroute)
            createNode(diagram.getFlowPosition(dragroute))
        }
        cancelDrag()
      }
      newnode = undefined
    })

    diagram.addEventListener<any>(FlowEventType.KEY_DOWN, (e: any) => {
      const keyboard = e.keyboard as KeyboardEvent
      if (keyboard.code == 'Escape') cancelDrag()
    })
  }

  createNode: (start: Vector3) => FlowNode | undefined
  createDragRoute: (start: Vector3) => FlowRoute | undefined
}
