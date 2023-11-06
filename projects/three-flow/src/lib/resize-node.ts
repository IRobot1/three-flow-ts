import { EventDispatcher, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from "three";
import { FlowNode } from "./node";
import { FlowInteractive, InteractiveEventType } from "./interactive";


export class ResizeNode extends EventDispatcher {

  dispose = () => { }

  constructor(private node: FlowNode, interactive: FlowInteractive) {
    super()

    const material = new MeshBasicMaterial({ color: 'white' })

    const leftresizing = this.buildMesh('resizing', 'left', interactive)
    leftresizing.material = material

    const rightresizing = this.buildMesh('resizing', 'right', interactive)
    rightresizing.material = material

    const bottomresizing = this.buildMesh('resizing', 'bottom', interactive)
    bottomresizing.material = material

    this.addResizing(leftresizing, rightresizing, bottomresizing)

    this.dispose = () => {
      interactive.selectable.remove(leftresizing, rightresizing, bottomresizing)
      interactive.draggable.remove(leftresizing, rightresizing, bottomresizing)
    }

  }

  private buildMesh(type: string, position: string, interactive: FlowInteractive): Mesh {
    const geometry = new PlaneGeometry(0.1, 0.1)
    const mesh = new Mesh(geometry)

    mesh.name = `${type}${position}`
    mesh.position.z = 0.001

    interactive.selectable.add(mesh)
    interactive.draggable.add(mesh)

    return mesh
  }

  addResizing(left: Mesh, right: Mesh, bottom: Mesh) {
    this.node.add(left, right, bottom);
    left.position.x = -this.node.width / 2
    left.visible = false

    this.resizeready(left, 1, 0);

    this.node.addEventListener('width_change', () => {
      left.position.x = -this.node.width / 2
      right.position.x = this.node.width / 2
    })

    right.position.x = this.node.width / 2
    right.visible = false

    this.resizeready(right, -1, 0);

    bottom.position.y = -this.node.height / 2
    bottom.visible = false

    this.resizeready(bottom, 0);

    this.node.addEventListener('height_change', () => { bottom.position.y = -this.node.height / 2 })

  }

  private dragging = false
  private resizeready(mesh: Mesh, width_direction = 1, height_direction = 1) {

    let startposition: Vector3
    let startwidth: number
    let startheight: number

    mesh.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
      startposition = e.position.clone()
      startwidth = this.node.width
      startheight = this.node.height
      this.dragging = true
    })
    mesh.addEventListener(InteractiveEventType.DRAGEND, () => {
      this.dragging = false
      mesh.visible = false
    })

    mesh.addEventListener(InteractiveEventType.DRAG, (e: any) => {
      const diff = e.position.sub(startposition) as Vector3

      if (width_direction) {
        diff.x *= width_direction

        // clamp width between min and max
        //this.node.width = MathUtils.clamp(startwidth - diff.x * 2, this.node.minwidth, this.node.maxwidth)
        this.node.width = startwidth - diff.x * 2
      }

      if (height_direction) {
        diff.y *= height_direction

        // clamp height between min and max
        //this.height = MathUtils.clamp(startheight - diff.y * 2, this.node.minheight, this.node.maxheight)
        this.node.height = startheight - diff.y * 2
      }
      //e.stop = true;
    });


    mesh.addEventListener(InteractiveEventType.POINTERENTER, (e: any) => { if (!this.dragging) mesh.visible = true });
    mesh.addEventListener(InteractiveEventType.POINTERLEAVE, (e: any) => { mesh.visible = false; });
  }


}
