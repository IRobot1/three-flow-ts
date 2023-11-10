import { Mesh, Shape, ShapeGeometry, BufferGeometry, Material } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font } from "three/examples/jsm/loaders/FontLoader";

import { AbstractNode, AbstractConnector } from "./abstract-model";
import { FlowConnector } from "./connector";
import { FlowGraph } from "./graph";

import { ResizeNode } from "./resize-node";
import { DragNode } from "./drag-node";
import { ScaleNode } from "./scale-node";
import { connect } from "rxjs";

export class FlowNode extends Mesh {
  private _width: number
  get width() { return this._width }
  set width(newvalue: number) {
    if (this._width != newvalue) {
      this._width = newvalue
      this.dispatchEvent<any>({ type: 'width_change' })
      this.resizeGeometry()
      this.moveConnectors()
    }
  }

  private _height: number
  get height() { return this._height }
  set height(newvalue: number) {
    if (this._height != newvalue) {
      this._height = newvalue
      this.dispatchEvent<any>({ type: 'height_change' })
      this.resizeGeometry()
      this.moveConnectors()
    }
  }

  color: number | string;

  label?: string;
  labelsize: number;
  labelcolor: number | string;
  labelfont?: string;

  inputs: AbstractConnector[];
  outputs: AbstractConnector[];

  resizecolor: number | string;

  private _resizable: boolean;
  get resizable() { return this._resizable }
  set resizable(newvalue: boolean) {
    if (this._resizable != newvalue) {
      this._resizable = newvalue;
      if (this.nodeResizer) {
        if (newvalue)
          this.graph.interactive.selectable.add(...this.nodeResizer.selectable)
        else
          this.graph.interactive.selectable.remove(...this.nodeResizer.selectable)
        this.nodeResizer.enabled = newvalue
      }
    }
  }

  private _draggable: boolean;
  get draggable() { return this._draggable }
  set draggable(newvalue: boolean) {
    if (this._draggable != newvalue) {
      this._draggable = newvalue;
      if (this.nodeDragger) {
        if (newvalue)
          this.graph.interactive.selectable.add(this)
        else
          this.graph.interactive.selectable.remove(this)
        this.nodeDragger.enabled = newvalue
      }
    }
  }

  scalecolor: number | string;

  private _scalable: boolean;
  get scalable() { return this._scalable }
  set scalable(newvalue: boolean) {
    if (this._scalable != newvalue) {
      this._scalable = newvalue;
      if (this.nodeScaler) {
        if (newvalue)
          this.graph.interactive.selectable.add(...this.nodeScaler.selectable)
        else
          this.graph.interactive.selectable.remove(...this.nodeScaler.selectable)
        this.nodeScaler.enabled = newvalue
      }
    }
  }

  private _scalar: number
  get scalar() { return this._scalar }
  set scalar(newvalue: number) {
    if (this._scalar != newvalue) {
      this._scalar = newvalue
      this.scale.set(newvalue, newvalue, 1)
      this.dispatchEvent<any>({ type: 'scale_change' })
      this.moveConnectors()
    }
  }

  private labelMesh: Mesh;
  inputConnectors: FlowConnector[] = [];
  outputConnectors: FlowConnector[] = [];

  private nodeResizer: ResizeNode | undefined
  private nodeDragger: DragNode | undefined
  private nodeScaler: ScaleNode | undefined
  private spacing = 0.22

  isFlow = true

  dispose() {
    if (this.nodeResizer) {
      this.graph.interactive.selectable.remove(...this.nodeResizer.selectable)
      this.graph.interactive.draggable.remove(...this.nodeResizer.selectable)
    }
    if (this.nodeDragger) {
      this.graph.interactive.selectable.remove(this)
      this.graph.interactive.draggable.remove(this)
    }
    if (this.nodeScaler) {
      this.graph.interactive.selectable.remove(...this.nodeScaler.selectable)
      this.graph.interactive.draggable.remove(...this.nodeScaler.selectable)
    }
  }

