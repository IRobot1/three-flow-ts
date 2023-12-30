import { MeshBasicMaterialParameters } from "three";
import { LineMaterialParameters } from "three/examples/jsm/lines/LineMaterial";
import { FontCache, MaterialCache } from "./cache";

export type BorderStyle = 'none' | 'solid' | 'dashed'
export interface BorderParameters extends LineMaterialParameters {
  style?: BorderStyle | undefined // default is none
}

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
export interface PanelParameters extends TranformParameters, SizeParameters {
  // meta data
  id?: string | undefined   // optional name to assign the Object3D
  value?: any                  // default is undefined, assigned to Object3D userData

  // interaction
  selectable?: boolean | undefined  // default is true, interaction is allowed.  Set to false to disable interaction
  draggable?: boolean | undefined   // default is false, button can be moved

  // appearance
  material?: MeshBasicMaterialParameters | undefined  // default is white
  border?: BorderParameters | undefined               // default is none
}

export type LabelAlignX = 'center' | 'left' | 'right'
export type LabelAlignY = 'middle' | 'top' | 'bottom'
export type LabelTextAlign = 'left' | 'right' | 'center' | 'justify'

export interface LabelParameters {
  id?:string
  text?: string
  isicon?: boolean // text is the name of an icon. see https://fonts.google.com/icons
  size?: number
  material?: MeshBasicMaterialParameters
  font?: string
  padding?: number
  alignX?: LabelAlignX
  alignY?: LabelAlignY
  wrapwidth?: number
  textalign?: LabelTextAlign
  visible?: boolean
}

export interface ButtonParameters extends PanelParameters {
label?: LabelParameters
}
export enum GUIEventType {
  WIDTH_CHANGED = 'width_changed',
  HEIGHT_CHANGED = 'height_changed',
  DEPTH_CHANGED = 'depth_changed',
  DRAGGABLE_CHANGED = 'draggable_changed',
  SELECTABLE_CHANGED = 'selectable_changed',
  DRAGGED = 'dragged',
  LABEL_READY = 'label_ready',
}

export interface UIOptions {
  fontCache?: FontCache
  materialCache?: MaterialCache
}
