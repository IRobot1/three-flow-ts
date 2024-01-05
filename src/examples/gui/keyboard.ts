import { Box3, Object3D, Vector3 } from "three";
import { InteractiveEventType, ThreeInteractive } from "three-flow";

import { TextButtonParameters, UIEventType, UIOptions } from "./model";
import { englishDesktopANSI } from "./englishDesktopANSI";
import { UIKey, UIKeyEventTypes } from "./keyboard-key";

export interface UIKeyboardParameters {

}
export interface UIKeyboardOptions extends UIOptions {

}

export interface UIKeyboardEvent {
  code: string
  key:string
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
}

interface KeySetting {
  position: Vector3
  width: number
  height: number
  keycode: string
  keys?: Array<string>
  text?: string
  isicon: boolean
  fontsize: number
}

type KeyCase = 'lower' | 'upper' | 'numbers';


interface StateKeyData {
  mesh: UIKey,
  text: Array<string>
}

export class UIKeyboard extends Object3D {

  dispose() { }

  private keyMap = new Map<string, UIKey>()
  private stateKeys: Array<StateKeyData> = []
  private shift = false

  constructor(private parameters: UIKeyboardParameters, private interactive: ThreeInteractive, private options: UIKeyboardOptions = {}) {
    super()

    let first = true
    const handleKeyDown = (keyboard: KeyboardEvent) => {
      keyboard.preventDefault()  // prevent Tab from leaving the document

      // get the lock states on first key down
      if (first) {
        this.getLockStates(keyboard)
        first = false
      }

      this.handleKeyDown(keyboard)
    }
    const handleKeyUp = (keyboard: KeyboardEvent) => {
      this.handleKeyUp(keyboard)
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    this.dispose = () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }

    const keys: Array<KeySetting> = []
    const layout = englishDesktopANSI

    if (layout.keywidth == undefined) layout.keywidth = 0.1
    if (layout.hspacing == undefined) layout.hspacing = 0.02
    if (layout.keyheight == undefined) layout.keyheight = 0.1
    if (layout.vspacing == undefined) layout.vspacing = 0.02
    if (layout.fontsize == undefined) layout.fontsize = 0.045

    const position = new Vector3()

    let vlasthalft = 0
    layout.rows.forEach(row => {
      let rowkeywidth = row.keywidth != undefined ? row.keywidth : layout.keywidth!
      let hspacing = row.hspacing != undefined ? row.hspacing : layout.hspacing!
      let keyheight = row.keyheight != undefined ? row.keyheight : layout.keyheight!
      let vspacing = row.vspacing != undefined ? row.vspacing : layout.vspacing!
      let rowfontsize = row.fontsize != undefined ? row.fontsize : layout.fontsize!

      position.y -= vlasthalft + keyheight / 2

      let hlasthalf = 0
      row.keys.forEach(key => {
        let keywidth = key.keywidth != undefined ? key.keywidth : rowkeywidth
        let fontsize = key.fontsize != undefined ? key.fontsize : rowfontsize

        position.x += hlasthalf + keywidth / 2

        const isicon = key.isicon != undefined ? key.isicon : false
        keys.push({
          position: position.clone(),
          width: keywidth, height: keyheight,
          keycode: key.keycode, keys: key.keys, fontsize,
          text: key.text, isicon
        });

        position.x += hspacing
        hlasthalf = keywidth / 2
      })

      position.x = 0
      position.y -= vspacing

      vlasthalft = keyheight / 2
    })

    this.addKeys(keys)

    // center
    const box = new Box3()
    box.setFromObject(this)
    const target = new Vector3()
    box.getSize(target)
    this.position.x = -target.x / 2
    this.position.y = target.y / 2

    this.visible = false
  }


