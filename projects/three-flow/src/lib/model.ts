import { EulerOrder, Mesh, Vector3 } from "three";

export interface FlowTransform {
  translate?: { x?: number, y?: number, z?: number }
  rotate?: { x?: number, y?: number, z?: number }
}

export type LabelAlignX = 'center' | 'left' | 'right'
export type LabelAlignY = 'middle' | 'top' | 'bottom'
export type LabelTextAlign = 'left' | 'right' | 'center' | 'justify'

export interface FlowLabelParameters {
  text?: string;
  isicon?: boolean // text is the name of an icon. see https://fonts.google.com/icons
  size?: number;
  color?: number | string;
  font?: string;
  padding?: number;
  alignX?: LabelAlignX
  alignY?: LabelAlignY
  hidden?: boolean
  wrapwidth?: number
  textalign?: LabelTextAlign
}

export type AnchorType = 'left' | 'right' | 'top' | 'bottom' | 'center'
export interface FlowConnectorParameters {
  id: string;
  anchor?: AnchorType; // default is left
  index?: number; // order when there are multiple
  userData?: { [key: string]: any };
  label?: FlowLabelParameters
  labeloffset?: number // default is 1.5 times size of geometry
  transform?: FlowTransform; // adjust position and rotation
  shape?: string // allow each connector to have custom shape
  hidden?: boolean
  color?: number | string
  radius?: number // shape radius
  width?: number  // if shape has specific width, otherwise radius*2
  height?: number // if shape has specific height, otherwise radius*2
}

export type ArrowType = 'from' | 'to'
export type ArrowStyle = 'default'

export interface FlowArrowParameters {
  type?: ArrowType;
  width?: number;
  height?: number;
  indent?: number;

  color?: number | string;
  arrowstyle?: ArrowStyle;
  scale?: number;
}

export type EdgeLineStyle = 'straight' | 'offset' | 'split' | 'spline'

export interface FlowEdgeParameters {
  from: string; // from node id
  to: string; // to node id
  id?: string;

  points?: Array<{ x: number, y: number }>  // dagre layout positions of line segments

  color?: number | string;
  linestyle?: EdgeLineStyle;
  lineoffset?: number; // offset from connector to start bending line (when linestyle is offset or spline)
  divisions?: number;
  thickness?: number;
  toarrow?: FlowArrowParameters;
  fromarrow?: FlowArrowParameters;
  userData?: { [key: string]: any };

  fromconnector?: string; // optional connector id on from node
  toconnector?: string;   // optional connector id on to node
}

export type FlowNodeType = 'node' | 'route'
export interface FlowNodeParameters {
  id?: string;
  type?: FlowNodeType
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  minwidth?: number;
  maxwidth?: number;
  height?: number;
  minheight?: number;
  maxheight?: number;
  color?: number | string;
  label?: FlowLabelParameters;
  labelanchor?: AnchorType;
  labeltransform?: FlowTransform;
  userData?: { [key: string]: any };
  resizable?: boolean;
  resizecolor?: number | string;
  draggable?: boolean;
  scalable?: boolean;
  selectable?: boolean;
  scalecolor?: number | string;
  scale?: number;
  minscale?: number;
  maxscale?: number;
  hidden?: boolean;
  connectors?: FlowConnectorParameters[]

}

export interface FlowRouteParameters extends FlowNodeParameters {
  radius?: number
}

export interface FlowDiagramParameters {
  version?: number;
  nodes: FlowNodeParameters[],
  edges: FlowEdgeParameters[]
}


export interface FlowHandleParameters {
  id: string;
  widthchange: (mesh: Mesh) => void
  heightchange: (mesh: Mesh) => void
  width_direction: number // -1, 0 or 1
  height_direction: number // -1, 0, or 1
}


export const FlowEventType = {
  DISPOSE: 'dispose',
  DRAGGED: 'dragged',
  NODE_ADDED: 'node_added',
  NODE_REMOVED: 'node_removed',
  EDGE_ADDED: 'edge_added',
  EDGE_REMOVED: 'edge_removed',
  ACTIVE_CHANGED: 'active_changed',
  WIDTH_CHANGED: 'width_changed',
  HEIGHT_CHANGED: 'height_changed',
  SCALE_CHANGED: 'scale_changed',
  DRAGGABLE_CHANGED: 'draggable_changed',
  SCALABLE_CHANGED: 'scalable_changed',
  RESIZABLE_CHANGED: 'resizable_changed',
  HIDDEN_CHANGED: 'hidden_changed',
}

export interface LayoutResult {
  width: number
  height: number
  nodes: Array<{ id: string, x: number, y: number }>
  edges: Array<{ id: string, points: Array<{ x: number, y: number }> }>
}

export interface FlowLayout {
  setEdge(from: string, to: string, edge: FlowEdgeParameters): any;
  removeEdge(edge: FlowEdgeParameters, from: string, to: string): any;
  setNode(name: string, node: FlowNodeParameters): any;
  removeNode(name: string): any;
  layout(options: any, filter?: (nodeId: string) => boolean): LayoutResult;
  dispose(): void;
}
