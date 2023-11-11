import { Edge, Label } from "@dagrejs/dagre";

export interface AbstractConnector extends Label {
  index?: number; // order when there are multiple
  connectortype?: string;
  userData?: { [key: string]: any };
}

export interface AbstractEdge extends Edge {
  points?: Array<{ x: number, y: number }>
  userData?: { [key: string]: any };
}

export interface AbstractNode extends Label {
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
  color?: number | string;
  label?: string;
  labelsize?: number;
  labelcolor?: number | string;
  labelfont?: string;
  userData?: { [key: string]: any };
  resizable?: boolean;
  resizecolor?: number | string;
  draggable?: boolean;
  scaleable?: boolean;
  scalecolor?: number | string;
  scale?: number;
  inputs?: AbstractConnector[]
  outputs?: AbstractConnector[]
}

export interface AbstractGraph {
  version: number;
  nodes: AbstractNode[],
  edges: AbstractEdge[]
}

