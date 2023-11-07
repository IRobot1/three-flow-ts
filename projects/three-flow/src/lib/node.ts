import { MeshBasicMaterial, Mesh, Shape, ShapeGeometry, BufferGeometry, ExtrudeGeometryOptions, Material } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font } from "three/examples/jsm/loaders/FontLoader";

import { AbstractNode, NodeType, NodeState, AbstractConnector } from "./abstract-model";
import { FlowConnector } from "./connector";
import { FlowDiagram } from "./diagram";

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
      this.moveConnector()
    }
  }

  private _height: number
  get height() { return this._height }
  set height(newvalue: number) {
    if (this._height != newvalue) {
      this._height = newvalue
      this.dispatchEvent<any>({ type: 'height_change' })
      this.resizeGeometry()
      this.moveConnector()
    }
  }

  color: number | string;
  //location: { x: number; y: number; z: number };

  label: string;
  labelsize: number;
  labelcolor: number | string;

  state: NodeState;
  nodetype: NodeType;
  inputs: string[];
  outputs: string[];
  error?: string;
  documentation?: string;
  category: string;

  private _resizable: boolean;
  get resizable() { return this._resizable }
  set resizable(newvalue: boolean) {
    if (this._resizable != newvalue) {
      this._resizable = newvalue;
      if (this.nodeResizer) {
        if (newvalue)
          this.diagram.interactive.selectable.add(...this.nodeResizer.selectable)
        else
          this.diagram.interactive.selectable.remove(...this.nodeResizer.selectable)
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
          this.diagram.interactive.selectable.add(this)
        else
          this.diagram.interactive.selectable.remove(this)
        this.nodeDragger.enabled = newvalue
      }
    }
  }

  private _scalable: boolean;
  get scalable() { return this._scalable }
  set scalable(newvalue: boolean) {
    if (this._scalable != newvalue) {
      this._scalable = newvalue;
      if (this.nodeScaler) {
        if (newvalue)
          this.diagram.interactive.selectable.add(...this.nodeScaler.selectable)
        else
          this.diagram.interactive.selectable.remove(...this.nodeScaler.selectable)
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
      this.moveConnector()
    }
  }


  private labelMesh: Mesh;
  private inputConnectors: FlowConnector[] = [];
  private outputConnectors: FlowConnector[] = [];

  private nodeResizer: ResizeNode | undefined
  private nodeDragger: DragNode | undefined
  private nodeScaler: ScaleNode | undefined
  private spacing = 0.22

  isFlow = true

  dispose() {
    if (this.nodeResizer) {
      this.diagram.interactive.selectable.remove(...this.nodeResizer.selectable)
      this.diagram.interactive.draggable.remove(...this.nodeResizer.selectable)
    }
    if (this.nodeDragger) {
      this.diagram.interactive.selectable.remove(this)
      this.diagram.interactive.draggable.remove(this)
    }
    if (this.nodeScaler) {
      this.diagram.interactive.selectable.remove(...this.nodeScaler.selectable)
      this.diagram.interactive.draggable.remove(...this.nodeScaler.selectable)
    }
  }

  constructor(private diagram: FlowDiagram, node: Partial<AbstractNode>, private font: Font) {
    super();

    //@ts-ignore
    this.type = 'flownode'

    this.name = node.id = node.id ?? diagram.nodes.length.toString()
    this._width = node.width = node.width ?? 1;
    this._height = node.height = node.height ?? 1;
    this.color = node.color = node.color ?? 'white'

    this.label = node.label = node.label ?? '';
    this.labelsize = node.labelsize = node.labelsize ?? 0.1
    this.labelcolor = node.labelcolor = node.labelcolor ?? 'black'

    this.state = node.state = node.state ?? 'default';
    this.nodetype = node.nodetype = node.nodetype ?? 'function';
    this.inputs = node.inputs = node.inputs ?? [];
    this.outputs = node.outputs = node.outputs ?? [];
    this.category = node.category = node.category ?? ''
    this._resizable = node.resizable = node.resizable ?? true
    this._draggable = node.draggable = node.draggable ?? true
    this._scalable = node.scaleable = node.scaleable ?? true
    this._scalar = node.scale = node.scale ?? 1

    this.error = node.error
    this.documentation = node.documentation
    if (node.data) this.userData = node.data;

    this.material = diagram.getMaterial('geometry', 'node', this.color);

    if (node.position) this.position.set(node.position.x, node.position.y, node.position.z);


    // Create a text mesh for the label
    const textMaterial = diagram.getMaterial('geometry', 'label', this.labelcolor);
    this.labelMesh = new Mesh();
    this.labelMesh.material = textMaterial
    this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)

    this.add(this.labelMesh);

    // Initialize input connectors
    const starty = this.height / 2 - this.labelsize * 3
    let y = starty
    this.inputs.forEach(id => {
      const connector = this.diagram.connectors.find(c => c.id == id)
      if (connector) {
        const threeConnector = this.diagram.createConnector(diagram, connector);
        threeConnector.position.set(-this.width / 2, y, 0.001)
        this.inputConnectors.push(threeConnector);
        this.add(threeConnector);

      }
      y -= this.spacing
    });

    // Initialize output connectors
    y = starty
    this.outputs.forEach(id => {
      const connector = this.diagram.connectors.find(c => c.id == id)
      if (connector) {
        const threeConnector = this.diagram.createConnector(diagram, connector);
        threeConnector.position.set(this.width / 2, y, 0.001)
        this.outputConnectors.push(threeConnector);
        this.add(threeConnector);
      }
      y -= this.spacing
    });

    this.resizeGeometry()
    this.updateVisuals();

    if (this.resizable) {
      const material = diagram.getMaterial('geometry', 'resizing', 'white')
      this.nodeResizer = this.createResizer(this, material)
      this.diagram.interactive.selectable.add(...this.nodeResizer.selectable)
      this.diagram.interactive.draggable.add(...this.nodeResizer.selectable)
    }

    if (this.draggable) {
      this.nodeDragger = this.createDragger(this, diagram.gridsize)
      this.diagram.interactive.selectable.add(this)
      this.diagram.interactive.draggable.add(this)
    }

    if (this.scalable) {
      const material = diagram.getMaterial('geometry', 'scaling', 'white')
      this.nodeScaler = this.createScaler(this, material)
      this.diagram.interactive.selectable.add(...this.nodeScaler.selectable)
      this.diagram.interactive.draggable.add(...this.nodeScaler.selectable)
    }

  }

  private resizeGeometry() {
    this.geometry.dispose()
    this.geometry = this.createGeometry()

    this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)

  }

  private addConnector(data: Partial<AbstractConnector>): FlowConnector {
    this.diagram.connectors.push(data)
    const connector = this.diagram.createConnector(this.diagram, data)
    this.add(connector)
    return connector
  }

  addInputConnector(input: Partial<AbstractConnector>): FlowConnector {
    input.connectortype = 'input'
    const connector = this.addConnector(input)

    const index = this.inputConnectors.push(connector) - 1
    this.inputs.push(input.id!)

    connector.position.set(-this.width / 2, this.height / 2 - this.labelsize * 3 - this.spacing * index, 0.001)

    this.updateVisuals()
    return connector
  }

  addOutputConnector(output: Partial<AbstractConnector>): FlowConnector {
    output.connectortype = 'output'
    const connector = this.addConnector(output)

    const index = this.outputConnectors.push(connector) - 1
    this.outputs.push(output.id!)

    connector.position.set(this.width / 2, this.height / 2 - this.labelsize * 3 - this.spacing * index, 0.001)

    this.updateVisuals()
    return connector
  }

  moveConnector() {
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

    // Update the text mesh based on the label and state
    const geometry = this.createTextGeometry(this.label, { font: this.font, height: 0, size: this.labelsize });
    geometry.center()
    this.labelMesh.geometry = geometry;

    const setColor = (material: any, color: number | string) => {
      material.color.set(color)
    }

    // Update connectors
    this.inputConnectors.forEach((connector) => connector.updateVisuals());
    this.outputConnectors.forEach((connector) => connector.updateVisuals());

    //// Update node material based on state
    //switch (this.state) {
    //  case 'selected':
    //    setColor(this.material, 0xaaaaaa);
    //    break;
    //  case 'active':
    //    setColor(this.material, 0x00ff00);
    //    break;
    //  case 'disabled':
    //    setColor(this.material, 0x444444);
    //    break;
    //  default:
    setColor(this.material, this.color);
    //    break;
    //}
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
}
