import { InteractiveEventType, RoundedRectangleShape, ThreeInteractive } from "three-flow";
import { PanelOptions } from "./panel";
import { SliderbarParameters } from "./model";
import { MathUtils, Mesh, ShapeGeometry, Vector3 } from "three";
import { UIEntry } from "./input-field";
import { UIKeyboardEvent } from "./keyboard";

export enum SliderbarEventType {
  VALUE_CHANGED = 'value_changed'
}
export interface SliderbarOptions extends PanelOptions { }

export class UISliderbar extends UIEntry {
  inputtype: string = 'sliderbar'

  // clamp value between min and max if defined
  private clampValue(newvalue: number): number {
    if (this.min != undefined && this.max != undefined) {
      if (this.min > this.max) {
        console.warn(`min ${this.min} is greater than max ${this.max}`);
        let temp = this.min;
        this.min = this.max;
        this.max = temp;
      }
      newvalue = MathUtils.clamp(newvalue, this.min, this.max);
    }
    return newvalue
  }

  private _value = 0;
  get value(): number { return this._value }
  set value(newvalue: number) {
    newvalue = this.clampValue(newvalue)
    if (this._value != newvalue) {
      this._value = newvalue
      this.dispatchEvent<any>({ type: SliderbarEventType.VALUE_CHANGED, value: newvalue })
    }
  }

  private _min?= 0
  get min(): number | undefined { return this._min }
  set min(newvalue: number | undefined) {
    if (this._min != newvalue) {
      this._min = newvalue;
      if (newvalue != undefined)
        this.value = this.clampValue(this.value)
    }
  }

  private _max?= 100
  get max(): number | undefined { return this._max }
  set max(newvalue: number | undefined) {
    if (this._max != newvalue) {
      this._max = newvalue;
      if (newvalue != undefined)
        this.value = this.clampValue(this.value)
    }
  }

  private _step: number | undefined
  get step(): number | undefined { return this._step }
  set step(newvalue: number | undefined) {
    if (this._step != newvalue) {
      this._step = newvalue
      //  if (newvalue == undefined) {
      //    if (this.min != undefined && this.max != undefined) {
      //      this._step = (this.max - this.min) / 1000;
      //    }
      //  }
    }

  }

  constructor(parameters: SliderbarParameters, interactive: ThreeInteractive, options: SliderbarOptions = {}) {
    if (parameters.height == undefined) parameters.height = 0.1

    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'sliderbar'


    if (!parameters.slidermaterial) parameters.slidermaterial = { color: 'black' }
    const checkmaterial = this.materialCache.getMaterial('geometry', 'slider', parameters.slidermaterial)

    let sliderwidth = parameters.sliderwidth != undefined ? parameters.sliderwidth : 0.1
    const sliderradius = parameters.sliderradius != undefined ? parameters.sliderradius : 0.02

    const shape = new RoundedRectangleShape(sliderwidth, this.height * 0.9, sliderradius)
    const mesh = new Mesh(new ShapeGeometry(shape), checkmaterial)
    this.add(mesh)
    mesh.position.z = 0.001

    interactive.selectable.add(mesh)
    interactive.draggable.add(mesh)

    this.min = parameters.min != undefined ? parameters.min : 0
    this.max = parameters.max != undefined ? parameters.max : 100
    this.step = parameters.step != undefined ? parameters.step : 1

    mesh.addEventListener(InteractiveEventType.POINTERENTER, () => {
      if (!this.visible) return
      document.body.style.cursor = 'grab'
    })

    mesh.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
      if (document.body.style.cursor == 'grab')
        document.body.style.cursor = 'default'
    })

    const padding = this.height / 10

    const moveto = (x: number) => {
      if (this.min != undefined && this.max != undefined) {
        const halfwidth = (this.width - sliderwidth) / 2;
        x = MathUtils.clamp(x, -halfwidth + padding, halfwidth - padding);
        mesh.position.x = x

        const value = MathUtils.mapLinear(x, -halfwidth, halfwidth, this.min, this.max);

        if (this.step) {
          // avoid problems when step is fractional
          this.value = Math.round(value / this.step) * this.step
        }
      }
    }

    let dragging = false

    let offset: Vector3
    mesh.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
      if (!this.visible) return

      moveto(e.position.x)
      document.body.style.cursor = 'grabbing'

      dragging = true
    });
    mesh.addEventListener(InteractiveEventType.DRAGEND, () => {
      document.body.style.cursor = 'default'
      dragging = false
    });


    mesh.addEventListener(InteractiveEventType.DRAG, (e: any) => {
      if (!dragging || !this.visible) return

      moveto(e.position.x)
    });


    const calcwidths = () => {
      let box = this.geometry.boundingBox
      if (box) {
        sliderwidth = box.max.x - box.min.x
      }

      box = mesh.geometry.boundingBox
      if (box) {
        sliderwidth = box.max.x - box.min.x
      }
    }

    const valuechange = (value: number) => {
      if (this.min != undefined && this.max != undefined) {
        calcwidths()
        const halfwidth = (this.width - sliderwidth) / 2;
        const x = MathUtils.mapLinear(value, this.min, this.max, -halfwidth + padding, halfwidth - padding);
        mesh.position.x = x
      }
    }

    this.addEventListener<any>(SliderbarEventType.VALUE_CHANGED, (e) => { valuechange(e.value) })
    // force initial position
    this.value = parameters.initialvalue ? parameters.initialvalue : 0
  }

  override handleKeyDown(e: UIKeyboardEvent) {
    //if (!this.active || this.disabled) return
    switch (e.key) {
      case 'Home':
        if (this.min != undefined) this.value = this.min
        break;
      case 'End':
        if (this.max != undefined) this.value = this.max
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        if (this.step != undefined) this.value -= this.step
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        if (this.step != undefined) this.value += this.step
        break;
      case 'PageUp':
        if (this.step != undefined) this.value += this.step * 10
        break;
      case 'PageDown':
        if (this.step != undefined) this.value -= this.step * 10
        break;
    }
  }
}