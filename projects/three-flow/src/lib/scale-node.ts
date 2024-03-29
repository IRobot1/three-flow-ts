import { BufferGeometry, Material, Mesh, PlaneGeometry, Vector3 } from "three"
import { FlowNode } from "./node"
import { FlowPointerEventType } from "./pointer"
import { FlowEventType, FlowHandleParameters } from "./model"

export class ScaleNode {
  readonly selectable: Array<Mesh> = []

  constructor(private node: FlowNode, material: Material) {
    const points = this.createScaleHandles()
    points.forEach(point => {
      const mesh = this.createMesh()
      mesh.name = `scaling${point.id}`
      mesh.material = material

      mesh.visible = false

      this.scaleready(mesh, point.width_direction);

      this.node.addEventListener(FlowEventType.WIDTH_CHANGED, () => {
        point.widthchange(mesh)
      })
      point.widthchange(mesh)

      this.node.addEventListener(FlowEventType.HEIGHT_CHANGED, () => {
        point.heightchange(mesh)
      })
      point.heightchange(mesh)

      this.selectable.push(mesh)
      node.add(mesh)
    })
  }

  stopScaling() {
    this.selectable.forEach(mesh => mesh.dispatchEvent<any>({ type: FlowPointerEventType.DRAGEND }))
  }


  private dragging = false
  private scaleready(mesh: Mesh, direction: number) {
    let startposition: Vector3
    let startscale: number

    mesh.addEventListener(FlowPointerEventType.DRAGSTART, (e: any) => {
      if (!this.node.scalable || this.node.hidden) return

      startposition = e.position.clone()
      startscale = this.node.scale.x
      this.dragging = true
    })

    mesh.addEventListener(FlowPointerEventType.DRAGEND, () => {
      this.dragging = false
      mesh.visible = false
    })

    mesh.addEventListener(FlowPointerEventType.DRAG, (e: any) => {
      if (!this.dragging || !this.node.scalable || this.node.hidden) return

      const diff = e.position.sub(startposition) as Vector3

      // adjust for direction
      diff.multiplyScalar(direction)

      this.node.scalar = startscale - (diff.x * 2 * startscale)
    });

    mesh.addEventListener(FlowPointerEventType.POINTERENTER, () => { if (!this.dragging) mesh.visible = true; });
    mesh.addEventListener(FlowPointerEventType.POINTERLEAVE, () => { mesh.visible = false; });

  }

  // overridable
  createGeometry(size: number): BufferGeometry {
    return new PlaneGeometry(size, size)
  }

  private createMesh(): Mesh {
    const geometry = this.createGeometry(0.1)
    const mesh = new Mesh(geometry)

    mesh.position.z = 0.001

    return mesh
  }

  createScaleHandles(): Array<FlowHandleParameters> {
    const left = <FlowHandleParameters>{
      id: 'left',
      widthchange: (mesh: Mesh) => {
        mesh.position.x = -this.node.width / 2
      },
      heightchange: (mesh: Mesh) => {
        mesh.position.y = -this.node.height / 2
      },
      width_direction: 1,
      height_direction: 0
    }
    const right = <FlowHandleParameters>{
      id: 'right',
      widthchange: (mesh: Mesh) => {
        mesh.position.x = this.node.width / 2
      },
      heightchange: (mesh: Mesh) => {
        mesh.position.y = -this.node.height / 2
      },
      width_direction: -1,
      height_direction: 0
    }


    return [left, right]
  }
}
