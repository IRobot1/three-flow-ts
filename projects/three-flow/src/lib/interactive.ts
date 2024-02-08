import { Intersection, Material, MeshBasicMaterialParameters, Vector3 } from "three";
import { DragNode } from "./drag-node";
import { FlowDiagram } from "./diagram";
import { FlowPointerEventType, FlowPointer, FlowPointerLayers } from "./pointer";
import { FlowNode } from "./node";
import { ResizeNode } from "./resize-node";
import { ScaleNode } from "./scale-node";
import { FlowEdgeParameters, FlowEventType, FlowRouteParameters } from "./model";
import { ConnectorMesh } from "./connector";
import { FlowEdge } from "./edge";
import { FlowRoute } from "./route";

export class FlowInteraction {
  private nodes: Array<NodeInteractive> = []
  private connectors: Array<ConnectorInteractive> = []

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

  constructor(public diagram: FlowDiagram, public readonly interactive: FlowPointer) {

    diagram.addEventListener(FlowEventType.NODE_REMOVED, (e: any) => {
      const node = e.node as FlowNode
      const index = this.nodes.findIndex(x => x.node == node)
      if (index != -1) {
        this.nodes[index].dispose()
        this.nodes.splice(index, 1)

        if (node.selectable) node.layers.disable(FlowPointerLayers.SELECTABLE)

      }
    })


    diagram.addEventListener(FlowEventType.NODE_ADDED, (e: any) => {
      const node = e.node as FlowNode
      this.nodes.push(new NodeInteractive(node, this))

      const selectableChanged = () => {
        if (node.selectable)
          node.layers.enable(FlowPointerLayers.SELECTABLE)
        else
          node.layers.disable(FlowPointerLayers.SELECTABLE)
      }
      node.addEventListener(FlowEventType.SELECTABLE_CHANGED, () => { selectableChanged() })
      selectableChanged()
    })

    diagram.addEventListener(FlowEventType.EDGE_REMOVED, (e: any) => {
      const edge = e.edge as FlowEdge
      if (edge.selectable) edge.selectableObject.layers.disable(FlowPointerLayers.SELECTABLE)
    })


    diagram.addEventListener(FlowEventType.EDGE_ADDED, (e: any) => {
      const edge = e.edge as FlowEdge

      const selectableChanged = () => {
        if (edge.selectable)
          edge.selectableObject.layers.enable(FlowPointerLayers.SELECTABLE)
        else
          edge.selectableObject.layers.disable(FlowPointerLayers.SELECTABLE)
      }
      edge.addEventListener(FlowEventType.SELECTABLE_CHANGED, () => { selectableChanged() })
      // give the line a chance to be drawn
      requestAnimationFrame(() => {
        selectableChanged()

        edge.selectableObject.addEventListener(FlowPointerEventType.CLICK, () => {
          if (!edge.selectable) return
          diagram.dispatchEvent<any>({ type: FlowEventType.EDGE_SELECTED, edge })
        })

        edge.selectableObject.addEventListener(FlowPointerEventType.POINTERMISSED, () => {
          diagram.dispatchEvent<any>({ type: FlowEventType.EDGE_SELECTED, edge: undefined })
        })
      })

    })

    diagram.addEventListener(FlowEventType.CONNECTOR_ADDED, (e: any) => {
      const connector = e.connector as ConnectorMesh

      if (connector.selectable || connector.draggable)
        this.connectors.push(new ConnectorInteractive(connector, this))

      if (connector.selectable) {
        const selectableChanged = () => {
          if (connector.selectable)
            connector.layers.enable(FlowPointerLayers.SELECTABLE)
          else
            connector.layers.disable(FlowPointerLayers.SELECTABLE)

        }
        connector.addEventListener(FlowEventType.SELECTABLE_CHANGED, () => { selectableChanged() })
        selectableChanged()
      }

      if (connector.draggable) {
        const draggableChanged = () => {
          if (connector.draggable)
            connector.layers.enable(FlowPointerLayers.DRAGGABLE)
          else
            connector.layers.disable(FlowPointerLayers.DRAGGABLE)
        }
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

        if (connector.selectable) connector.layers.disable(FlowPointerLayers.SELECTABLE)
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

  private _dispose: () => void

  dispose() {
    this.nodes.forEach(node => node.dispose())
    this._dispose()
  }
}

class NodeInteractive {
  private nodeResizer?: ResizeNode
  private nodeDragger: DragNode
  private nodeScaler?: ScaleNode

  dispose = () => { }

  constructor(public node: FlowNode, source: FlowInteraction) {
    const diagram = source.diagram

    node.addEventListener(FlowPointerEventType.CLICK, () => {
      if (!node.selectable) return
      diagram.active = node
      diagram.dispatchEvent<any>({ type: FlowEventType.NODE_SELECTED, node })
    })

    node.addEventListener(FlowPointerEventType.POINTERMISSED, () => {
      if (diagram.active == node) {
        diagram.active = undefined
        diagram.dispatchEvent<any>({ type: FlowEventType.NODE_SELECTED, node: undefined })
      }
    })

    const resizableChanged = () => {
      if (node.resizable) {
        this.nodeResizer = this.createResizer(node, diagram.getMaterial('geometry', 'resizing', node.parameters.resizematerial))
        this.nodeResizer.selectable.forEach(mesh => {
          mesh.layers.enable(FlowPointerLayers.SELECTABLE)
          mesh.layers.enable(FlowPointerLayers.DRAGGABLE)
        })
      }
      else if (this.nodeResizer) {
        this.nodeResizer.stopResizing()
        this.nodeResizer.selectable.forEach(mesh => {
          mesh.layers.disable(FlowPointerLayers.SELECTABLE)
          mesh.layers.disable(FlowPointerLayers.DRAGGABLE)
        })
        this.nodeResizer = undefined
      }
    }
    node.addEventListener(FlowEventType.RESIZABLE_CHANGED, () => { resizableChanged() })
    resizableChanged()

    const scalebleChanged = () => {
      if (node.scalable) {
        this.nodeScaler = this.createScaler(node, diagram.getMaterial('geometry', 'scaling', node.parameters.scalematerial))
        this.nodeScaler.selectable.forEach(mesh => {
          mesh.layers.enable(FlowPointerLayers.SELECTABLE)
          mesh.layers.enable(FlowPointerLayers.DRAGGABLE)
        })
      }
      else if (this.nodeScaler) {
        this.nodeScaler.stopScaling()
        this.nodeScaler.selectable.forEach(mesh => {
          mesh.layers.disable(FlowPointerLayers.SELECTABLE)
          mesh.layers.disable(FlowPointerLayers.DRAGGABLE)
        })
        this.nodeScaler = undefined
      }
    }
    node.addEventListener(FlowEventType.SCALABLE_CHANGED, () => { scalebleChanged() })
    scalebleChanged()

    this.nodeDragger = this.createDragger(node, diagram.gridsize)
    const drag = () => {
      if (node.draggable)
        node.layers.enable(FlowPointerLayers.DRAGGABLE)
      else {
        this.nodeDragger.stopDragging()
        node.layers.disable(FlowPointerLayers.DRAGGABLE)
      }
    }
    node.addEventListener(FlowEventType.DRAGGABLE_CHANGED, () => { drag() })
    drag()

    //
    // To intercept dragged event in derived class, add the following
    //
    // node.addEventListener(FlowEventType.DRAGGED, () => { })
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


    mesh.addEventListener(FlowPointerEventType.CLICK, () => {
      if (!mesh.selectable) return
      diagram.dispatchEvent<any>({ type: FlowEventType.CONNECTOR_SELECTED, connector: mesh })
    })

    mesh.addEventListener(FlowPointerEventType.POINTERMISSED, () => {
      diagram.dispatchEvent<any>({ type: FlowEventType.CONNECTOR_SELECTED, connector: undefined })
    })

    mesh.addEventListener(FlowPointerEventType.POINTERENTER, () => {
      if (!mesh.selectable) {
        document.body.style.cursor = 'not-allowed'
      }
      else {
        //let cursor = mesh.pointerEnter()
        //if (!cursor) cursor = mesh.selectcursor
        //if (cursor)
        //  document.body.style.cursor = cursor
      }
    })
    mesh.addEventListener(FlowPointerEventType.POINTERLEAVE, () => {
      //if (!mesh.selectable) return
      mesh.pointerLeave()
      document.body.style.cursor = 'default'
    })

    let dragStart: Vector3 | undefined
    let flowStart: Vector3 | undefined
    let dragging = false
    mesh.addEventListener(FlowPointerEventType.DRAGSTART, (e: any) => {
      if (!mesh.draggable) return

      dragStart = e.position.clone()
      flowStart = diagram.getFlowPosition(mesh)
      dragging = true
    })

    let newnode: FlowNode | undefined
    let dragroute: FlowRoute | undefined
    let dragedge: FlowEdge | undefined
    let dragDistance = 0
    mesh.addEventListener(FlowPointerEventType.DRAG, (e: any) => {
      if (!mesh.draggable || !dragging) return

      document.body.style.cursor = 'grabbing'

      const selectIntersects = e.selectIntersects as Array<Intersection>
      const dragIntersects = e.dragIntersects as Array<Intersection>

      const position = e.position.clone()
      const diff = position.sub(dragStart) as Vector3
      dragDistance = diff.length()
      if (dragDistance > mesh.startDragDistance) {
        if (!mesh.createOnDrop) {
          if (!newnode) newnode = mesh.dropCompleted(diagram, flowStart!, dragIntersects, selectIntersects)
        }
        else {
          if (!dragroute) {
            const start = flowStart!
            const routeparams: FlowRouteParameters = { x: start.x, y: start.y, dragging: true }
            const edgeparams: FlowEdgeParameters = { from: parentNode.name, to: '', fromconnector: mesh.name, }
            const result = mesh.createDragRoute(routeparams, edgeparams)
            dragroute = result.dragroute
            dragedge = result.dragedge
          }
        }
      }

      dragIntersects.forEach(intersect => {
        if (intersect.object == mesh || intersect.object.type != 'flowconnector') return
        const connector = intersect.object as ConnectorMesh
        mesh.dragOver(connector)
        intersect.object.dispatchEvent<any>({ type: FlowEventType.DRAG_OVER, connector })

        if (connector.canDrop(mesh))
          document.body.style.cursor = 'copy'
        else
          document.body.style.cursor = 'not-allowed'
      })

      if (newnode) {
        newnode.position.copy(position.add(flowStart) as Vector3)
        newnode.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
      }
      if (dragroute) {
        dragroute.position.copy(position.add(flowStart) as Vector3)
        dragroute.dispatchEvent<any>({ type: FlowEventType.DRAGGED })
      }

      if (dragroute && dragedge)
        mesh.dragging(dragedge, dragroute)

    })

    const cancelDrag = () => {
      if (dragroute) diagram.removeNode(dragroute)
      dragroute = undefined
      if (dragedge) diagram.removeEdge(dragedge)
      dragedge = undefined
      dragging = false
    }

    mesh.addEventListener(FlowPointerEventType.DRAGEND, (e: any) => {
      if (!mesh.draggable) return

      if (dragging && dragDistance > mesh.startDragDistance) {
        if (mesh.createOnDrop) {
          if (dragroute)
            mesh.dropCompleted(diagram, diagram.getFlowPosition(dragroute), e.dragIntersects, e.selectIntersects)
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

}