  constructor(private graph: FlowGraph, public node: AbstractNode, private font?: Font) {
    super();

    //@ts-ignore
    this.type = 'flownode'
    this.name = node.text = node.text ?? graph.nodes.length.toString()
    this._width = node.width = node.width ?? 1;
    this._height = node.height = node.height ?? 1;
    this.color = node.color ?? 'white'

    this.label = node.label
    this.labelsize = node.labelsize ?? 0.1
    this.labelcolor = node.labelcolor ?? 'black'
    this.labelfont = node.labelfont

    this.inputs = node.inputs ?? [];
    this.outputs = node.outputs ?? [];
    this._resizable = node.resizable ?? true
    this.resizecolor = node.resizecolor ?? 'black'
    this._draggable = node.draggable ?? true
    this._scalable = node.scaleable ?? true
    this.scalecolor = node.scalecolor ?? 'black'
    this._scalar = node.scale ?? 1

    if (node.userData) this.userData = node.userData;

    this.material = graph.getMaterial('geometry', 'node', this.color);

    if (node.x) this.position.x = node.x
    if (node.y) this.position.y = node.y
    if (node.z) this.position.z = node.z

    this.save = () => {
      if (this.inputs.length > 0) node.inputs = this.inputs
      if (this.outputs.length > 0) node.outputs = this.outputs

      if (this.position.x) node.x = this.position.x
      if (this.position.y) node.y = this.position.y
      if (this.position.z) node.z = this.position.z
    }

    this.labelMesh = new Mesh();
    this.labelMesh.name = 'label'

    const textMaterial = graph.getMaterial('geometry', 'label', this.labelcolor);
    if (this.font && this.label) {
      const geometry = this.createTextGeometry(this.label, { font: this.font, height: 0, size: this.labelsize });
      geometry.center()
      this.labelMesh.geometry = geometry;
    }

    this.labelMesh.material = textMaterial
    this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)

    this.add(this.labelMesh);

    //// Initialize input connectors
    //const starty = this.height / 2 - this.labelsize * 3
    //let y = starty
    //this.inputs.forEach((connector, index) => {
    //  connector.index = index
    //  this.addInputConnector(connector)
    //  //const threeConnector = this.graph.createConnector(graph, connector);
    //  //this.inputConnectors.push(threeConnector);
    //  //this.add(threeConnector);
    //  //threeConnector.position.set(-this.width / 2, y, 0.001)
    //  y -= this.spacing
    //});

    //// Initialize output connectors
    //y = starty
    //this.outputs.forEach((connector, index) => {
    //  connector.index = index
    //  this.addOutputConnector(connector)
    //  const threeConnector = this.graph.createConnector(graph, connector);
    //  this.add(threeConnector);
    //  threeConnector.position.set(this.width / 2, y, 0.001)
    //  y -= this.spacing
    //});

    this.resizeGeometry()
    this.updateVisuals();

    if (this.resizable) {
      const material = graph.getMaterial('geometry', 'resizing', this.resizecolor)
      this.nodeResizer = this.createResizer(this, material)
      this.graph.interactive.selectable.add(...this.nodeResizer.selectable)
      this.graph.interactive.draggable.add(...this.nodeResizer.selectable)
    }

    if (this.draggable) {
      this.nodeDragger = this.createDragger(this, graph.gridsize)
      this.graph.interactive.selectable.add(this)
      this.graph.interactive.draggable.add(this)
    }

    if (this.scalable) {
      const material = graph.getMaterial('geometry', 'scaling', this.scalecolor)
      this.nodeScaler = this.createScaler(this, material)
      this.graph.interactive.selectable.add(...this.nodeScaler.selectable)
      this.graph.interactive.draggable.add(...this.nodeScaler.selectable)
    }

