import { MeshBasicMaterial, Mesh, Shape, ShapeGeometry, BufferGeometry, ExtrudeGeometryOptions } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font } from "three/examples/jsm/loaders/FontLoader";

import { AbstractNode, NodeType, NodeState, AbstractConnector } from "./abstract-model";
import { FlowConnector } from "./connector";
import { FlowDiagram } from "./diagram";

import { ResizeNode } from "./resize-node";
import { DragNode } from "./drag-node";
import { ScaleNode } from "./scale-node";

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
  labelcolor: string;

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

  constructor(private diagram: FlowDiagram, node: AbstractNode, private font: Font) {
    super();

    //@ts-ignore
    this.type = 'flownode'

    this.name = node.nodeid;
    this._width = node.width;
    this._height = node.height;
    this.color = node.color

    this.label = node.label;
    this.state = node.state;
    this.nodetype = node.nodetype;
    this.inputs = node.inputs;
    this.outputs = node.outputs;
    this.error = node.error;
    this.documentation = node.documentation;
    if (node.data) this.userData = node.data;
    this.category = node.category
    this._resizable = node.resizable
    this._draggable = node.draggable
    this._scalable = node.scaleable
    this._scalar = node.scale;
    this.labelsize = node.labelsize
    this.labelcolor = node.labelcolor

    this.material = diagram.getMaterial('geometry', 'node', this.color);

    this.position.set(node.position.x, node.position.y, node.position.z);


    // Create a text mesh for the label
    const textMaterial = diagram.getMaterial('geometry', 'label', 'white');
    this.labelMesh = new Mesh();
    this.labelMesh.material = textMaterial
    this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)

    this.add(this.labelMesh);

    // Initialize input connectors
    const starty = this.height / 2 - this.labelsize * 3
    let y = starty
    this.inputs.forEach(id => {
      const connector = this.diagram.connectors.find(c => c.connectorid == id)
      if (connector) {
        const threeConnector = this.diagram.createConnector(diagram, connector);
        threeConnector.position.set(-this.width / 2, y, 0.001)
        this.inputConnectors.push(threeConnector);
        this.add(threeConnector);

      }
      y -= 0.22
    });

    // Initialize output connectors
    y = starty
    this.outputs.forEach(id => {
      const connector = this.diagram.connectors.find(c => c.connectorid == id)
      if (connector) {
        const threeConnector = this.diagram.createConnector(diagram, connector);
        threeConnector.position.set(this.width / 2, y, 0.001)
        this.outputConnectors.push(threeConnector);
        this.add(threeConnector);
      }
      y -= 0.22
    });

    this.resizeGeometry()
    this.updateVisuals();

    if (this.resizable) {
      const material = diagram.getMaterial('geometry', 'resizing', 'white')
      this.nodeResizer = new ResizeNode(this, material)
      this.diagram.interactive.selectable.add(...this.nodeResizer.selectable)
      this.diagram.interactive.draggable.add(...this.nodeResizer.selectable)
    }

    if (this.draggable) {
      this.nodeDragger = new DragNode(this)
      this.diagram.interactive.selectable.add(this)
      this.diagram.interactive.draggable.add(this)
    }

    if (this.scalable) {
      const material = diagram.getMaterial('geometry', 'scaling', 'white')
      this.nodeScaler = new ScaleNode(this, material)
      this.diagram.interactive.selectable.add(...this.nodeScaler.selectable)
      this.diagram.interactive.draggable.add(...this.nodeScaler.selectable)
    }

  }

  private resizeGeometry() {
    this.geometry.dispose()
    this.geometry = this.createGeometry()

    this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)

  }

  moveConnector() {
    const starty = this.height / 2 - this.labelsize * 3
    let y = starty
    this.inputConnectors.forEach(connector => {
      connector.position.x = -this.width / 2
      connector.position.y = y
      y -= 0.22
      connector.dispatchEvent<any>({ type: 'moved' })
    })
    y = starty
    this.outputConnectors.forEach(connector => {
      connector.position.x = this.width / 2
      connector.position.y = y
      y -= 0.22
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

    // Update node material based on state
    switch (this.state) {
      case 'selected':
        setColor(this.material, 0xaaaaaa);
        break;
      case 'active':
        setColor(this.material, 0x00ff00);
        break;
      case 'disabled':
        setColor(this.material, 0x444444);
        break;
      default:
        setColor(this.material, this.color);
        break;
    }
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

  createTextGeometry(label: string, options: any) {
    return new TextGeometry(label, options);
  }


}
