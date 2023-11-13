import { Mesh, BufferGeometry, PlaneGeometry } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font } from "three/examples/jsm/loaders/FontLoader";

import { AbstractNode } from "./abstract-model";
import { FlowGraph } from "./graph";


export class FlowNode extends Mesh {
  protected _width: number
  get width() { return this._width }
  set width(newvalue: number) {
    if (this._width != newvalue) {
      this._width = newvalue
      this.resizeGeometry()
      this.dispatchEvent<any>({ type: 'width_change' })
    }
  }
  minwidth: number;
  maxwidth: number;

  protected _height: number
  get height() { return this._height }
  set height(newvalue: number) {
    if (this._height != newvalue) {
      this._height = newvalue
      this.resizeGeometry()
      this.dispatchEvent<any>({ type: 'height_change' })
    }
  }
  minheight: number;
  maxheight: number;

  private _color: number | string;
  get color() { return this._color }
  set color(newvalue: number | string) {
    if (this._color != newvalue) {
      this._color = newvalue;
      (this.material as any).color.set(newvalue)
    }
  }

  label?: string;
  labelsize: number;
  labelcolor: number | string;

  resizecolor: number | string;

  private _resizable: boolean;
  get resizable() { return this._resizable }
  set resizable(newvalue: boolean) {
    if (this._resizable != newvalue) {
      this._resizable = newvalue;
      this.dispatchEvent<any>({ type: 'resizable_change' })
    }
  }

  private _draggable: boolean;
  get draggable() { return this._draggable }
  set draggable(newvalue: boolean) {
    if (this._draggable != newvalue) {
      this._draggable = newvalue;
      this.dispatchEvent<any>({ type: 'draggable_change' })
    }
  }

  scalecolor: number | string;

  private _scalable: boolean;
  get scalable() { return this._scalable }
  set scalable(newvalue: boolean) {
    if (this._scalable != newvalue) {
      this._scalable = newvalue;
      this.dispatchEvent<any>({ type: 'scalable_change' })
    }
  }

  selectable: boolean;

  private _scalar: number
  get scalar() { return this._scalar }
  set scalar(newvalue: number) {
    if (this._scalar != newvalue) {
      this._scalar = newvalue
      this.scale.set(newvalue, newvalue, 1)
      this.dispatchEvent<any>({ type: 'scale_change' })
    }
  }
  minscale: number;
  maxscale: number;

  private labelMesh: Mesh;
  private font?: Font;

  isFlow = true

  dispose() {
    this.dispatchEvent<any>({ type: 'dispose' })
  }


  constructor(public graph: FlowGraph, public node: AbstractNode) {
    super();

    //@ts-ignore
    this.type = 'flownode'
    this.name = node.text = node.text ?? graph.nodes.length.toString()
    node.type = node.type ?? 'node'

    this._width = node.width = node.width ?? 1;
    this.minwidth = node.minwidth ?? this.width
    this.maxwidth = node.maxwidth ?? Number.POSITIVE_INFINITY

    this._height = node.height = node.height ?? 1;
    this.minheight = node.minheight ?? this.height;
    this.maxheight = node.maxheight ?? Number.POSITIVE_INFINITY
    this._color = node.color ?? 'white'

    this.label = node.label
    this.labelsize = node.labelsize ?? 0.1
    this.labelcolor = node.labelcolor ?? 'black'
    this.font = graph.getFont(node.labelfont)

    this._resizable = node.resizable ?? true
    this.resizecolor = node.resizecolor ?? 'black'
    this._draggable = node.draggable ?? true
    this._scalable = node.scalable ?? true
    this.selectable = node.selectable ?? true
    this.scalecolor = node.scalecolor ?? 'black'

    this._scalar = node.scale ?? 1
    this.minscale = node.minscale ?? this.scalar;
    this.maxscale = node.maxscale ?? Number.POSITIVE_INFINITY;

    if (node.userData) this.userData = node.userData;

    this.material = graph.getMaterial('geometry', 'node', this.color);

    if (node.x) this.position.x = node.x
    if (node.y) this.position.y = node.y
    if (node.z) this.position.z = node.z

    this.save = () => {
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

    // allow derived classes access to "this" by delaying one frame
    requestAnimationFrame(() => {
      this.resizeGeometry()
      this.updateVisuals();
    })
  }

  private resizeGeometry() {
    this.geometry.dispose()
    this.geometry = this.createGeometry()

    this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)
  }

  updateVisuals() {  }



  // overridable
  createGeometry(): BufferGeometry {
    return new PlaneGeometry(this.width, this.height)
  }

  createTextGeometry(label: string, options: any): BufferGeometry {
    return new TextGeometry(label, options);
  }


  save: () => void

}
