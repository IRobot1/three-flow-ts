import { Mesh, BufferGeometry, PlaneGeometry, MathUtils } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font } from "three/examples/jsm/loaders/FontLoader";

import { FlowEventType, FlowNodeData } from "./model";
import { FlowGraph } from "./graph";


export class FlowNode extends Mesh {
  protected _width: number
  get width() { return this._width }
  set width(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, this.minwidth, this.maxwidth)
    if (this._width != newvalue) {
      this._width = newvalue
      this.resizeGeometry()
      this.dispatchEvent<any>({ type: FlowEventType.WIDTH_CHANGED })
    }
  }
  minwidth: number;
  maxwidth: number;

  protected _height: number
  get height() { return this._height }
  set height(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, this.minheight, this.maxheight)
    if (this._height != newvalue) {
      this._height = newvalue
      this.resizeGeometry()
      this.dispatchEvent<any>({ type: FlowEventType.HEIGHT_CHANGED })
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

  private _label: string | undefined
  get label() { return this._label }
  set label(newvalue: string | undefined) {
    if (this._label != newvalue) {
      this._label = newvalue;
      if (newvalue) {
        this.updateLabel()
      }
    }
  }

  private _labelsize: number;
  get labelsize() { return this._labelsize }
  set labelsize(newvalue: number) {
    if (this._labelsize != newvalue) {
      this._labelsize = newvalue;
      this.updateLabel()
    }
  }

  private _labelcolor: number | string;
  get labelcolor() { return this._labelcolor }
  set labelcolor(newvalue: number | string) {
    if (this._labelcolor != newvalue) {
      this._labelcolor = newvalue;
      (this.labelMesh.material as any).color.set(newvalue)
    }
  }

  resizecolor: number | string;

  private _resizable: boolean;
  get resizable() { return this._resizable }
  set resizable(newvalue: boolean) {
    if (this._resizable != newvalue) {
      this._resizable = newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.RESIZABLE_CHANGED })
    }
  }

  private _draggable: boolean;
  get draggable() { return this._draggable }
  set draggable(newvalue: boolean) {
    if (this._draggable != newvalue) {
      this._draggable = newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.DRAGGABLE_CHANGED })
    }
  }

  scalecolor: number | string;

  private _scalable: boolean;
  get scalable() { return this._scalable }
  set scalable(newvalue: boolean) {
    if (this._scalable != newvalue) {
      this._scalable = newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.SCALABLE_CHANGED })
    }
  }

  selectable: boolean;

  private _scalar: number
  get scalar() { return this._scalar }
  set scalar(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, this.minscale, this.maxscale)
    if (this._scalar != newvalue) {
      this._scalar = newvalue
      this.scale.set(newvalue, newvalue, 1)
      this.dispatchEvent<any>({ type: FlowEventType.SCALE_CHANGED })
    }
  }
  minscale: number;
  maxscale: number;

  private labelMesh: Mesh;
  private font?: Font;

  isFlow = true

  dispose() {
    this.dispatchEvent<any>({ type: FlowEventType.DISPOSE })
  }


  constructor(public graph: FlowGraph, public node: FlowNodeData) {
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

    this._label = node.label
    this._labelsize = node.labelsize ?? 0.1
    this._labelcolor = node.labelcolor ?? 'black'
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
    this.updateLabel();

    this.labelMesh.material = textMaterial
    this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)

    this.add(this.labelMesh);

    // allow derived classes access to "this" by delaying one frame
    requestAnimationFrame(() => {
      this.resizeGeometry()
      this.updateVisuals();
    })
  }

  private updateLabel() {
    if (this.font && this.label) {
      const geometry = this.createTextGeometry(this.label, { font: this.font, height: 0, size: this.labelsize });
      geometry.center()
      this.labelMesh.geometry = geometry;
    }
  }

  private resizeGeometry() {
    this.geometry.dispose()
    this.geometry = this.createGeometry()

    this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)
  }

  updateVisuals() { }



  // overridable
  createGeometry(): BufferGeometry {
    return new PlaneGeometry(this.width, this.height)
  }

  createTextGeometry(label: string, options: any): BufferGeometry {
    return new TextGeometry(label, options);
  }


  save: () => void

}
