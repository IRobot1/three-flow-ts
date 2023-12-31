import { BufferGeometry, ColorRepresentation, MathUtils, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, PlaneGeometry } from "three";
import { UIEventType, PanelParameters, UIOptions } from "./model";
import { FontCache, MaterialCache } from "./cache";

export interface PanelOptions extends UIOptions {
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

      this.dispatchEvent<any>({ type: UIEventType.WIDTH_CHANGED, diff })
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

      this.dispatchEvent<any>({ type: UIEventType.DEPTH_CHANGED, diff })
    }
  }
  mindepth: number;
  maxdepth: number;

  autogrow: boolean
  autoshrink: boolean

  private _matparams!: MeshBasicMaterialParameters
  get color() { return this._matparams.color! }
  set color(newvalue: ColorRepresentation) {
    if (this._matparams.color != newvalue) {
      this._matparams.color = newvalue;
      (this.material as MeshBasicMaterial).color.set(newvalue)
    }
  }


  private _draggable: boolean;
  get draggable() { return this._draggable }
  set draggable(newvalue: boolean) {
    if (this._draggable != newvalue) {
      this._draggable = newvalue;
      this.dispatchEvent<any>({ type: UIEventType.DRAGGABLE_CHANGED })
    }
  }

  private _selectable: boolean;
  get selectable() { return this._selectable }
  set selectable(newvalue: boolean) {
    if (this._selectable != newvalue) {
      this._selectable = newvalue;
      this.dispatchEvent<any>({ type: UIEventType.SELECTABLE_CHANGED })
    }
  }

  protected fontCache: FontCache;
  protected materialCache: MaterialCache;

  value:any

  constructor(private parameters: PanelParameters = {}, options: PanelOptions = {}) {
    super()

    this.fontCache = options.fontCache != undefined ? options.fontCache : new FontCache()
    this.materialCache = options.materialCache != undefined ? options.materialCache : new MaterialCache()


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
    this.minwidth = parameters.minwidth != undefined ? parameters.minwidth : this.width
    this.maxwidth = parameters.maxwidth != undefined ? parameters.maxwidth : Number.POSITIVE_INFINITY

    this._height = parameters.height != undefined ? parameters.height : 1
    this.minheight = parameters.minheight != undefined ? parameters.minheight : this.height;
    this.maxheight = parameters.maxheight != undefined ? parameters.maxheight : Number.POSITIVE_INFINITY

    //this.lockaspectratio = p.lockaspectratio ? p.lockaspectratio : false

    this._depth = parameters.depth != undefined ? parameters.depth : 0
    this.mindepth = parameters.mindepth != undefined ? parameters.mindepth : this.depth;
    this.maxdepth = parameters.maxdepth != undefined ? parameters.maxdepth : Number.POSITIVE_INFINITY

    this.autogrow = parameters.autogrow != undefined ? parameters.autogrow : false
    this.autoshrink = parameters.autoshrink != undefined ? parameters.autoshrink : false

    if (parameters.material) {
      this._matparams = parameters.material
      this.material = this.materialCache.getMaterial('geometry', this.name, this._matparams)!;
    }
    else {
      parameters.material = { color: 'white' }
    }

    this._selectable = parameters.selectable != undefined ? parameters.selectable : true
    this._draggable = parameters.draggable != undefined ? parameters.draggable : false

    this.value = parameters.value

    // allow derived classes access to "this" by delaying one frame or to override methods
    requestAnimationFrame(() => {
      this._resizeGeometry()
    })


  }

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
    this.geometry.dispose()
    this.geometry = this.createGeometry(this.parameters)
    this.resizeGeometry()
  }

  // overridable

  createGeometry(parameters: PanelParameters): BufferGeometry {
    return new PlaneGeometry(this.width, this.height)
  }

  resizeGeometry() { }
}
