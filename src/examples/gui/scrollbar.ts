import { ThreeInteractive } from "three-flow";
import { LabelParameters, SliderbarParameters, TextButtonParameters } from "./model";
import { SliderbarOptions, UISliderbar } from "./sliderbar";
import { UITextButton } from "./button-text";

export interface ScrollbarParameters extends SliderbarParameters {
  nextbutton?: TextButtonParameters
  prevbutton?: TextButtonParameters
}

export class UIScrollbar extends UISliderbar {
  constructor(parameters: ScrollbarParameters, interactive: ThreeInteractive, options: SliderbarOptions = {}) {
    const orientation = parameters.orientation != undefined ? parameters.orientation : 'horizontal'
    let height = parameters.height
    let width = parameters.width
    if (orientation == 'horizontal') {
      if (height == undefined) height = 0.1
      if (width == undefined) width = 1
      parameters.width = width - height * 2
      parameters.height = height
    }
    else if (orientation == 'vertical') {
      if (width == undefined) width = 0.1
      if (height == undefined) height = 1
      parameters.width = width
      parameters.height = height - width * 2
    }
    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'scrollabar'

    const size = orientation == 'horizontal' ? this.height : this.width

    // prev button    
    if (!parameters.prevbutton) parameters.prevbutton = { label: {} }
    if (!parameters.prevbutton.label.text) parameters.prevbutton.label.text = orientation == 'horizontal' ? 'chevron_left' : 'expand_less'
    parameters.prevbutton.label.isicon = true
    parameters.prevbutton.width = parameters.prevbutton.height = size

    const prevbutton = new UITextButton(parameters.prevbutton, this.interactive, this.options);
    this.add(prevbutton)
    if (orientation == 'horizontal')
      prevbutton.position.x = -(this.width + size) / 2
    else
      prevbutton.position.y = (this.height + size) / 2

    // next button
    if (!parameters.nextbutton) parameters.nextbutton = { label: {} }
    if (!parameters.nextbutton.label.text) parameters.nextbutton.label.text = orientation == 'horizontal' ? 'chevron_right' : 'expand_more'
    parameters.nextbutton.label.isicon = true
    parameters.nextbutton.width = parameters.nextbutton.height = size

    const nextbutton = new UITextButton(parameters.nextbutton, this.interactive, this.options);
    this.add(nextbutton)
    if (orientation == 'horizontal')
      nextbutton.position.x = (this.width + size) / 2
    else
      nextbutton.position.y = -(this.height + size) / 2
  }
}
