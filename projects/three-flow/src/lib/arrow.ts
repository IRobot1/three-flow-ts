import { BufferGeometry, ColorRepresentation, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Shape, ShapeGeometry } from "three";
import { FlowArrowParameters, ArrowStyle } from "./model";
import { FlowEdge } from "./edge";
import { FlowDiagram } from "./diagram";


export class FlowArrow extends Mesh {

  private _matparams!: MeshBasicMaterialParameters
  get color() { return this._matparams.color! }
  set color(newvalue: ColorRepresentation) {
    if (this._matparams.color != newvalue) {
      this._matparams.color = newvalue;
      (this.material as MeshBasicMaterial).color.set(newvalue)
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

  private _scalar = 1
  get scalar() { return this._scalar }
  set scalar(newvalue: number) {
    newvalue = Math.max(0, newvalue)
    if (this._scalar != newvalue) {
      this._scalar = newvalue
      this.scale.set(newvalue, newvalue, 1)
    }
  }

  offset: number

  constructor(diagram: FlowDiagram, public arrow: FlowArrowParameters) {
    super()

    this._matparams = arrow.material ? arrow.material : { color: 'black' }
    this._width = arrow.width != undefined ? arrow.width : 0.15
    this._height = arrow.height != undefined ? arrow.height : 0.3
    this._indent = arrow.indent != undefined ? arrow.indent : 0.05
    this.offset = arrow.offset != undefined ? arrow.offset : 0.1

    this.arrowstyle = arrow.arrowstyle ? arrow.arrowstyle : 'default'

    this.material = diagram.getMaterial('geometry', 'arrow', this._matparams)
    this.updateVisuals()

    this.scalar = arrow.scale != undefined ? arrow.scale : 1 / 3


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
