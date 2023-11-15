import { Mesh, BufferGeometry, PlaneGeometry, MathUtils, Material } from "three";
import { TextGeometry, TextGeometryParameters } from "three/examples/jsm/geometries/TextGeometry";
import { Font } from "three/examples/jsm/loaders/FontLoader";

import { FlowEventType, FlowNodeParameters } from "./model";
import { FlowDiagram } from "./diagram";


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

  private _label: string | undefined
  get label() { return this._label }
  set label(newvalue: string | undefined) {
    if (this._label != newvalue) {
      this._label = newvalue;
      if (newvalue) {
        this.updateLabel()
      }
    }
  }

  private _labelsize: number;
  get labelsize() { return this._labelsize }
  set labelsize(newvalue: number) {
    if (this._labelsize != newvalue) {
      this._labelsize = newvalue;
      this.updateLabel()
    }
  }

  private _labelcolor: number | string;
  get labelcolor() { return this._labelcolor }
  set labelcolor(newvalue: number | string) {
    if (this._labelcolor != newvalue) {
      this._labelcolor = newvalue;
      if (this.labelMesh)
        (this.labelMesh.material as any).color.set(newvalue)
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


  private labelMesh?: Mesh;
  private labelMaterial: Material;

  private font?: Font;

  isFlow = true

  dispose() {
    this.dispatchEvent<any>({ type: FlowEventType.DISPOSE })
  }


  constructor(public diagram: FlowDiagram, public node: FlowNodeParameters) {
    super();

    //@ts-ignore
    this.type = 'flownode'
    this.name = node.text = node.text ? node.text : diagram.nodeCount.toString()
    node.type = node.type ? node.type : 'node'

    this._width = node.width = node.width ? node.width : 1;
    this.minwidth = node.minwidth ? node.minwidth : this.width
    this.maxwidth = node.maxwidth ? node.maxwidth : Number.POSITIVE_INFINITY

    this._height = node.height = node.height ? node.height : 1;
    this.minheight = node.minheight ? node.minheight : this.height;
    this.maxheight = node.maxheight ? node.maxheight : Number.POSITIVE_INFINITY
    this._color = node.color ? node.color : 'white'

    this._label = node.label
    this._labelsize = node.labelsize ? node.labelsize : 0.1
    this._labelcolor = node.labelcolor ? node.labelcolor : 'black'
    this.font = diagram.getFont(node.labelfont)

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

    this.labelMaterial = diagram.getMaterial('geometry', 'label', this.labelcolor)!;


    // allow derived classes access to "this" by delaying one frame or to override methods
    requestAnimationFrame(() => {
      this.updateLabel();
      this.resizeGeometry()
      this.updateVisuals();
    })
  }

  private updateLabel() {
    if (this.label) {
      if (this.labelMesh) this.remove(this.labelMesh)

      this.labelMesh = this.createText(this.label, { font: this.font, height: 0, size: this.labelsize });
      this.labelMesh.name = 'label'

      this.labelMesh.material = this.labelMaterial
      this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)

      this.add(this.labelMesh);
    }
  }

  private resizeGeometry() {
    this.geometry.dispose()
    this.geometry = this.createGeometry()

    if (this.labelMesh) this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)
  }

  updateVisuals() { }



  // overridable
  createGeometry(): BufferGeometry {
    return new PlaneGeometry(this.width, this.height)
  }

  createText(label: string, options: any): Mesh {
    const params = options as TextGeometryParameters;
    const mesh = new Mesh()

    // only add text if font is loaded
    if (params.font) {
      mesh.geometry = new TextGeometry(label, params)
      mesh.geometry.center()
    }

    return mesh
  }


  save: () => void

}
