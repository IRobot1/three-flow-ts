import { BufferGeometry, Object3D } from "three";
import { FlowTransform } from "./model";
import { MathUtils } from "three/src/math/MathUtils";

export class FlowUtils {
  static transformObject(transform: FlowTransform, object: Object3D) {
    if (transform.rotate) {
      if (transform.rotate.x) object.rotateX(MathUtils.degToRad(transform.rotate.x))
      if (transform.rotate.y) object.rotateY(MathUtils.degToRad(transform.rotate.y))
      if (transform.rotate.z) object.rotateZ(MathUtils.degToRad(transform.rotate.z))
    }
    if (transform.translate) {
      if (transform.translate.x) object.translateX(transform.translate.x)
      if (transform.translate.y) object.translateY(transform.translate.y)
      if (transform.translate.z) object.translateZ(transform.translate.z)
    }
  }

  static transformGeometry(transform: FlowTransform, geometry: BufferGeometry) {
    if (transform.rotate) {
      if (transform.rotate.x) geometry.rotateX(MathUtils.degToRad(transform.rotate.x))
      if (transform.rotate.y) geometry.rotateY(MathUtils.degToRad(transform.rotate.y))
      if (transform.rotate.z) geometry.rotateZ(MathUtils.degToRad(transform.rotate.z))
    }
    if (transform.translate) {
      let x = 0, y = 0, z = 0
      if (transform.translate.x) x = transform.translate.x
      if (transform.translate.y) y = transform.translate.y
      if (transform.translate.z) z = transform.translate.z
      geometry.translate(x, y, z)
    }
  }
}
