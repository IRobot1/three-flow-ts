import { BufferGeometry, Material, MathUtils, Mesh, PlaneGeometry, Vector3 } from "three";
import { InteractiveEventType } from "./interactive";
import { FlowNode } from "./node";
import { FlowEventType, FlowHandleParameters } from "./model";

export class ResizeNode {
  public enabled = true

  selectable: Array<Mesh> = []

  constructor(private node: FlowNode, material: Material) {
    const points = this.createResizeHandles()
    points.forEach(point => {
      const mesh = this.createMesh()
      mesh.name = `resizing${point.id}`
      mesh.material = material

      mesh.visible = false

      this.resizeready(mesh, point.width_direction, point.height_direction);

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

  private dragging = false
  private resizeready(mesh: Mesh, width_direction = 1, height_direction = 1) {

    let startposition: Vector3
    let startwidth: number
    let startheight: number

    mesh.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
      if (!this.enabled) return
      startposition = e.position.clone()
      startwidth = this.node.width
      startheight = this.node.height
      this.dragging = true
    })
    mesh.addEventListener(InteractiveEventType.DRAGEND, () => {
      if (!this.enabled) return
      this.dragging = false
      mesh.visible = false
    })

    mesh.addEventListener(InteractiveEventType.DRAG, (e: any) => {
      if (!this.enabled) return
      const diff = e.position.sub(startposition) as Vector3

      if (width_direction) {
        diff.x *= width_direction

        this.node.width = startwidth - diff.x * 2
      }

      if (height_direction) {
        diff.y *= height_direction

        this.node.height = startheight - diff.y * 2
      }
    });


    mesh.addEventListener(InteractiveEventType.POINTERENTER, (e: any) => { if (!this.dragging) mesh.visible = true });
    mesh.addEventListener(InteractiveEventType.POINTERLEAVE, (e: any) => { mesh.visible = false; });
  }

  // overridable
  createMesh(): Mesh {
    const geometry = this.createGeometry(0.1)
    const mesh = new Mesh(geometry)

    mesh.position.z = 0.001
    return mesh
  }


  createGeometry(size: number): BufferGeometry {
    return new PlaneGeometry(size, size)
  }

  createResizeHandles(): Array<FlowHandleParameters> {
    const left = <FlowHandleParameters>{
      id: 'left',
      widthchange: (mesh: Mesh) => {
        mesh.position.x = -this.node.width / 2
      },
      heightchange: (mesh: Mesh) => {
        mesh.position.y = this.node.height / 2 - this.node.labelsize * 1.2
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
        mesh.position.y = this.node.height / 2 - this.node.labelsize * 1.2
      },
      width_direction: -1,
      height_direction: 0
    }
    const bottom = <FlowHandleParameters>{
      id: 'bottom',
      widthchange: (mesh: Mesh) => {
      },
      heightchange: (mesh: Mesh) => {
        mesh.position.y = -this.node.height / 2
      },
      width_direction: 0,
      height_direction: 1
    }

    return [left, right, bottom]
  }

}
