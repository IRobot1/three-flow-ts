import { EventDispatcher, Object3D, WebGLRenderer } from "three"
import { InputField, InputFieldEventType } from "./input-field";
import { UIKeyboardEvent } from "./keyboard";
import { InteractiveEventType } from "three-flow";

export interface InputManagerOptions {
}

export class UIInputManager extends EventDispatcher {

  private children: Array<InputField> = []

  private currentMethod?: Object3D

  private _selected: InputField | undefined
  get selected() { return this._selected }
  set selected(newvalue: InputField | undefined) {
    if (this._selected != newvalue) {
      if (this.currentMethod) this.currentMethod.visible = false
      this._selected = newvalue
      if (newvalue) {
        this.currentMethod = this.inputMethods.get(newvalue.inputtype)
        if (this.currentMethod) this.currentMethod.visible = true
      }
    }
  }

  //public colorpicker?: ColorPicker
  dispose: () => void

  private inputMethods = new Map<string, Object3D>()

  // overrides for VR
  setInputMethods(methods: Map<string, Object3D>) { }

  constructor(renderer: WebGLRenderer) {
    super()

    // TODO: listen for entering and leaving VR
    // make sure input methods are hidden for now
    if (renderer.xr.isPresenting) {
      this.setInputMethods(this.inputMethods)
      Array.from(this.inputMethods.values()).forEach(object => object.visible = false)
    }

    const processKeyCode = (keyboard: UIKeyboardEvent) => {
      if (keyboard.code == 'Tab' && this.children.length > 0) {
        if (this.selected) this.selected.active = false

        let index = this.children.findIndex(x => x == this.selected)
        if (keyboard.shiftKey) { // move previous
          index--
          if (index < 0) index = this.children.length - 1
        }
        else { // move next
          index++
          if (index >= this.children.length) index = 0
        }
        this.selected = this.children[index]
        this.selected.active = true
      }
      else
        if (this.selected) this.selected.dispatchEvent<any>({ type: InputFieldEventType.KEYDOWN, keyboard })
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      processKeyCode({ code: e.code, key: e.key, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, altKey: e.altKey })
    }

    document.addEventListener('keydown', handleKeyDown);
    //document.addEventListener('keyup', handleKeyUp);

    this.dispose = () => {
      document.removeEventListener('keydown', handleKeyDown)
      //document.removeEventListener('keyup', handleKeyUp)
    }
  }

  add(...objects: InputField[]): this {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.add(arguments[i]);
      }
    }
    else {
      const object = objects[0] as InputField
      this.children.push(object)

      object.addEventListener<any>(InputFieldEventType.ACTIVE_CHANGED, (e: any) => {
        if (e.target == this.selected) return

        if (e.active) {

          // uncheck any previous selection
          if (this.selected) this.selected.active = false

          // remember this was selected
          this.selected = e.target;

        }
        // unchecked, so clear any previous selection
        else if (e.target == this.selected)
          this.selected = undefined
        else
          this.selected = e.target
      })

      object.addEventListener(InteractiveEventType.POINTERDOWN, () => {
        if (object.disabled) return
        object.active = true
      })
      object.addEventListener(InteractiveEventType.POINTERMISSED, () => {
        object.active = false
      })


    }

    return this
  }

  remove(...objects: InputField[]): this {
    if (arguments.length > 1) {

      for (let i = 0; i < arguments.length; i++) {

        this.remove(arguments[i]);

      }
    }
    else {
      const object = objects[0]

      const index = this.children.indexOf(object);

      if (index !== - 1) {

        this.children.splice(index, 1);

      }
    }

    return this
  }

  get count(): number { return this.children.length }
}
