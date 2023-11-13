import { BufferGeometry, Material, MathUtils, Mesh, PlaneGeometry, Vector3 } from "three"
import { FlowNode } from "./node"
import { InteractiveEventType } from "./interactive"
import { FlowHandle } from "./model"

export class ScaleNode {
  public enabled = true

  selectable: Array<Mesh> = []

  constructor(private node: FlowNode, material: Material) {
    const points = this.createScaleHandles()
    points.forEach(point => {
      const mesh = this.createMesh()
      mesh.name = `scaling${point.id}`
      mesh.material = material

      mesh.visible = false

      this.scaleready(mesh, point.width_direction);

      this.node.addEventListener('width_change', () => {
        point.widthchange(mesh)
      })
      point.widthchange(mesh)

      this.node.addEventListener('height_change', () => {
        point.heightchange(mesh)
      })
      point.heightchange(mesh)

      this.selectable.push(mesh)
      node.add(mesh)
    })

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
      if (!this.node.scalable) return

      const diff = e.position.sub(startposition) as Vector3

      // adjust for direction
      diff.multiplyScalar(direction)

      this.node.scalar = startscale - (diff.x * 2 * startscale)
    });

    mesh.addEventListener(InteractiveEventType.POINTERENTER, () => { if (!this.scaling) mesh.visible = true; });
    mesh.addEventListener(InteractiveEventType.POINTERLEAVE, () => { mesh.visible = false; });

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

  createScaleHandles(): Array<FlowHandle> {
    const left = <FlowHandle>{
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
    const right = <FlowHandle>{
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
