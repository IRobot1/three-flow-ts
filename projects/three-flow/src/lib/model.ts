import { Mesh, MeshBasicMaterialParameters, Vector2 } from "three"

export interface FlowTransform {
  translate?: { x?: number, y?: number, z?: number }
  rotate?: { x?: number, y?: number, z?: number }
}

export type LabelAlignX = 'center' | 'left' | 'right'
export type LabelAlignY = 'middle' | 'top' | 'bottom'
export type LabelTextAlign = 'left' | 'right' | 'center' | 'justify'

export interface FlowLabelParameters {
  text?: string
  isicon?: boolean // text is the name of an icon. see https://fonts.google.com/icons
  size?: number
  material?: MeshBasicMaterialParameters
  font?: string
  padding?: number
  alignX?: LabelAlignX
  alignY?: LabelAlignY
  hidden?: boolean
  wrapwidth?: number
  textalign?: LabelTextAlign
}

export type AnchorType = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'front' | 'back'
export interface FlowConnectorParameters {
  id: string
  anchor?: AnchorType // default is left
  index?: number // order when there are multiple
  userData?: { [key: string]: any }
  label?: FlowLabelParameters
  labeloffset?: number // default is 1.5 times size of geometry
  transform?: FlowTransform // adjust position and rotation
  shape?: string // allow each connector to have custom shape
  hidden?: boolean
  material?: MeshBasicMaterialParameters
  radius?: number // shape radius
  width?: number  // if shape has specific width, otherwise radius*2
  height?: number // if shape has specific height, otherwise radius*2
  selectable?: boolean // default is false
  selectcursor?: string // default is 'grab' see https://developer.mozilla.org/docs/Web/CSS/cursor
  draggable?: boolean // listen for drag events
  startDragDistance?: number  // distance moved before dragging starts
  createOnDrop?: boolean // call dropCompleted when dragging starts or ends. Default is when it ends
  allowDrop?: boolean
  limit?: number  // limit number of connections, default is Infinity
}

export type ArrowType = 'from' | 'to'
export type ArrowStyle = 'default'

export interface FlowArrowParameters {
  type?: ArrowType
  width?: number
  height?: number
  indent?: number

  material?: MeshBasicMaterialParameters
  arrowstyle?: ArrowStyle
  scale?: number
  offset?: number // from begging or end of edge line
}

export type EdgeLineStyle = 'straight' | 'step' | 'bezier'

export interface FlowEdgeParameters {
  from: string // from node id
  to: string // to node id
  id?: string

  points?: Array<Vector2>  // dagre layout positions of line segments

  z?: number // default is -0.005
  material?: MeshBasicMaterialParameters
  linestyle?: EdgeLineStyle
  lineoffset?: number // offset from connector to start drawing edge
  divisions?: number
  thickness?: number
  toarrow?: FlowArrowParameters
  fromarrow?: FlowArrowParameters
  userData?: { [key: string]: any }

  fromconnector?: string // optional connector id on from node
  toconnector?: string   // optional connector id on to node

  label?: FlowLabelParameters

}

export type FlowNodeType = 'node' | 'route' | string
export interface FlowNodeParameters {
  id?: string
  type?: FlowNodeType
  x?: number
  y?: number
  z?: number
  width?: number
  minwidth?: number
  maxwidth?: number
  height?: number
  minheight?: number
  maxheight?: number
  depth?: number
  mindepth?: number
  maxdepth?: number
  lockaspectratio?: boolean
  material?: MeshBasicMaterialParameters
  label?: FlowLabelParameters
  labelanchor?: AnchorType
  labeltransform?: FlowTransform
  autogrow?: boolean // increase width to contain longer label
  userData?: { [key: string]: any }
  resizable?: boolean
  resizematerial?: MeshBasicMaterialParameters
  draggable?: boolean
  scalable?: boolean
  selectable?: boolean
  scalematerial?: MeshBasicMaterialParameters
  scale?: number
  minscale?: number
  maxscale?: number
  hidden?: boolean
  connectors?: FlowConnectorParameters[]

}

export interface FlowRouteParameters extends FlowNodeParameters {
  radius?: number
  dragging?: boolean  // in use for dragging
}

export interface FlowDiagramParameters {
  version?: number
  nodes: FlowNodeParameters[],
  edges: FlowEdgeParameters[]
}


export interface FlowHandleParameters {
  id: string
  widthchange: (mesh: Mesh) => void
  heightchange: (mesh: Mesh) => void
  width_direction: number // -1, 0 or 1
  height_direction: number // -1, 0, or 1
}


export const FlowEventType = {
  DIAGRAM_NEW: 'diagram_new',
  DIAGRAM_PROPERTIES: 'diagram_properties',
  DISPOSE: 'dispose',
  DRAGGED: 'dragged',
  DRAG_OVER: 'drag_over',
  NODE_ADDED: 'node_added',
  NODE_REMOVED: 'node_removed',
  NODE_SELECTED: 'node_selected',
  NODE_PROPERTIES: 'node_properties',
  EDGE_ADDED: 'edge_added',
  EDGE_DELETE: 'edge_delete',
  EDGE_REMOVED: 'edge_removed',
  //EDGE_SELECTED: 'edge_selected',
  CONNECTOR_ADDED: 'connector_added',
  CONNECTOR_SELECTED: 'connector_selected',
  CONNECTOR_PROPERTIES: 'connector_properties',
  CONNECTOR_REMOVED: 'connector_removed',
  ACTIVE_CHANGED: 'active_changed',
  WIDTH_CHANGED: 'width_changed',
  HEIGHT_CHANGED: 'height_changed',
  DEPTH_CHANGED: 'depth_changed',
  SCALE_CHANGED: 'scale_changed',
  DRAGGABLE_CHANGED: 'draggable_changed',
  SCALABLE_CHANGED: 'scalable_changed',
  RESIZABLE_CHANGED: 'resizable_changed',
  SELECTABLE_CHANGED: 'selectable_changed',
  HIDDEN_CHANGED: 'hidden_changed',
  DISABLE_CHANGED: 'disable_changed',
  LABEL_READY: 'synccomplete',
  KEY_DOWN: 'keydown',
  KEY_UP: 'keyup',
}

export interface LayoutResult {
  width: number
  height: number
  nodes: Array<{ id: string, x: number, y: number }>
  edges: Array<{ id: string, points: Array<Vector2> }>
}

export interface FlowLayout {
  layout(nodes: Array<FlowNodeParameters>, edges: Array<FlowEdgeParameters>, options: any, filter?: (nodeId: string) => boolean): LayoutResult
  dispose(): void
}
