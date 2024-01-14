import { InteractiveEventType, RoundedRectangleGeometry, RoundedRectangleShape, ThreeInteractive } from "three-flow";
import { PanelOptions } from "./panel";
import { UIOrientationType, SliderbarParameters } from "./model";
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

  private _value = -Infinity;
  get value(): number { return this._value }
  set value(newvalue: number) {
    newvalue = this.clampValue(newvalue)
    if (this._value != newvalue) {
      this._value = newvalue
      this.dispatchEvent<any>({ type: SliderbarEventType.VALUE_CHANGED, value: newvalue })
    }
  }

  private _min: number | undefined
  get min(): number | undefined { return this._min }
  set min(newvalue: number | undefined) {
    if (this._min != newvalue) {
      this._min = newvalue;
      if (newvalue != undefined)
        this.value = this.clampValue(this.value)
    }
  }

  private _max: number | undefined
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


  private _slidersize = 0
  get slidersize() { return this._slidersize }
  set slidersize(newvalue: number) {
    if (this._slidersize != newvalue) {
      this._slidersize = newvalue
      if (this.orientation == 'horizontal')
        this.slidermesh.geometry = new RoundedRectangleGeometry(newvalue, this.height * 0.9, this.sliderradius)
      else
        this.slidermesh.geometry = new RoundedRectangleGeometry(this.width * 0.9, newvalue, this.sliderradius)
    }
  }
  private slidermesh: Mesh
  private sliderradius: number
  private orientation: UIOrientationType

  constructor(parameters: SliderbarParameters, interactive: ThreeInteractive, options: SliderbarOptions = {}) {
    const orientation = parameters.orientation != undefined ? parameters.orientation : 'horizontal'
    if (orientation == 'horizontal' && parameters.height == undefined) parameters.height = 0.1
    if (orientation == 'vertical' && parameters.width == undefined) parameters.width = 0.1

    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'sliderbar'


    if (!parameters.slidermaterial) parameters.slidermaterial = { color: 'black' }
    const checkmaterial = this.materials.getMaterial('geometry', 'slider', parameters.slidermaterial)

    this.sliderradius = parameters.sliderradius != undefined ? parameters.sliderradius : 0.02
    this.orientation = orientation

    const slidermesh = new Mesh()
    slidermesh.material = checkmaterial
    this.add(slidermesh)
    slidermesh.position.z = 0.001

    // store the mesh and set its initial geometry by setting slider size
    this.slidermesh = slidermesh
    this.slidersize = parameters.slidersize != undefined ? parameters.slidersize : 0.1

    interactive.selectable.add(slidermesh)
    interactive.draggable.add(slidermesh)

    this._min = parameters.min != undefined ? parameters.min : 0
    this._max = parameters.max != undefined ? parameters.max : 100
    this._step = parameters.step != undefined ? parameters.step : 1

    slidermesh.addEventListener(InteractiveEventType.POINTERENTER, () => {
      if (!this.visible) return
      document.body.style.cursor = 'grab'
    })

    slidermesh.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
      if (document.body.style.cursor == 'grab')
        document.body.style.cursor = 'default'
    })

    const padding = 0.0//2//this.height / 10

    const moveto = (v: Vector3) => {
      if (this.min != undefined && this.max != undefined) {
        let value: number
        if (this.orientation == 'horizontal') {
          const halfwidth = (this.width - this.slidersize) / 2;
          value = MathUtils.mapLinear(v.x, -halfwidth, halfwidth, this.min, this.max);
        }
        else {
          const halfheight = (this.height - this.slidersize) / 2;
          value = MathUtils.mapLinear(-v.y, -halfheight, halfheight, this.min, this.max);
        }

        if (this.step) {
          // avoid problems when step is fractional
          value = Math.round(value / this.step) * this.step
        }

        this.value = value
      }
    }

    let dragging = false

    let offset: Vector3
    slidermesh.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
      if (!this.visible) return

      // remember where in the mesh the mouse was clicked to avoid jump on first drag
      offset = e.position.sub(slidermesh.position).clone()
      document.body.style.cursor = 'grabbing'

      dragging = true
    });
    slidermesh.addEventListener(InteractiveEventType.DRAGEND, () => {
      document.body.style.cursor = 'default'
      dragging = false
    });


    slidermesh.addEventListener(InteractiveEventType.DRAG, (e: any) => {
      if (!dragging || !this.visible) return

      moveto(e.position.sub(offset))
    });



    const valuechange = (value: number) => {
      if (this.min != undefined && this.max != undefined) {
        if (this.orientation == 'horizontal') {
          const halfwidth = (this.width - this.slidersize) / 2;
          const x = MathUtils.mapLinear(value, this.min, this.max, -halfwidth + padding, halfwidth - padding);
          slidermesh.position.x = x
        }
        else {
          const halfheight = (this.height - this.slidersize) / 2;
          const y = MathUtils.mapLinear(value, this.min, this.max, -halfheight + padding / 2, halfheight - padding / 2);
          slidermesh.position.y = -y
        }
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
