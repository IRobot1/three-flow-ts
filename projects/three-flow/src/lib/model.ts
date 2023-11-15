import { Mesh } from "three";

export interface FlowConnectorParameters {
  text?: string;
  index?: number; // order when there are multiple
  connectortype?: string;
  userData?: { [key: string]: any };
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
  v: string;
  w: string;
  name?: string;
  points?: Array<{ x: number, y: number }>  // layout positions of line segments

  color?: number | string;
  linestyle?: EdgeLineStyle;
  divisions?: number;
  thickness?: number;
  toarrow?: FlowArrowParameters;
  fromarrow?: FlowArrowParameters;
  userData?: { [key: string]: any };
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
  label?: string;
  labelsize?: number;
  labelcolor?: number | string;
  labelfont?: string;
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

export interface FlowLayout {
  removeEdge(from: string, to: string): any;
  setEdge(from: string, to: string, edge: FlowEdgeParameters): any;
  removeNode(name: string): any;
  setNode(name: string, node: FlowNodeParameters): any;
  nodes(): Array<string>;
  edges(): Array<FlowEdgeParameters>;
  node(name: string): any;
  layout(options: any, filter?: (nodeId: string) => boolean): boolean;
}
