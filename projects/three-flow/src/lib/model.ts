import { Edge, Label } from "@dagrejs/dagre";
import { Mesh } from "three";

export interface FlowConnectorData extends Label {
  index?: number; // order when there are multiple
  connectortype?: string;
  userData?: { [key: string]: any };
}

export type ArrowType = 'from' | 'to'
export type ArrowStyle = 'default'

export interface FlowArrowData {
  type?: ArrowType;
  width?: number;
  height?: number;
  indent?: number;

  color?: number | string;
  arrowstyle?: ArrowStyle;
  scale?: number;
}

export type EdgeLineStyle = 'straight' | 'spline'

export interface FlowEdgeData extends Edge {
  color?: number | string;
  linestyle?: EdgeLineStyle;
  divisions?: number;
  thickness?: number;
  toarrow?: FlowArrowData;
  fromarrow?: FlowArrowData;
  userData?: { [key: string]: any };

  points?: Array<{ x: number, y: number }>  // layout positions of line segments
}

export type AbstractNodeType = 'node' | 'route'
export interface FlowNodeData extends Label {
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
}

export interface FlowRouteData extends FlowNodeData {
  radius?: number
}

export interface FlowGraphData {
  version: number;
  nodes: FlowNodeData[],
  edges: FlowEdgeData[]
}


export interface FlowHandleData {
  id: string;
  widthchange: (mesh: Mesh) => void
  heightchange: (mesh: Mesh) => void
  width_direction: number // -1, 0 or 1
  height_direction: number // -1, 0, or 1
}

