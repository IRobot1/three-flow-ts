import { BufferGeometry, ColorRepresentation, MathUtils, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, Shape, ShapeGeometry, Vector3 } from "three";
import { PanelParameters, UIOptions } from "./model";
import { FontCache } from "./cache";
import { FlowMaterials, InteractiveEventType, RoundedRectangleBorderShape, RoundedRectangleShape } from "three-flow";

export interface PanelOptions extends UIOptions {
}

export enum PanelEventType {
  WIDTH_CHANGED = 'width_changed',
  HEIGHT_CHANGED = 'height_changed',
  DEPTH_CHANGED = 'depth_changed',
  RADIUS_CHANGED = 'radius_changed',
  COLOR_CHANGED = 'color_changed',
  DRAGGABLE_CHANGED = 'draggable_changed',
  SELECTABLE_CHANGED = 'selectable_changed',
  PANEL_DRAGGED = 'panel_dragged',
}


export class UIPanel extends Mesh {
  protected _width = 1
  get width() { return this._width }
  set width(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, this.minwidth, this.maxwidth)
    if (this._width != newvalue) {
      const diff = newvalue - this._width
      this._width = newvalue
      this._resizeGeometry()

      this.dispatchEvent<any>({ type: PanelEventType.WIDTH_CHANGED, diff })
    }
  }
  minwidth: number;
  maxwidth: number;

  protected _height: number
  get height() { return this._height }
  set height(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, this.minheight, this.maxheight)
    if (this._height != newvalue) {
      const diff = newvalue - this._height
      this._height = newvalue
      this._resizeGeometry()

      this.dispatchEvent<any>({ type: PanelEventType.HEIGHT_CHANGED, diff })
    }
  }
  minheight: number;
  maxheight: number;

  //lockaspectratio: boolean;


  protected _depth: number
  get depth() { return this._depth }
  set depth(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, this.mindepth, this.maxdepth)
    if (this._depth != newvalue) {
      const diff = newvalue - this._depth
      this._depth = newvalue
      this._resizeGeometry()

      this.dispatchEvent<any>({ type: PanelEventType.DEPTH_CHANGED, diff })
    }
  }
  mindepth: number;
  maxdepth: number;

  protected _radius: number
  get radius() { return this._radius }
  set radius(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, 0, this.height/2)
    if (this._radius != newvalue) {
      this._radius = newvalue
      this._resizeGeometry()
      this.dispatchEvent<any>({ type: PanelEventType.RADIUS_CHANGED })
    }
  }

  autogrow: boolean
  autoshrink: boolean

  private _fill!: MeshBasicMaterialParameters
  get color() { return this._fill.color! }
  set color(newvalue: ColorRepresentation) {
    if (this._fill.color != newvalue) {
      this._fill.color = newvalue;
      (this.material as MeshBasicMaterial).color.set(newvalue)
      this.dispatchEvent<any>({ type: PanelEventType.COLOR_CHANGED })
    }
  }


  private _draggable: boolean;
  get draggable() { return this._draggable }
  set draggable(newvalue: boolean) {
    if (this._draggable != newvalue) {
      this._draggable = newvalue;
      this.dispatchEvent<any>({ type: PanelEventType.DRAGGABLE_CHANGED })
    }
  }

  private _selectable: boolean;
  get selectable() { return this._selectable }
  set selectable(newvalue: boolean) {
    if (this._selectable != newvalue) {
      this._selectable = newvalue;
      this.dispatchEvent<any>({ type: PanelEventType.SELECTABLE_CHANGED })
    }
  }

  protected fontCache: FontCache;
  protected materials: FlowMaterials;
  protected clicking = false
  private borderMesh?: Mesh
  private borderWidth?: number

  private highlightMesh: Mesh
  private highlightWidth: number

  dragging = false

  constructor(protected parameters: PanelParameters = {}, protected options: PanelOptions) {
    super()

    this.name = parameters.id != undefined ? parameters.id : 'panel'

    this.fontCache = options.fontCache != undefined ? options.fontCache : new FontCache(true)
    this.materials = options.materials != undefined ? options.materials : new FlowMaterials()


    if (parameters.position) {
      if (parameters.position.x != undefined) this.position.x = parameters.position.x
      if (parameters.position.y != undefined) this.position.y = parameters.position.y
      if (parameters.position.z != undefined) this.position.z = parameters.position.z
    }
    if (parameters.rotation) {
      if (parameters.rotation.x != undefined) this.rotation.x = parameters.rotation.x
      if (parameters.rotation.y != undefined) this.rotation.y = parameters.rotation.y
      if (parameters.rotation.z != undefined) this.rotation.z = parameters.rotation.z
    }
    if (parameters.scale) {
      if (parameters.scale.x != undefined) this.scale.x = parameters.scale.x
      if (parameters.scale.y != undefined) this.scale.y = parameters.scale.y
      if (parameters.scale.z != undefined) this.scale.z = parameters.scale.z
    }

    this._width = parameters.width != undefined ? parameters.width : 1
    this.minwidth = parameters.minwidth != undefined ? parameters.minwidth : this.width / 10
    this.maxwidth = parameters.maxwidth != undefined ? parameters.maxwidth : Number.POSITIVE_INFINITY

    this._height = parameters.height != undefined ? parameters.height : 1
    this.minheight = parameters.minheight != undefined ? parameters.minheight : this.height / 10;
    this.maxheight = parameters.maxheight != undefined ? parameters.maxheight : Number.POSITIVE_INFINITY

    this._radius = parameters.radius != undefined ? parameters.radius : 0.02

    //this.lockaspectratio = p.lockaspectratio ? p.lockaspectratio : false

    this._depth = parameters.depth != undefined ? parameters.depth : 0
    this.mindepth = parameters.mindepth != undefined ? parameters.mindepth : this.depth;
    this.maxdepth = parameters.maxdepth != undefined ? parameters.maxdepth : Number.POSITIVE_INFINITY

    this.autogrow = parameters.autogrow != undefined ? parameters.autogrow : false
    this.autoshrink = parameters.autoshrink != undefined ? parameters.autoshrink : false

    if (parameters.fill) {
      this._fill = parameters.fill
      this.material = this.materials.getMaterial('geometry', this.name, this._fill)!;
    }
    else {
      // match the default provided by three
      parameters.fill = this._fill = { color: '#fff' }
    }

    this._selectable = parameters.selectable != undefined ? parameters.selectable : true
    this._draggable = parameters.draggable != undefined ? parameters.draggable : false

    this.userData = parameters.value

    if (parameters.border) {
      const borderParams = parameters.border ? parameters.border : {}
      if (!borderParams.material) borderParams.material = { color: 'gray' }
      this.borderWidth = borderParams.width != undefined ? borderParams.width : 0.02

      const borderMesh = new Mesh()
      borderMesh.material = this.materials.getMaterial('geometry', 'border', borderParams.material);
      this.add(borderMesh)
      borderMesh.position.z = 0.001
      borderMesh.name = 'border'
      this.borderMesh = borderMesh
    }

    const highlightParams = parameters.highlight ? parameters.highlight : {}
    if (!highlightParams.material) highlightParams.material = { color: 'black' }
    this.highlightWidth = highlightParams.width != undefined ? highlightParams.width : 0.02

    const highlightMesh = new Mesh()
    highlightMesh.material = this.materials.getMaterial('geometry', 'highlight', highlightParams.material);
    highlightMesh.visible = false
    this.add(highlightMesh)
    highlightMesh.position.z = 0.001
    highlightMesh.name = 'highlight'
    this.highlightMesh = highlightMesh

    const highlightable = parameters.highlightable != undefined ? parameters.highlightable : true

    if (highlightable) {
      const highlight = () => {
        highlightMesh.visible = true
        this.highlight()
      }

      this.addEventListener(InteractiveEventType.POINTERENTER, (e: any) => {
        if (this.clicking || !this.visible) return
        e.stop = true
        if (this.selectable) highlight()
      })

      const unhighlight = () => {
        highlightMesh.visible = false
        this.unhighlight()
      }

      this.addEventListener(InteractiveEventType.POINTERLEAVE, (e:any) => {
        if (this.selectable) unhighlight()
      })

      this.isHighlighted = () => { return highlightMesh.visible }
    }

    // allow derived classes access to "this" by delaying one frame or to override methods
    requestAnimationFrame(() => {
      this._resizeGeometry()
    })

    const gridSize = 0
    const snapToGrid = (position: THREE.Vector3): THREE.Vector3 => {
      if (gridSize > 0) {
        // Assuming position is the position of the object being dragged
        position.x = Math.round(position.x / gridSize) * gridSize;
        position.y = Math.round(position.y / gridSize) * gridSize;
        position.z = Math.round(position.z / gridSize) * gridSize;
      }
      return position;
    }
    let offset: Vector3
    this.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
      if (!this.draggable || !this.visible) return

      // remember where in the mesh the mouse was clicked to avoid jump on first drag
      offset = e.position.sub(this.position).clone()
      document.body.style.cursor = 'grabbing'

      this.dragging = true
    });
    this.addEventListener(InteractiveEventType.DRAGEND, () => { this.dragging = false });

    this.addEventListener(InteractiveEventType.DRAG, (e: any) => {
      if (!this.dragging || !this.draggable || !this.visible) return

      this.position.copy(snapToGrid(e.position.sub(offset)))
    });
  }

  disablePointerInteraction() {
    const block = (e: any) => { if (this.visible) e.stop = true }

    this.addEventListener(InteractiveEventType.POINTERMOVE, block)
    this.addEventListener(InteractiveEventType.POINTERENTER, block)
    this.addEventListener(InteractiveEventType.POINTERDOWN, block)
    this.addEventListener(InteractiveEventType.POINTERUP, block)
    this.addEventListener(InteractiveEventType.CLICK, block)

    this.enablePointerInteraction = () => {
      this.removeEventListener(InteractiveEventType.POINTERMOVE, block)
      this.removeEventListener(InteractiveEventType.POINTERENTER, block)
      this.removeEventListener(InteractiveEventType.POINTERDOWN, block)
      this.removeEventListener(InteractiveEventType.POINTERUP, block)
      this.removeEventListener(InteractiveEventType.CLICK, block)
    }
  }
  enablePointerInteraction() { }



  override add(...object: Object3D[]): this {
    // TODO: implement autogrow
    return super.add(...object)
  }

  override remove(...object: Object3D[]): this {
    // TODO: implement autoshrink
    return super.remove(...object)
  }

  // rendering
  private _resizeGeometry() {
    const shape = this.panelShape()
    this.geometry.dispose()
    this.geometry = this.createGeometry(shape)
    this.geometry.center()

    if (this.borderMesh) {
      const bordershape = this.panelBorderShape(this.borderWidth!)
      this.borderMesh.geometry.dispose()
      this.borderMesh.geometry = this.createGeometry(bordershape)
      this.borderMesh.geometry.center()
    }

    const highlightshape = this.panelBorderShape(this.highlightWidth)
    this.highlightMesh.geometry.dispose()
    this.highlightMesh.geometry = this.createGeometry(highlightshape)
    this.highlightMesh.geometry.center()

    this.resizeGeometry()
  }

  isHighlighted(): boolean { return false }

  // overridable

  panelShape(): Shape {
    return new RoundedRectangleShape(this.width, this.height, this.radius)
  }

  panelBorderShape(borderWidth: number): Shape {
    return new RoundedRectangleBorderShape(this.width, this.height, this.radius, borderWidth)
  }

  createGeometry(shape: Shape): BufferGeometry {
    return new ShapeGeometry(shape)
  }

  resizeGeometry() { }

  highlight() { }
  unhighlight() { }

}
