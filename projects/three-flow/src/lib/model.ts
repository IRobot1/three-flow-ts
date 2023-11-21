import { EulerOrder, Mesh, Vector3 } from "three";

export interface FlowTransform {
  translate?: { x?: number, y?: number, z?: number }
  rotate?: { x?: number, y?: number, z?: number }
}

export type LabelAlignX = 'center' | 'left' | 'right'
export type LabelAlignY = 'middle' | 'top' | 'bottom'

export interface FlowLabelParameters {
  text?: string;
  size?: number;
  color?: number | string;
  font?: string;
  padding?: number;
  alignX?: LabelAlignX
  alignY?: LabelAlignY
}

export type AnchorType = 'left' | 'right' | 'top' | 'bottom' | 'center'
export interface FlowConnectorParameters {
  id: string;
  anchor?: AnchorType; // default is left
  index?: number; // order when there are multiple
  userData?: { [key: string]: any };
  label?: FlowLabelParameters
  labeloffset?: number // default is 1.5 times size of geometry
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

export type EdgeLineStyle = 'straight' | 'spline'

export interface FlowEdgeParameters {
  // first four fields make parameters compatible with dagre for easier layout
  v: string; // from node id
  w: string; // to node id
  name?: string;
  points?: Array<{ x: number, y: number }>  // layout positions of line segments

  color?: number | string;
  linestyle?: EdgeLineStyle;
  divisions?: number;
  thickness?: number;
  toarrow?: FlowArrowParameters;
  fromarrow?: FlowArrowParameters;
  userData?: { [key: string]: any };

  fromconnector?: string; // optional connector id on from node
  toconnector?: string;   // optional connector id on to node
}

export type AbstractNodeType = 'node' | 'route'
export interface FlowNodeParameters {
  text?: string;
  type?: AbstractNodeType
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
  version: number;
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
