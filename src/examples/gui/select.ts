import { ThreeInteractive, InteractiveEventType } from "three-flow";
import { UITextButton } from "./button-text";
import { ButtonOptions } from "./button";
import { ListEventType, UIList } from "./list";
import { CircleGeometry, MathUtils, Mesh, MeshBasicMaterialParameters } from "three";
import { SelectParameters } from "./model";

export enum SelectEventType {
  SELECTED_CHANGED = 'selected_changed',
  SELECTED_DATA_CHANGED = 'selected_data_changed',
}
export class UISelect extends UITextButton {

  private _selected: string
  get selected() { return this._selected }
  set selected(newvalue: string) {
    if (this._selected != newvalue) {
      this._selected = newvalue
      if (newvalue) {
        this.label.text = newvalue
        this.dispatchEvent<any>({ type: SelectEventType.SELECTED_CHANGED })
      }
    }
  }
  private indicator: Mesh
  constructor(parameters: SelectParameters, interactive: ThreeInteractive, options: ButtonOptions) {
    parameters.disableScaleOnClick = false
    parameters.label.alignX = 'left'
    parameters.label.padding = 0.05
    parameters.list.selectable = false
    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'select'

    const radius = this.height * 0.9 / 2
    this.label.maxwidth = this.width - (radius + this.label.padding)

    const mesh = this.createIndicator(radius)
    mesh.material = this.materials.getMaterial('geometry', 'select-indicator', <MeshBasicMaterialParameters>{ color: 'black' })
    mesh.position.set((this.width - radius - this.label.padding) / 2, 0, 0.001)
    mesh.rotation.z = this.indicatorRotation(false)
    this.add(mesh)
    this.indicator = mesh

    this.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      this.closelist()
    })

    this._selected = parameters.initialselected ? parameters.initialselected : ''
  }

  private list?: UIList

  private closelist() {
    if (!this.list) return
    this.remove(this.list)
    this.indicator.rotation.z = this.indicatorRotation(false)
    this.list.dispose()
    this.list = undefined
  }
  override pressed() {
    if (this.disabled) return

    if (this.list) {
      this.closelist()
    }
    else {
      this.indicator.rotation.z = this.indicatorRotation(true)
      const params = this.parameters as SelectParameters
      params.list.selected = this.label.text

      const list = new UIList(params.list, this.interactive, this.options)
      this.add(list)
      list.position.y = -(this.height + list.height) / 2 - list.spacing

      list.selected = (data: any) => {

        let value = data
        if (params.list.field) value = data[params.list.field]
        this.selected = value

        this.dispatchEvent<any>({ type: SelectEventType.SELECTED_DATA_CHANGED, data })

        this.closelist()
      }

      this.list = list
    }

  }

  // overridables

  createIndicator(radius: number): Mesh {
    const geometry = new CircleGeometry(0.04, 3)
    return new Mesh(geometry)
  }


  indicatorRotation(opened: boolean): number {
    if (opened)
      return MathUtils.degToRad(-90)
    return MathUtils.degToRad(90)
  }

}
