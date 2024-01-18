import { MeshBasicMaterialParameters } from "three";
import { FontCache } from "./cache";
import { FlowMaterials } from "three-flow";
import { KeyboardInteraction } from "./keyboard-interaction";
import { InputField } from "./input-field";

export interface PositionParameters {
  x?: number | undefined // default is 0
  y?: number | undefined // default is 0
  z?: number | undefined // default is 0
}
export interface RotationParameters {
  x?: number | undefined // default is 0
  y?: number | undefined // default is 0
  z?: number | undefined // default is 0
}
export interface ScaleParameters {
  x?: number | undefined // default is 0
  y?: number | undefined // default is 0
  z?: number | undefined // default is 0
}

export interface SizeParameters {
  width?: number | undefined     //default is 1
  minwidth?: number | undefined  // defaults to width
  maxwidth?: number | undefined   // defaults to positive infinity

  height?: number | undefined    // default is 1
  minheight?: number | undefined // defaults to height
  maxheight?: number | undefined // defaults to positive infinity

  radius?: number | undefined    // default is 0.02

  //lockaspectratio?: boolean | undefined  // keep same aspect ratio between current width and height

  depth?: number | undefined     // default is 0
  mindepth?: number | undefined  // defaults to depth
  maxdepth?: number | undefined  // defaults to positive infinity

  // autosize
  autogrow?: boolean | undefined    // increase size to contain child objects
  autoshrink?: boolean | undefined  // decrease size to contain child objects
}

export interface TranformParameters {
  position?: PositionParameters | undefined
  rotation?: RotationParameters | undefined
  scale?: ScaleParameters | undefined
}

export interface BorderParameters {
  material?: MeshBasicMaterialParameters   // default is gray
  width?: number                           // default is 0.02
}

export interface PanelParameters extends TranformParameters, SizeParameters {
  // meta data
  id?: string | undefined   // optional name to assign the Object3D
  value?: any                  // default is undefined, assigned to Object3D userData

  // interaction
  selectable?: boolean | undefined  // default is true, interaction is allowed.  Set to false to disable interaction
  draggable?: boolean | undefined   // default is false, button can be moved

  // appearance
  fill?: MeshBasicMaterialParameters | undefined  // default is white
  border?: BorderParameters | undefined           // default is none
  highlight?: BorderParameters | undefined        // default is black
}

export type LabelAlignX = 'center' | 'left' | 'right'
export type LabelAlignY = 'middle' | 'top' | 'bottom'
export type LabelOverflow = 'clip' | 'slice'
export interface LabelParameters {
  id?: string
  text?: string
  isicon?: boolean // text is the name of an icon. see https://fonts.google.com/icons
  size?: number
  material?: MeshBasicMaterialParameters
  font?: string
  padding?: number
  alignX?: LabelAlignX
  alignY?: LabelAlignY
  visible?: boolean

  maxwidth?: number
  overflow?: LabelOverflow   // when text longer than max width, either clip or slice to show end text
}

export interface InputParameters extends PanelParameters {
  disabled?: boolean // default is false
  disabledMaterial?: MeshBasicMaterialParameters // default is dark gray
}
export interface ButtonParameters extends InputParameters {
  disableScaleOnClick?: boolean    // default is false
}
export interface TextButtonParameters extends ButtonParameters {
  label: LabelParameters
}
export interface TextEntryParameters extends InputParameters {
  label?: LabelParameters
  password?: boolean             // default is false
  passwordChar?: string          // defaut is *, any valid glyph for the font being used
  prompt?: string                // default is _, any valid glyph for the font being used
}
export interface NumberEntryParameters extends TextEntryParameters {
  initialvalue?: number
  min?: number
  max?: number
  step?: number
  decimals?: number
}

export interface CheckboxParameters extends InputParameters {
  checked?: boolean
  checkmaterial?: MeshBasicMaterialParameters
}
export interface ColorEntryParameters extends InputParameters {
}
export type UIOrientationType = 'vertical' | 'horizontal'
export interface SliderbarParameters extends InputParameters {
  initialvalue?: number
  min?: number
  max?: number
  step?: number
  slidersize?: number
  sliderradius?: number
  slidermaterial?: MeshBasicMaterialParameters
  orientation?: UIOrientationType // default is horizontal
}


export interface ListParameters extends InputParameters {
  data?: Array<any>             // default is empty, array of data, default type is string
  field?: string                // default is none, field name, if data is object.  Doesn't handle nested field path
  itemcount?: number            // default is 6, number of items to display before paging
  itemheight?: number           // default is 0.1, height needed to display each item
  selected?: string             // default is none, if there's a default selected item
  spacing?: number              // default is 0.02, spacing between items
  orientation?: UIOrientationType // default is vertical
  emptyText?: string             // default is 'List is empty'
  selectedMaterial?: MeshBasicMaterialParameters // default is 'black'
  fontSize?:number               // default is 0.07
}

export interface SelectParameters extends TextButtonParameters {
  initialselected?: string
  list: ListParameters
}


export interface UIOptions {
  fontCache?: FontCache
  materials?: FlowMaterials
  keyboard?: KeyboardInteraction
}
