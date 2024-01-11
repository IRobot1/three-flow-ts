import { ColorRepresentation, Euler, Material, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, Vector3 } from "three";
import { FlowEventType, FlowLabelParameters, LabelAlignX, LabelAlignY, LabelTextAlign } from "./model";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { FlowDiagram } from "./diagram";
import { TextGeometry, TextGeometryParameters } from "three/examples/jsm/geometries/TextGeometry";

export class FlowLabel extends Object3D {
  private _text: string
  get text() { return this._text }
  set text(newvalue: string) {
    if (this._text != newvalue) {
      this._text = newvalue;
      if (newvalue != undefined) {
        this.updateLabel()
      }
    }
  }

  private _size = 0.1
  get size() { return this._size }
  set size(newvalue: number) {
    if (this._size != newvalue) {
      this._size = newvalue;
      this.updateLabel()
    }
  }

  private _matparams!: MeshBasicMaterialParameters
  get color() { return this._matparams.color! }
  set color(newvalue: ColorRepresentation) {
    if (this._matparams.color != newvalue) {
      this._matparams.color = newvalue;
      if (this.labelMesh)
        (this.labelMesh.material as MeshBasicMaterial).color.set(newvalue)
    }
  }

  private _padding = 0.1
  get padding() { return this._padding }
  set padding(newvalue: number) {
    if (this._padding != newvalue) {
      this._padding = newvalue;
      this.updateLabel()
    }
  }

  protected _width = 0
  get width() { return this._width }

  protected set width(newvalue: number) {
    if (this._width != newvalue) {
      this._width = newvalue
      this.dispatchEvent<any>({ type: FlowEventType.WIDTH_CHANGED, width: newvalue })
    }
  }

  protected _height = 0
  get height() { return this._height }
  protected set height(newvalue: number) {
    if (this._height != newvalue) {
      this._height = newvalue
      this.dispatchEvent<any>({ type: FlowEventType.HEIGHT_CHANGED, height: newvalue })
    }
  }

  get hidden() { return !this.visible }
  set hidden(newvalue: boolean) { this.visible = !newvalue }

  alignX: LabelAlignX
  alignY: LabelAlignY
  wrapwidth: number
  textalign: LabelTextAlign
  isicon: boolean

  readonly font?: Font;

  labelMesh?: Mesh

  material: Material;


  constructor(diagram: FlowDiagram, parameters: FlowLabelParameters) {
    super()

    this._text = parameters.text ? parameters.text : ''
    this._size = parameters.size != undefined ? parameters.size : 0.1
    this._matparams = parameters.material ? parameters.material : { color: 'black' }
    this._padding = parameters.padding != undefined ? parameters.padding : 0.1
    this.alignX = parameters.alignX ? parameters.alignX : 'center'
    this.alignY = parameters.alignY ? parameters.alignY : 'middle'
    this.wrapwidth = parameters.wrapwidth != undefined ? parameters.wrapwidth : Infinity
    this.textalign = parameters.textalign ? parameters.textalign : 'left'
    this.isicon = parameters.isicon ? parameters.isicon : false

    this.hidden = parameters.hidden != undefined ? parameters.hidden : false

    this.material = diagram.getMaterial('geometry', 'label', parameters.material)!;
    this.font = diagram.getFont(parameters.font)
  }

  private labelposition = new Vector3()
  private labelrotation = new Euler()

  public updateLabel() {
    let restore = false
    if (this.labelMesh) {
      // preserve position and rotation before removing
      this.labelposition.copy(this.labelMesh.position)
      this.labelrotation.copy(this.labelMesh.rotation)
      restore = true
      this.remove(this.labelMesh)
    }
    this.labelMesh = undefined

    if (this.text == undefined) return

    this.labelMesh = this.createText(this.text, { alignX: this.alignX, alignY: this.alignY, font: this.font, height: 0, size: this.size });
    this.add(this.labelMesh);

    this.labelMesh.name = 'label'

    this.labelMesh.material = this.material
    this.labelMesh.position.z = 0.001

    // restore position and rotation before removing
    if (restore) {
      this.labelMesh.position.copy(this.labelposition)
      this.labelMesh.rotation.copy(this.labelrotation)
    }

    this.labelMesh.addEventListener(FlowEventType.LABEL_READY, () => {
      if (this.labelMesh) {
        this.labelMesh.geometry.computeBoundingBox()
        const box = this.labelMesh.geometry.boundingBox!
        const size = box.getSize(this.textsize)
        const center = box.getCenter(this.textcenter)

        this.width = size.x + this.padding * 2
        this.height = size.y + this.padding * 2
      }
    })
  }

  private textsize = new Vector3()
  private textcenter = new Vector3()

  createText(label: string, options: any): Mesh {
    const params = options as TextGeometryParameters;
    const mesh = new Mesh()

    // only add text if font is loaded
    if (params.font) {
      mesh.geometry = new TextGeometry(label, params)

      mesh.geometry.computeBoundingBox()
      if (mesh.geometry.boundingBox) {
        const box = mesh.geometry.boundingBox
        const size = box.getSize(this.textsize)
        const center = box.getCenter(this.textcenter)

        let x = 0, y = 0
        switch (<LabelAlignX>options.alignX) {
          case 'center':
            x = -center.x
            break
          case 'right':
            x = -size.x
            break
          case 'left':
          default:
            break
        }
        switch (<LabelAlignY>options.alignY) {
          case 'middle':
            y = -center.y
            break
          case 'top':
            y = -size.y
            break
          case 'bottom':
          default:
            break
        }
        mesh.geometry.translate(x, y, 0)
      }
    }

    requestAnimationFrame(() => {
      mesh.dispatchEvent<any>({ type: FlowEventType.LABEL_READY })
    })
    return mesh
  }

}
