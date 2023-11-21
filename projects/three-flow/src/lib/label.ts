import { Material, Mesh, Object3D, Vector3 } from "three";
import { FlowEventType, FlowLabelParameters, LabelAlign } from "./model";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { FlowDiagram } from "./diagram";
import { TextGeometry, TextGeometryParameters } from "three/examples/jsm/geometries/TextGeometry";

export class FlowLabel extends Object3D {
  private _text: string | undefined
  get text() { return this._text }
  set text(newvalue: string | undefined) {
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

  private _color: number | string = 'black'
  get color() { return this._color }
  set color(newvalue: number | string) {
    if (this._color != newvalue) {
      this._color = newvalue;
      if (this.labelMesh)
        (this.labelMesh.material as any).color.set(newvalue)
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

  public align: LabelAlign

  public readonly font?: Font;

  public labelMesh!: Mesh

  private labelMaterial: Material;


  constructor(diagram: FlowDiagram, parameters: FlowLabelParameters) {
    super()

    this._text = parameters.text
    this._size = parameters.size ? parameters.size : 0.1
    this._color = parameters.color ? parameters.color : 'black'
    this._padding = parameters.padding ? parameters.padding : 0.1
    this.align = parameters.align ? parameters.align : 'center'

    this.labelMaterial = diagram.getMaterial('geometry', 'label', this.color)!;
    this.font = diagram.getFont(parameters.font)


  }

  public updateLabel() {
    if (this.labelMesh) this.remove(this.labelMesh)

    if (this.text == undefined) return

    this.labelMesh = this.createText(this.text, { align: this.align, font: this.font, height: 0, size: this.size });
    this.add(this.labelMesh);

    this.labelMesh.name = 'label'

    this.labelMesh.material = this.labelMaterial
    this.labelMesh.position.set(0, 0, 0.001)

    this.labelMesh.geometry.computeBoundingBox()
    const box = this.labelMesh.geometry.boundingBox
    if (box) {
      const size = box.getSize(new Vector3())

      this.width = size.x + this.padding * 2
      this.height = size.y + this.padding * 2
    }
  }

  createText(label: string, options: any): Mesh {
    const params = options as TextGeometryParameters;
    const mesh = new Mesh()

    // only add text if font is loaded
    if (params.font) {
      mesh.geometry = new TextGeometry(label, params)
      mesh.geometry.computeBoundingBox()
      switch (<LabelAlign>options.align) {
        case 'center':
          mesh.geometry.center()
          break
        case 'right':
          if (mesh.geometry.boundingBox) {
            const size = mesh.geometry.boundingBox.getSize(new Vector3())
            mesh.geometry.translate(-size.x, 0, 0)
          }
          break
        case 'left':
        default:
          break
      }
    }

    return mesh
  }

}
