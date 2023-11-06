import { Material, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from "three"
import { FlowNode } from "./node"
import { InteractiveEventType } from "./interactive"

export class ScaleNode {
  public enabled = true

  selectable: Array<Mesh> = []

  constructor(private node: FlowNode, material: Material) {

    const leftscaling = this.buildMesh('scaling', 'bottom-left')
    leftscaling.material = material

    const rightscaling = this.buildMesh('scaling', 'bottom-right')
    rightscaling.material = material

    this.addScaling(leftscaling, rightscaling)

    this.selectable.push(leftscaling, rightscaling)

  }

  private buildMesh(type: string, position: string): Mesh {
    const geometry = new PlaneGeometry(0.1, 0.1)
    const mesh = new Mesh(geometry)

    mesh.name = `${type}${position}`
    mesh.position.z = 0.001

    return mesh
  }



  addScaling(left: Mesh, right: Mesh) {

    this.node.add(left, right);

    left.position.x = -this.node.width / 2
    left.position.y = - this.node.height / 2
    left.visible = false

    this.scaleready(left, 1);

    this.node.addEventListener('width_change', () => {
      left.position.x = -this.node.width / 2
      right.position.x = this.node.width / 2
    })
    this.node.addEventListener('height_change', () => {
      left.position.y = -this.node.height / 2
      right.position.y = -this.node.height / 2
    })

    right.position.x = this.node.width / 2
    right.position.y = - this.node.height / 2
    right.visible = false

    this.scaleready(right, -1);

  }

  private scaling = false

  private scaleready(mesh: Mesh, direction: number) {
    let startposition: Vector3
    let startscale: number

    mesh.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
      startposition = e.position.clone()
      startscale = this.node.scale.x
      this.scaling = true
    })

    mesh.addEventListener(InteractiveEventType.DRAGEND, () => {
      this.scaling = false
      mesh.visible = false
    })

    mesh.addEventListener(InteractiveEventType.DRAG, (e: any) => {
      const diff = e.position.sub(startposition) as Vector3

      // adjust for direction
      diff.multiplyScalar(direction)

      // only scale my horizontal movement in order to keep aspect ratio the same
      //const scale = MathUtils.clamp(startscale - diff.x * 2, this.minscale, this.maxscale)
      const scale = startscale - diff.x * 2
      this.node.scalar = scale
    });

    mesh.addEventListener(InteractiveEventType.POINTERENTER, () => { if (!this.scaling) mesh.visible = true; });
    mesh.addEventListener(InteractiveEventType.POINTERLEAVE, () => { mesh.visible = false; });

  }
}
