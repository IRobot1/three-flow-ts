import { Edge, Label } from "@dagrejs/dagre";
import { Mesh } from "three";

export interface AbstractConnector extends Label {
  index?: number; // order when there are multiple
  connectortype?: string;
  userData?: { [key: string]: any };
}

export type EdgeLineStyle = 'straight' | 'spline'

export interface AbstractEdge extends Edge {
  points?: Array<{ x: number, y: number }>
  color?: number | string;
  linestyle?: EdgeLineStyle;
  divisions?: number;
  thickness?: number;
  userData?: { [key: string]: any };
}

export interface AbstractNode extends Label {
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
  scaleable?: boolean;
  scalecolor?: number | string;
  scale?: number;
  minscale?: number;
  maxscale?: number;
  inputs?: AbstractConnector[]
  outputs?: AbstractConnector[]
}

export interface AbstractGraph {
  version: number;
  nodes: AbstractNode[],
  edges: AbstractEdge[]
}


export interface FlowHandle {
  id: string;
  widthchange: (mesh: Mesh) => void
  heightchange: (mesh: Mesh) => void
  width_direction: number // -1, 0 or 1
  height_direction: number // -1, 0, or 1
}

