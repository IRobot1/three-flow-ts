import { ThreeInteractive, InteractiveEventType } from "three-flow";
import { UITextButton } from "./button-text";
import { ListParameters, TextButtonParameters, UIEventType } from "./model";
import { ButtonOptions } from "./button";
import { UIList } from "./list";
import { BufferGeometry, CircleGeometry, MathUtils, Mesh, MeshBasicMaterialParameters } from "three";

export interface SelectParameters extends TextButtonParameters {
  list: ListParameters
}

export class UISelect extends UITextButton {
  private indicator: Mesh
  constructor(parameters: SelectParameters, interactive: ThreeInteractive, options: ButtonOptions) {
    // TODO: label maxwidth
    parameters.label.alignX = 'left'
    parameters.label.padding = 0.05
    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'select'


    const radius = this.height * 0.9 / 2
    this.label.maxwidth = this.width - (radius + this.label.padding)

    const geometry = this.createIndicator(radius)
    const material = this.materialCache.getMaterial('geometry', 'select-indicator', <MeshBasicMaterialParameters>{ color: 'black' })
    const mesh = new Mesh(geometry, material)
    mesh.position.set((this.width - radius - this.label.padding) / 2, 0, 0.001)
    this.add(mesh)
    this.indicator = mesh
  }

  private list?: UIList

  private closelist() {
    if (!this.list) return
    this.remove(this.list)
    this.indicator.rotation.z = MathUtils.degToRad(90)
    this.list = undefined
  }
  override pressed() {
    if (this.list) {
      this.closelist()
    }
    else {
      this.indicator.rotation.z = MathUtils.degToRad(-90)
      const params = this.parameters as SelectParameters

      const list = new UIList(params.list, this.interactive, this.options)
      this.add(list)
      list.position.y = -(this.height + list.height) / 2

      list.addEventListener(UIEventType.LIST_SELECTED_CHANGED, () => {
        this.selected(list.selectedtext)
        this.closelist()
      })

      list.addEventListener(InteractiveEventType.POINTERMISSED, () => {
        this.closelist()
      })
      this.list = list
    }

  }

  // overridables

  createIndicator(radius: number): BufferGeometry {
    return new CircleGeometry(0.04, 3)
  }

  selected(text: string) { }
}
