import { Mesh, BufferGeometry, PlaneGeometry, MathUtils, Material, Box2, Vector2, Vector3, Object3D } from "three";
import { TextGeometry, TextGeometryParameters } from "three/examples/jsm/geometries/TextGeometry";
import { Font } from "three/examples/jsm/loaders/FontLoader";

import { FlowEventType, FlowLabelParameters, FlowNodeParameters } from "./model";
import { FlowDiagram } from "./diagram";
import { FlowLabel } from "./label";


export class FlowNode extends Mesh {
  protected _width: number
  get width() { return this._width }
  set width(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, this.minwidth, this.maxwidth)
    if (this._width != newvalue) {
      this._width = newvalue
      this.resizeGeometry()
      this.dispatchEvent<any>({ type: FlowEventType.WIDTH_CHANGED })
    }
  }
  minwidth: number;
  maxwidth: number;

  protected _height: number
  get height() { return this._height }
  set height(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, this.minheight, this.maxheight)
    if (this._height != newvalue) {
      this._height = newvalue
      this.resizeGeometry()
      this.dispatchEvent<any>({ type: FlowEventType.HEIGHT_CHANGED })
    }
  }
  minheight: number;
  maxheight: number;

  private _color: number | string;
  get color() { return this._color }
  set color(newvalue: number | string) {
    if (this._color != newvalue) {
      this._color = newvalue;
      (this.material as any).color.set(newvalue)
    }
  }

  resizecolor: number | string;

  private _resizable: boolean;
  get resizable() { return this._resizable }
  set resizable(newvalue: boolean) {
    if (this._resizable != newvalue) {
      this._resizable = newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.RESIZABLE_CHANGED })
    }
  }

  private _draggable: boolean;
  get draggable() { return this._draggable }
  set draggable(newvalue: boolean) {
    if (this._draggable != newvalue) {
      this._draggable = newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.DRAGGABLE_CHANGED })
    }
  }

  scalecolor: number | string;

  private _scalable: boolean;
  get scalable() { return this._scalable }
  set scalable(newvalue: boolean) {
    if (this._scalable != newvalue) {
      this._scalable = newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.SCALABLE_CHANGED })
    }
  }

  selectable: boolean;

  private _scalar: number
  get scalar() { return this._scalar }
  set scalar(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, this.minscale, this.maxscale)
    if (this._scalar != newvalue) {
      this._scalar = newvalue
      this.scale.set(newvalue, newvalue, 1)
      this.dispatchEvent<any>({ type: FlowEventType.SCALE_CHANGED })
    }
  }
  minscale: number;
  maxscale: number;

  private _hidden: boolean;
  get hidden() { return this._hidden }
  set hidden(newvalue: boolean) {
    if (this._hidden != newvalue) {
      this._hidden = newvalue;
      this.visible = !newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.HIDDEN_CHANGED })
    }
  }

  private autoSize = true

  public label?: FlowLabel


  isFlow = true

  dispose() {
    this.dispatchEvent<any>({ type: FlowEventType.DISPOSE })
  }


  constructor(public diagram: FlowDiagram, public node: FlowNodeParameters) {
    super();

    //@ts-ignore
    this.type = 'flownode'
    this.name = node.text = node.text ? node.text : diagram.nextNodeId()
    node.type = node.type ? node.type : 'node'

    this._width = node.width = node.width ? node.width : 1;
    this.minwidth = node.minwidth ? node.minwidth : this.width
    this.maxwidth = node.maxwidth ? node.maxwidth : Number.POSITIVE_INFINITY

    this._height = node.height = node.height ? node.height : 1;
    this.minheight = node.minheight ? node.minheight : this.height;
    this.maxheight = node.maxheight ? node.maxheight : Number.POSITIVE_INFINITY
    this._color = node.color ? node.color : 'white'

    if (node.label) {
      this.label = this.diagram.createLabel(node.label)
      this.add(this.label)

      if (this.autoSize) {
        this.label.addEventListener(FlowEventType.WIDTH_CHANGED, (e: any) => {
          if (e.width > this.width) {
            this.width = e.width
          }
        })
        this.label.addEventListener(FlowEventType.HEIGHT_CHANGED, (e: any) => {
          if (e.height > this.height) {
            this.height = e.height
          }
        })
      }
    }

    this._resizable = node.resizable ? node.resizable : true
    this.resizecolor = node.resizecolor ? node.resizecolor : 'black'
    this._draggable = node.draggable ? node.draggable : true
    this._scalable = node.scalable ? node.scalable : true
    this.selectable = node.selectable ? node.selectable : true
    this.scalecolor = node.scalecolor ? node.scalecolor : 'black'

    this._scalar = node.scale ? node.scale : 1
    this.minscale = node.minscale ? node.minscale : this.scalar;
    this.maxscale = node.maxscale ? node.maxscale : Number.POSITIVE_INFINITY;

    if (node.userData) this.userData = node.userData;

    this.material = diagram.getMaterial('geometry', 'node', this.color);

    if (node.x != undefined) this.position.x = node.x
    if (node.y != undefined) this.position.y = node.y
    if (node.z != undefined) this.position.z = node.z

    this._hidden = !this.visible
    if (node.hidden != undefined)
      this.hidden = node.hidden

    this.save = () => {
      node.x = this.position.x
      node.y = this.position.y
      node.z = this.position.z
      if (!this.visible) node.hidden = true
    }



    // allow derived classes access to "this" by delaying one frame or to override methods
    requestAnimationFrame(() => {
      this.updateLabel();
      this.resizeGeometry()
      this.updateVisuals();
    })
  }

  private updateLabel() {
    if (this.label) this.label.updateLabel()

  }

  private resizeGeometry() {
    this.geometry.dispose()
    this.geometry = this.createGeometry()
  }

  updateVisuals() { }



  // overridable
  createGeometry(): BufferGeometry {
    return new PlaneGeometry(this.width, this.height)
  }

  getConnector(id?: string): Object3D {
    return this
  }

  save: () => void

}