    this.addEventListener('dragged', () => { this.moveNode() })
  }

  private resizeGeometry() {
    this.geometry.dispose()
    this.geometry = this.createGeometry()

    this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)

  }

  private addConnector(data: AbstractConnector): FlowConnector {
    const connector = this.graph.createConnector(this.graph, data)
    this.add(connector)
    this.graph.addConnector(data)
    return connector
  }

  addInputConnector(input: AbstractConnector): FlowConnector {
    input.connectortype = 'input'
    const connector = this.addConnector(input)
    this.inputConnectors.push(connector);

    const index = input.index ?? 0
   connector.position.set(-this.width / 2, this.height / 2 - this.labelsize * 3 - this.spacing * index, 0.001)

    this.updateVisuals()
    return connector
  }

  addOutputConnector(output: AbstractConnector): FlowConnector {
    output.connectortype = 'output'
    const connector = this.addConnector(output)
    this.outputConnectors.push(connector);

    const index = output.index ?? 0
    connector.position.set(this.width / 2, this.height / 2 - this.labelsize * 3 - this.spacing * index, 0.001)

    connector.updateVisuals()
    return connector
  }

  private removeConnector(connector: FlowConnector): void {
    this.remove(connector)
    this.graph.removeConnector(connector.name)
  }

  removeInputConnector(item: FlowConnector): void {
    let index = this.inputs.indexOf(item.connector)
    if (index != -1) this.inputs.splice(index, 1)

    index = this.inputConnectors.indexOf(item)
    if (index != -1) {
      this.inputConnectors.splice(index, 1)
      if (index < this.inputConnectors.length)
        this.moveConnectors()
      this.graph.removeConnectedEdge(item.name)
    }

    this.removeConnector(item)
  }

  removeOutputConnector(item: FlowConnector): void {
    let index = this.outputs.indexOf(item.connector)
    if (index != -1) this.outputs.splice(index, 1)

    index = this.outputConnectors.indexOf(item)
    if (index != -1) {
      this.outputConnectors.splice(index, 1)
      if (index < this.outputConnectors.length)
        this.moveConnectors()

      this.graph.removeConnectedEdge(item.name)
    }

    this.removeConnector(item)
  }

  moveNode() {
    this.dispatchEvent<any>({ type: 'moved' })
    this.moveConnectors()
  }

  moveConnectors() {

    const starty = this.height / 2 - this.labelsize * 3
    let y = starty
    this.inputConnectors.forEach(connector => {
      connector.position.x = -this.width / 2
      connector.position.y = y
      y -= this.spacing
      connector.dispatchEvent<any>({ type: 'moved' })
    })
    y = starty
    this.outputConnectors.forEach(connector => {
      connector.position.x = this.width / 2
      connector.position.y = y
      y -= this.spacing
      connector.dispatchEvent<any>({ type: 'moved' })
    })
  }

  // used when node is moved and edge needs to redraw using new connector position
  getConnector(id: string): FlowConnector | undefined {
    let connector = this.inputConnectors.find(c => c.name == id)
    if (!connector) {
      connector = this.outputConnectors.find(c => c.name == id)
    }
    return connector;
  }

  updateVisuals() {

    const setColor = (material: any, color: number | string) => {
      material.color.set(color)
    }

    // Update connectors
    this.inputConnectors.forEach((connector) => connector.updateVisuals());
    this.outputConnectors.forEach((connector) => connector.updateVisuals());

    setColor(this.material, this.color);
  }

  protected roundedRect(width: number, height: number, radius: number): Shape {
    const ctx = new Shape();
    const halfwidth = width / 2
    const halfheight = height / 2
    ctx.moveTo(-halfwidth + radius, -halfheight);
    ctx.lineTo(halfwidth - radius, -halfheight);
    ctx.quadraticCurveTo(halfwidth, -halfheight, halfwidth, -halfheight + radius);
    ctx.lineTo(halfwidth, halfheight - radius);
    ctx.quadraticCurveTo(halfwidth, halfheight, halfwidth - radius, halfheight);
    ctx.lineTo(-halfwidth + radius, halfheight);
    ctx.quadraticCurveTo(-halfwidth, halfheight, -halfwidth, halfheight - radius);
    ctx.lineTo(-halfwidth, -halfheight + radius);
    ctx.quadraticCurveTo(-halfwidth, -halfheight, -halfwidth + radius, -halfheight);
    ctx.closePath();
    return ctx;
  }

  // overridable
  createGeometry(): BufferGeometry {
    const radius = Math.min(this.width, this.height) * 0.1
    const shape = this.roundedRect(this.width, this.height, radius)
    return new ShapeGeometry(shape)
  }

  createTextGeometry(label: string, options: any): BufferGeometry {
    return new TextGeometry(label, options);
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

  save: () => void

}
