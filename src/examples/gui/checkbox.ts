import { InteractiveEventType, ThreeInteractive } from "three-flow";
import { PanelOptions } from "./panel";
import { CheckboxParameters } from "./model";
import { Mesh, ShapeGeometry } from "three";
import { InputFieldType, UIEntry } from "./input-field";
import { UIKeyboardEvent } from "./keyboard";


export enum CheckboxEventType {
  CHECKED_CHANGED = 'checked_changed',
  INDETERMINATE_CHANGED = 'indeterminate_changed',
}
export interface CheckboxOptions extends PanelOptions { }

export class UICheckBox extends UIEntry {
  inputtype: InputFieldType = 'checkbox'

  private _checked = false
  get checked(): boolean { return this._checked }
  set checked(newvalue: boolean) {
    if (this._checked != newvalue) {
      this._checked = newvalue
      this.dispatchEvent<any>({ type: CheckboxEventType.CHECKED_CHANGED, checked: newvalue })
    }
  }

  // show/hide indeterminate visual
  private _indeterminate = false
  get indeterminate(): boolean { return this._indeterminate }
  set indeterminate(newvalue: boolean) {
    if (this._indeterminate != newvalue) {
      this._indeterminate = newvalue
      this.dispatchEvent<any>({ type: CheckboxEventType.INDETERMINATE_CHANGED })
    }
  }

  constructor(parameters: CheckboxParameters, interactive: ThreeInteractive, options: CheckboxOptions = {}) {
    if (parameters.width == undefined) parameters.width = 0.1
    if (parameters.height == undefined) parameters.height = 0.1

    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'checkbox'

    this.checked = parameters.checked != undefined ? parameters.checked : false

    if (!parameters.checkmaterial) parameters.checkmaterial = { color: 'black' }
    const checkmaterial = this.materialCache.getMaterial('geometry', 'checkbox', parameters.checkmaterial)

    const checksize = 0.8
    const checkshape = this.rectangle(this.width * checksize, this.height * checksize, 0.02)
    const checkmesh = new Mesh(new ShapeGeometry(checkshape), checkmaterial)
    this.add(checkmesh)
    checkmesh.position.z = 0.001
    checkmesh.visible = this.checked


    const indeterminateshape = this.rectangle(this.width * checksize, this.height * 0.2, 0.02)
    const indeterminatemesh = new Mesh(new ShapeGeometry(indeterminateshape), checkmaterial)
    this.add(indeterminatemesh)
    indeterminatemesh.position.z = 0.001
    indeterminatemesh.visible = this.indeterminate

    this.addEventListener(InteractiveEventType.CLICK, () => {
      if (this.disabled) return
      this.checked = !this.checked
      // a user clicking will remove the indeterminate state
      this.indeterminate = false
      //e.stop = true  // prevent bubbling event
    })

    this.addEventListener(CheckboxEventType.CHECKED_CHANGED, () => {
      // While the indeterminate is true, it will remain indeterminate regardless of the checked value
      if (this.indeterminate) return

      checkmesh.visible = this.checked
    })

    this.addEventListener(CheckboxEventType.INDETERMINATE_CHANGED, () => {
      indeterminatemesh.visible = this.indeterminate
      if (!this.indeterminate)
        checkmesh.visible = this.checked
    })
  }

  override handleKeyDown(e: UIKeyboardEvent) {
    if (e.code == 'Enter' || e.code == 'Space')
      this.checked = !this.checked
  }
}
