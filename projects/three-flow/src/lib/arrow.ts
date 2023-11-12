import { BufferGeometry, CylinderGeometry, Mesh, Shape, ShapeGeometry, Vector3 } from "three";
import { AbstractArrow, ArrowStyle } from "./abstract-model";
import { FlowEdge } from "./edge";
import { MathUtils } from "three/src/math/MathUtils";


export class FlowArrow extends Mesh {
  color: number | string;
  width: number;
  height: number;
  indent: number;


  constructor(edge: FlowEdge, public arrow: AbstractArrow) {
    super()

    this.color = arrow.color ?? 'black'
    this.width = arrow.width ?? 0.15
    this.height = arrow.height ?? 0.3
    this.indent = arrow.indent ?? 0.05

    this.material = edge.graph.getMaterial('geometry', 'arrow', this.color)
    this.geometry = this.createArrow(arrow.arrowstyle ?? 'default')

    if (arrow.translate) this.geometry.translate(0, -arrow.translate, 0)

    this.scale.setScalar(arrow.scale ?? 1)
  }


  createArrow(style: ArrowStyle): BufferGeometry {
    const shape = new Shape()
      .lineTo(-this.width, this.height + this.indent)
      .lineTo(0, this.height)
      .lineTo(this.width, this.height + this.indent)

    return new ShapeGeometry(shape);
  }
}
