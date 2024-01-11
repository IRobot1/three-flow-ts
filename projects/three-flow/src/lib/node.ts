import { Mesh, BufferGeometry, PlaneGeometry, MathUtils, Object3D, MeshBasicMaterialParameters, ColorRepresentation, MeshBasicMaterial } from "three";

import { AnchorType, FlowEventType, FlowNodeParameters, FlowTransform } from "./model";
import { FlowDiagram } from "./diagram";
import { FlowLabel } from "./label";
import { FlowUtils } from "./utils";


export class FlowNode extends Mesh {
  private moveLabelX(xdiff: number) {
    if (!this.label || !this.label.labelMesh) return
    switch (this.labelanchor) {
      case 'left':
        xdiff = -xdiff
        break;
      case 'top':
      case 'bottom':
      case 'center':
        xdiff = 0
        break;
    }
    this.label.labelMesh.position.x += xdiff
  }

  private moveLabelY(ydiff: number) {
    if (!this.label || !this.label.labelMesh) return
    switch (this.labelanchor) {
      case 'bottom':
        ydiff = -ydiff
        break;
      case 'left':
      case 'right':
      case 'center':
        ydiff = 0
        break;
    }
    this.label.labelMesh.position.y += ydiff
  }

  private moveLabelZ(zdiff: number) {
    if (!this.label || !this.label.labelMesh) return
    switch (this.labelanchor) {
      case 'front':
        zdiff = -zdiff
        break;
      case 'center':
        zdiff = 0
        break;
    }
    this.label.labelMesh.position.z += zdiff
  }


