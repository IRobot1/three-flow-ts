import { Camera, Material, MeshBasicMaterial, MeshBasicMaterialParameters, Vector3, WebGLRenderer } from "three";
import { DragNode } from "./drag-node";
import { FlowDiagram } from "./diagram";
import { InteractiveEventType, ThreeInteractive } from "./three-interactive";
import { FlowNode } from "./node";
import { ResizeNode } from "./resize-node";
import { ScaleNode } from "./scale-node";
import { FlowEventType } from "./model";
import { ConnectorMesh } from "./connector";
import { FlowEdge } from "./edge";

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
  }


  createThreeInteractive(renderer: WebGLRenderer, camera: Camera): ThreeInteractive {
    return new ThreeInteractive(renderer, camera)
  }

  dispose() {
    this.nodes.forEach(node => node.dispose())
    this.interactive.dispose()
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

class ConnectorInteractive {

  dispose = () => { }

  constructor(public mesh: ConnectorMesh, source: FlowInteraction) {
    const diagram = source.diagram
    const node4 = mesh.parent as FlowNode

    const original = (mesh.material as MeshBasicMaterial).clone()
    const white = new MeshBasicMaterial({ color: 'white' })

    mesh.addEventListener(InteractiveEventType.POINTERENTER, () => {
      if (!mesh.selectable) return
      mesh.material = white
      document.body.style.cursor = 'grab'
    })
    mesh.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
      if (!mesh.selectable) return
      mesh.material = original
      document.body.style.cursor = 'default'
    })

    // make a parameter
    const distanceBeforeCreate = 0.2
    const createOnDrop = true

    let newnode: FlowNode | undefined
    const createNode = (start: Vector3) => {
      newnode = diagram.addNode({
        x: start.x, y: start.y, material: { color: 'blue' },
        label: { text: 'New Node', font: 'helvetika', material: { color: 'white' }, },
        resizable: false,
        connectors: [
          { id: '', anchor: mesh.oppositeAnchor, index: 0 },
        ]
      })

      diagram.addEdge({ from: node4.name, to: newnode.name, fromconnector: mesh.name, toconnector: newnode.node.connectors![0].id })
    }

    let dragnode: FlowNode | undefined
    let dragedge: FlowEdge | undefined
    const createDragNode = (start: Vector3) => {
      dragnode = diagram.addRoute({
        x: start.x, y: start.y, material: { color: 'blue' }, dragging: true
        //label: { text: 'New Node', font: 'helvetika', material: { color: 'white' }, },
      })

      dragedge = diagram.addEdge({ from: node4.name, to: dragnode.name, fromconnector: mesh.name, })
    }

    let dragStart: Vector3 | undefined
    let flowStart: Vector3 | undefined
    mesh.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
      if (!mesh.draggable) return

      dragStart = e.position.clone()
      flowStart = diagram.getFlowPosition(mesh)
    })

    let dragDistance = 0
    mesh.addEventListener(InteractiveEventType.DRAG, (e: any) => {
      if (!mesh.draggable) return

      const position = e.position.clone()
      const diff = position.sub(dragStart) as Vector3
      dragDistance = diff.length()
      if (dragDistance > distanceBeforeCreate) {
        if (!createOnDrop) {
          if (!newnode) createNode(flowStart!)
        }
        else {
          if (!dragnode) createDragNode(flowStart!)
        }
      }

      if (newnode) {
        newnode.position.copy(position.add(flowStart) as Vector3)
        newnode.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
      }
      if (dragnode) {
        dragnode.position.copy(position.add(flowStart) as Vector3)
        dragnode.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
      }
    })

    mesh.addEventListener(InteractiveEventType.DRAGEND, (e: any) => {
      if (!mesh.draggable) return

      if (dragDistance > distanceBeforeCreate) {
        if (createOnDrop)
          createNode(e.position.clone().add(flowStart) as Vector3)

        if (dragnode) diagram.removeNode(dragnode)
        dragnode = undefined
        if (dragedge) diagram.removeEdge(dragedge)
        dragedge = undefined
      }
      newnode = undefined
    })

  }
}
