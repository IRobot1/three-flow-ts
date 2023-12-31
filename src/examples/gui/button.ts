import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { InteractiveEventType, ThreeInteractive } from "three-flow";

import { ButtonParameters, UIEventType } from "./model";
import { PanelOptions, UIPanel } from "./panel";
import { UILabel } from "./label";
import { BufferGeometry, Mesh, MeshBasicMaterialParameters, Shape, ShapeGeometry } from "three";

export enum ButtonEventType {
  HIGHLIGHT_BUTTON = 'highlight_button',
  UNHIGHLIGHT_BUTTON = 'unhighlight_button',
  BUTTON_DOWN = 'button_down',
  BUTTON_UP = 'button_up',
}

export interface ButtonOptions extends PanelOptions {
}

export class UIButton extends UIPanel {

  private label?: UILabel
  private shape: Shape

  private _text = ''
  get text() { return this._text }
  set text(newvalue: string) {
    if (this._text != newvalue) {
      this._text = newvalue
      if (newvalue && this.label)
        this.label.text = newvalue
    }
  }

  constructor(parameters: ButtonParameters, interactive: ThreeInteractive, options: ButtonOptions = {}) {
    super(parameters, options)

    this.name = parameters.id != undefined ? parameters.id : 'button'

    if (parameters.label) {
      const label = new UILabel(parameters.label, { fontCache: this.fontCache, materialCache: this.materialCache })
      this.add(label)
      label.position.z = 0.001
      this.label = label
    }

    this.shape = this.rectangle(this.width, this.height, 0.02)

    const outline = this.createOutline(this.shape)

    const outlinematerial = this.materialCache.getMaterial('line', 'outline', <MeshBasicMaterialParameters>{ color: 'white' });
    const outlineMesh = new Mesh(outline, outlinematerial)
    outlineMesh.visible = false
    this.add(outlineMesh)

    const highlight = () => {
      outlineMesh.visible = true
    }
    this.highlight = highlight

    let clicking = false
    this.addEventListener(InteractiveEventType.POINTERENTER, () => {
      if (clicking || !this.visible) return
      document.body.style.cursor = 'pointer'
      highlight()
    })

    const unhighlight = () => {
      outlineMesh.visible = false
    }
    this.unhighlight = unhighlight
    this.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
      if (document.body.style.cursor == 'pointer')
        document.body.style.cursor = 'default'
      unhighlight()
    })


    const selectableChanged = () => {
      if (this.selectable)
        interactive.selectable.add(this)
      else
        interactive.selectable.remove(this)
    }
    this.addEventListener(UIEventType.SELECTABLE_CHANGED, () => { selectableChanged() })
    selectableChanged()

    const buttonDown = (generateEvent = false) => {
      if (clicking) return
      this.scale.addScalar(-0.04);
      if (generateEvent) this.pressed()
      clicking = true;
    }

    const buttonUp = () => {
      if (!clicking) return
      this.scale.addScalar(0.04);
      clicking = false;
    }

    this.addEventListener(InteractiveEventType.CLICK, () => {
      if (!this.visible) return;

      buttonDown(true)
      const timer = setTimeout(() => {
        buttonUp()
        clearTimeout(timer);
      }, 100);
    })

    this.buttonDown = buttonDown
    this.buttonUp = buttonUp

    this.addEventListener(ButtonEventType.HIGHLIGHT_BUTTON, highlight)
    this.addEventListener(ButtonEventType.UNHIGHLIGHT_BUTTON, unhighlight)
    this.addEventListener(ButtonEventType.BUTTON_DOWN, (e: any) => {
      buttonDown(e.generateEvent)
    })
    this.addEventListener(ButtonEventType.BUTTON_UP, buttonUp)
  }

  highlight() { }
  unhighlight() { }

  buttonDown(generateEvent = false) { }
  buttonUp() { }

  pressed() { this.dispatchEvent<any>({ type: UIEventType.BUTTON_PRESSED }) }

  createOutline(shape: Shape): BufferGeometry {
    const positions: Array<number> = []
    this.shape.getPoints().forEach(p => positions.push(p.x, p.y, 0))
    return new LineGeometry().setPositions(positions)
  }

  override createGeometry(parameters: ButtonParameters): BufferGeometry {
    return new ShapeGeometry(this.shape)
  }

  private rectangle(width: number, height: number, radius: number): Shape {
    const halfwidth = width / 2
    const halfheight = height / 2

    const shape = new Shape()
      .moveTo(-halfwidth + radius, -halfheight)
      .lineTo(halfwidth - radius, -halfheight)
      .quadraticCurveTo(halfwidth, -halfheight, halfwidth, -halfheight + radius)
      .lineTo(halfwidth, halfheight - radius)
      .quadraticCurveTo(halfwidth, halfheight, halfwidth - radius, halfheight)
      .lineTo(-halfwidth + radius, halfheight)
      .quadraticCurveTo(-halfwidth, halfheight, -halfwidth, halfheight - radius)
      .lineTo(-halfwidth, -halfheight + radius)
      .quadraticCurveTo(-halfwidth, -halfheight, -halfwidth + radius, -halfheight)

    return shape
  }

}