  protected _width: number
  get width() { return this._width }
  set width(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, this.minwidth, this.maxwidth)
    if (this._width != newvalue) {
      const diff = newvalue - this._width
      this._width = newvalue
      this._resizeGeometry()

      // move label by difference in width change
      this.moveLabelX(diff / 2)

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
      const diff = newvalue - this._height
      this._height = newvalue
      this._resizeGeometry()

      // move label by difference in height change
      this.moveLabelY(diff / 2)
      this.dispatchEvent<any>({ type: FlowEventType.HEIGHT_CHANGED })
    }
  }
  minheight: number;
  maxheight: number;

  lockaspectratio: boolean;

  protected _depth: number
  get depth() { return this._depth }
  set depth(newvalue: number) {
    newvalue = MathUtils.clamp(newvalue, this.mindepth, this.maxdepth)
    if (this._depth != newvalue) {
      const diff = newvalue - this._depth
      this._depth = newvalue
      this._resizeGeometry()

      // move label by difference in depth change
      this.moveLabelZ(diff / 2)

      this.dispatchEvent<any>({ type: FlowEventType.DEPTH_CHANGED })
    }
  }
  mindepth: number;
  maxdepth: number;


  private _matparams!: MeshBasicMaterialParameters
  get color() { return this._matparams.color! }
  set color(newvalue: ColorRepresentation) {
    if (this._matparams.color != newvalue) {
      this._matparams.color = newvalue;
      if (newvalue)
        (this.material as MeshBasicMaterial).color.set(newvalue)
    }
  }

  private _resizematparams!: MeshBasicMaterialParameters
  get resizecolor() { return this._resizematparams.color! }
  set resizecolor(newvalue: ColorRepresentation) {
    if (this._resizematparams.color != newvalue) {
      this._resizematparams.color = newvalue;
      //if (newvalue)
      //  (this.material as MeshBasicMaterial).color.set(newvalue)
    }
  }

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

  private _scalermatparams!: MeshBasicMaterialParameters
  get scalecolor() { return this._scalermatparams.color! }
  set scalecolor(newvalue: ColorRepresentation) {
    if (this._scalermatparams.color != newvalue) {
      this._scalermatparams.color = newvalue;
      //if (newvalue)
      //  (this.material as MeshBasicMaterial).color.set(newvalue)
    }
  }

  private _scalable: boolean;
  get scalable() { return this._scalable }
  set scalable(newvalue: boolean) {
    if (this._scalable != newvalue) {
      this._scalable = newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.SCALABLE_CHANGED })
    }
  }

  private _selectable: boolean;
  get selectable() { return this._selectable }
  set selectable(newvalue: boolean) {
    if (this._selectable != newvalue) {
      this._selectable = newvalue;
      this.dispatchEvent<any>({ type: FlowEventType.SELECTABLE_CHANGED })
    }
  }


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

  private autogrow: boolean

  public label?: FlowLabel
  public labelanchor: AnchorType
  public labeltransform?: FlowTransform;


  isFlow = true

  dispose() {
    this.dispatchEvent<any>({ type: FlowEventType.DISPOSE })
  }


  constructor(public diagram: FlowDiagram, public parameters: FlowNodeParameters) {
    super();

    //@ts-ignore
    this.type = 'flownode'
    this.name = parameters.id = parameters.id ? parameters.id : diagram.nextNodeId()
    const nodetype = parameters.type = parameters.type ? parameters.type : 'node'

    this._width = parameters.width = parameters.width != undefined ? parameters.width : 1;
    this.minwidth = parameters.minwidth != undefined ? parameters.minwidth : this.width
    this.maxwidth = parameters.maxwidth != undefined ? parameters.maxwidth : Number.POSITIVE_INFINITY

    this._height = parameters.height = parameters.height != undefined ? parameters.height : 1;
    this.minheight = parameters.minheight != undefined ? parameters.minheight : this.height;
    this.maxheight = parameters.maxheight != undefined ? parameters.maxheight : Number.POSITIVE_INFINITY

    this._depth = parameters.depth = parameters.depth != undefined ? parameters.depth : 1;
    this.mindepth = parameters.mindepth != undefined ? parameters.mindepth : this.depth;
    this.maxdepth = parameters.maxdepth != undefined ? parameters.maxdepth : Number.POSITIVE_INFINITY

    this._matparams = parameters.material ? parameters.material : { color: 'white' }

    this.lockaspectratio = parameters.lockaspectratio ? parameters.lockaspectratio : false

    this.autogrow = this.parameters.autogrow != undefined ? this.parameters.autogrow : true
    if (parameters.label) {
      this.label = this.diagram.createLabel(parameters.label)
      this.add(this.label)


      if (this.autogrow) {
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

    this.labelanchor = parameters.labelanchor ? parameters.labelanchor : 'center'
    this.labeltransform = parameters.labeltransform

    this._resizable = parameters.resizable != undefined ? parameters.resizable : true
    this._resizematparams = parameters.resizematerial ? parameters.resizematerial : { color: 'black' }
    this._draggable = parameters.draggable != undefined ? parameters.draggable : true
    this._scalable = parameters.scalable != undefined ? parameters.scalable : true
    this._selectable = parameters.selectable != undefined ? parameters.selectable : true
    this._scalermatparams = parameters.scalematerial ? parameters.scalematerial : { color: 'black' }

    this._scalar = parameters.scale ? parameters.scale : 1
    this.minscale = parameters.minscale ? parameters.minscale : this.scalar;
    this.maxscale = parameters.maxscale ? parameters.maxscale : Number.POSITIVE_INFINITY;

    if (parameters.userData) this.userData = parameters.userData;

    this.material = diagram.getMaterial('geometry', nodetype, parameters.material);

    if (parameters.x != undefined) this.position.x = parameters.x
    if (parameters.y != undefined) this.position.y = parameters.y
    if (parameters.z != undefined) this.position.z = parameters.z

    this._hidden = parameters.hidden != undefined ? parameters.hidden : false
    this.visible = !this.hidden

    this.save = () => {
      parameters.x = this.position.x
      parameters.y = this.position.y
      parameters.z = this.position.z
      if (!this.visible) parameters.hidden = true
    }



    // allow derived classes access to "this" by delaying one frame or to override methods
    requestAnimationFrame(() => {
      this.updateLabel();
      this._resizeGeometry()
    })
  }

  private positionLabel(anchor: AnchorType, labelMesh: Mesh) {
    let x = 0, y = 0
    switch (anchor) {
      case 'left':
        x = -this.width / 2
        break
      case 'right':
        x = this.width / 2
        break
      case 'top':
        y = this.height / 2
        break
      case 'bottom':
        y = -this.height / 2
        break;
      case 'center':
        break;
      default:
        console.warn('Unhandled node anchor type', anchor)
        break;
    }

    labelMesh.position.set(x, y, labelMesh.position.z)
  }

  private updateLabel() {
    if (!this.label) return

    this.label.updateLabel()

    if (this.label.labelMesh) {
      this.positionLabel(this.labelanchor, this.label.labelMesh)
    }

    if (this.labeltransform && this.label.labelMesh)
      FlowUtils.transformObject(this.labeltransform, this.label.labelMesh)
  }

  private _resizeGeometry() {
    this.geometry.dispose()
    this.geometry = this.createGeometry(this.parameters)
    this.resizeGeometry()
  }

  // overridable

  createGeometry(parameters: FlowNodeParameters): BufferGeometry {
    return new PlaneGeometry(this.width, this.height)
  }

  getConnector(id?: string): Object3D {
    return this
  }

  resizeGeometry() { }

  save: () => void
}