  private handleKeyDown(event: KeyboardEvent) {
    let keycode = event.code;
    if (!keycode) keycode = event.key

    this.checkShift(keycode)
    this.checkLocks(keycode, event)

    const key = this.keyMap.get(keycode)
    if (key) {
      key.dispatchEvent<any>({ type: UIKeyEventTypes.BUTTON_DOWN })

      if (!event.ctrlKey && !event.altKey) {
        const setting = key.userData as KeySetting
        if (Array.isArray(setting.keys)) {
          const index = this.shift ? 1 : 0
          if (index < setting.keys.length)
            this.newtext(setting.keys[index])
        }
      }
      this.keydown({ code:event.code, key:event.key, shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, altKey: event.altKey })
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    let keycode = event.code;
    if (!keycode) keycode = event.key

    this.checkShift(keycode)

    const mesh = this.keyMap.get(keycode)
    if (mesh) mesh.dispatchEvent<any>({ type: UIKeyEventTypes.BUTTON_UP })
  }

  private checkShift(keycode: string) {
    if (keycode.startsWith('Shift')) {
      this.shift = !this.shift
      this.updateKeyText()
    }
  }

  private checkLocks(keycode: string, event: KeyboardEvent) {
    if (keycode == 'CapsLock' || keycode == 'NumLock' || keycode == 'ScrollLock') {
      const state = this.updateLockState(keycode, event)
      if (keycode == 'CapsLock') this.shift = state
      this.updateKeyText()
    }
  }

  private updateLockState(keycode: string, event: KeyboardEvent): boolean {
    const state = event.getModifierState(keycode)
    const caps = this.keyMap.get(keycode)
    if (caps) caps.dispatchEvent<any>({ type: UIKeyEventTypes.LOCK_STATE, state })
    return state
  }

  private getLockStates(event: KeyboardEvent) {
    this.shift = this.updateLockState('CapsLock', event)
    this.updateLockState('NumLock', event)
    this.updateLockState('ScrollLock', event)

    if (this.shift) this.updateKeyText()
  }

  updateKeyText() {
    const index = this.shift ? 1 : 0
    this.stateKeys.forEach(key => {
      key.mesh.dispatchEvent<any>({ type: UIKeyEventTypes.SET_TEXT, text: key.text[index] })
    })
  }


  private addKeys(keys: Array<KeySetting>) {
    keys.forEach(setting => {
      if (setting.text == '') return

      let text = ''
      if (Array.isArray(setting.keys))
        text = setting.keys[0]
      else if (setting.text)
        text = setting.text

      const mesh = this.createKey(text, setting.isicon, setting)
      this.keyMap.set(setting.keycode, mesh)

      if (!setting.isicon && setting.keys && setting.keys.length > 1) {
        this.stateKeys.push({ mesh, text: setting.keys as string[] })
      }
    })
  }

  // override
  createKey(text: string, isicon: boolean, setting: KeySetting): UIKey {
    const { x, y, z } = setting.position

    const params: TextButtonParameters = {
      position: { x, y, z },
      width: setting.width, height: setting.height,
      material: { color: 'gray' },
      label: {
        text, material: { color: 'black' }, isicon, size: setting.fontsize,
      }, value: setting
    }

    const key = new UIKey(params, this.interactive)
    key.position.copy(setting.position)
    this.add(key)

    const generateEvent = (): UIKeyboardEvent => {
      const shiftKey = setting.keycode.startsWith('Shift')
      const ctrlKey = setting.keycode.startsWith('Control')
      const altKey = setting.keycode.startsWith('Alt')
      return { code: setting.keycode, key:'', shiftKey, ctrlKey, altKey }
    }
    key.addEventListener(InteractiveEventType.POINTERDOWN, () => {
      this.keydown(generateEvent())
    })
    key.addEventListener(InteractiveEventType.POINTERUP, () => {
      this.keyup(generateEvent())
    })

    key.addEventListener(UIEventType.BUTTON_PRESSED, (e: any) => {
      // TODO: add support for repeat
      if (setting.keys) {
        const index = this.shift ? 1 : 0
        const text = setting.keys[index]
        this.newtext(text)
      }
      else {
        this.command(setting.keycode)

        if (setting.keycode == 'CapsLock') {
          this.shift = !this.shift
          key.dispatchEvent<any>({ type: UIKeyEventTypes.LOCK_STATE, state: this.shift })
          this.updateKeyText()
        }
      }

    })

    return key
  }

  keydown(event: UIKeyboardEvent) { }
  keyup(event: UIKeyboardEvent) { }

  newtext(text: string) { }

  command(keycode: string) { }
}
