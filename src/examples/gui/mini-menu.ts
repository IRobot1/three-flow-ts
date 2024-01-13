import { MeshBasicMaterialParameters, Object3D, Vector3 } from "three"
import { InteractiveEventType, ThreeInteractive } from "three-flow"
import { UILabel } from "./label"
import { TextButtonParameters, UIEventType, UIOptions } from "./model"
import { ButtonEventType, UIButton } from "./button"
import { UITextButton } from "./button-text"

export interface MenuItemParameters {
  text: string        // text or material icon name
  hint: string        // hint to show when hovering over icon
  isicon?: boolean    // default is false
  disabled?: boolean  // default is false
  width?: number      // default is 0.1 for icon, otherwise, 1
  fontsize?: number   // default is 0.1
  fill?: MeshBasicMaterialParameters
  selected?: () => void
}

export enum MenuItemEventType {
  MENU_SELECTED = 'menu_selected',
  MENU_MISSED = 'menu_missed',

}
export interface MenuParameters {
  spacing?: number                      // default is 0.02
  fill?: MeshBasicMaterialParameters    // default is gray
  items: Array<MenuItemParameters>
}

export class UIMiniMenu extends Object3D {
  buttons: Array<UIButton> = []

  constructor(parameters: MenuParameters, private interactive: ThreeInteractive, private options: UIOptions) {
    super()

    const hint = new UILabel({ alignX: 'left' }, options)
    hint.position.y = -0.12
    this.add(hint)

    const spacing = parameters.spacing != undefined ? parameters.spacing : 0.02

    const position = new Vector3()
    let lasthalf = 0
    parameters.items.forEach(item => {
      if (!item.fill) item.fill = parameters.fill

      const isicon = item.isicon != undefined ? item.isicon : false
      if (!item.width) item.width = isicon ? 0.1 : 1

      position.x += lasthalf + item.width / 2

      const button = this.createButton(item)
      button.position.copy(position)

      button.addEventListener(InteractiveEventType.POINTERENTER, () => {
        hint.text = item.hint
        hint.visible = true
      })
      button.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
        hint.visible = false
      })

      // note, all buttons will fire this event, but likely only first will close the menu
      button.addEventListener(InteractiveEventType.POINTERMISSED, () => {
        this.missed()
      })

      button.addEventListener(UIEventType.BUTTON_PRESSED, () => {
        if (item.selected) {
          // three methods to intercept - callback, override or event
          item.selected()
          this.pressed(item)
        }
      })

      this.buttons.push(button)

      position.x += spacing
      lasthalf = item.width / 2
    })

  }

  // overridables

  createButton(parameters: MenuItemParameters): UIButton {
    const params: TextButtonParameters = {
      width: parameters.width, height: 0.1,
      fill: parameters.fill,
      label: {
        text: parameters.text, material: { color: 'black' }, isicon: parameters.isicon, size: parameters.fontsize,
      }, value: parameters
    }

    // default is a text button, but can be something else
    const button = new UITextButton(params, this.interactive, this.options)
    this.add(button)

    return button
  }

  pressed(item: MenuItemParameters) {
    this.dispatchEvent<any>({ type: MenuItemEventType.MENU_SELECTED, item })
  }

  missed() {
    this.dispatchEvent<any>({ type: MenuItemEventType.MENU_MISSED })
  }
}
