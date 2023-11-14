import { BufferGeometry, Mesh, Shape, ShapeGeometry } from "three";
import { FkiwArrowData, ArrowStyle } from "./model";
import { FlowEdge } from "./edge";


export class FlowArrow extends Mesh {

  private _color: number | string;
  get color() { return this._color }
  set color(newvalue: number | string) {
    if (this._color != newvalue) {
      this._color = newvalue;
      (this.material as any).color.set(newvalue)
    }
  }

  protected _width: number
  get width() { return this._width }
  set width(newvalue: number) {
    newvalue = Math.max(0, newvalue)
    if (this._width != newvalue) {
      this._width = newvalue
      this.updateVisuals()
    }
  }

  protected _height: number
  get height() { return this._height }
  set height(newvalue: number) {
    newvalue = Math.max(0, newvalue)
    if (this._height != newvalue) {
      this._height = newvalue
      this.updateVisuals()
    }
  }

  protected _indent: number
  get indent() { return this._indent }
  set indent(newvalue: number) {
    newvalue = Math.max(0, newvalue)
    if (this._indent != newvalue) {
      this._indent = newvalue
      this.updateVisuals()
    }
  }

  arrowstyle: ArrowStyle;

  private _rotate = 0
  get rotate() { return this._rotate }
  set rotate(newvalue: number) {
    if (this._rotate != newvalue) {
      const diff = newvalue - this._rotate;
      this._rotate = newvalue;
      this.rotation.z += diff
    }
  }

  private _scalar: number
  get scalar() { return this._scalar }
  set scalar(newvalue: number) {
    newvalue = Math.max(0, newvalue)
    if (this._scalar != newvalue) {
      this._scalar = newvalue
      this.scale.set(newvalue, newvalue, 1)
    }
  }

  constructor(edge: FlowEdge, public arrow: FkiwArrowData) {
    super()

    this._color = arrow.color ?? 0x000000
    this._width = arrow.width ?? 0.15
    this._height = arrow.height ?? 0.3
    this._indent = arrow.indent ?? 0.05

    this.arrowstyle = arrow.arrowstyle ?? 'default'

    this.material = edge.graph.getMaterial('geometry', 'arrow', this.color)
    this.updateVisuals()

    this._scalar = arrow.scale ?? 1

  }

  updateVisuals() {
    this.geometry = this.createArrow(this.arrowstyle)
  }

  createArrow(style: ArrowStyle): BufferGeometry {
    const shape = new Shape()
      .lineTo(-this.width, this.height + this.indent)
      .lineTo(0, this.height)
      .lineTo(this.width, this.height + this.indent)

    return new ShapeGeometry(shape);
  }
}
