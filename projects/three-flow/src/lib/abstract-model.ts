export type ConnectorType =
  | "input"
  | "output"
  | "execution"
  | "event"
  | "debugging";

export type ConnectorState = "selected" | "active" | "disabled" | "default";

export interface AbstractConnector {
  id: string;
  connectortype: ConnectorType;
  order: number;
  connectedEdges: string[];
  multiplicity: number;
  compatibility: string[];
  draggable: boolean;
  size: number;
  shape: string;
  color: number | string;
  label: string;
  labelsize: number;
  labelcolor: string;
  state: ConnectorState;
  data?: { [key: string]: any };
  error?: string;
  documentation?: string;
}

export interface AbstractIntermediatePoint {
  id: string;
  position: { x: number; y: number; z: number };
  draggable: boolean;
  selectable: boolean;
  state: "selected" | "active" | "default";
  snapping: boolean;
}

export type EdgeState =
  | "selected"
  | "active"
  | "inactive"
  | "error"
  | "default";
export type EdgeRouting = "straight" | "curved" | "segmented";

export interface AbstractEdge {
  id: string;
  from: string;
  to: string;
  intermediatePoints: string[]; // IDs of intermediate points
  color: number | string;
  label?: string;
  labelsize: number;
  labelcolor: number | string;
  selectable: boolean;
  highlighting: boolean;
  data?: { [key: string]: any };
  state: EdgeState;
  error?: string;
  routing: EdgeRouting;
  arrowheads: boolean;
}

export type NodeType = "event" | "function" | "return";

export type NodeState = "selected" | "active" | "disabled" | "default";

export interface AbstractNode {
  id: string;
  nodetype: NodeType;
  position: { x: number; y: number; z: number };
  width: number;
  height: number;
  color: number | string;
  label: string;
  labelsize: number;
  labelcolor: number | string;
  data?: { [key: string]: any };
  state: NodeState;
  category: string;
  resizable: boolean;
  draggable: boolean;
  scaleable: boolean;
  scale: number;
  error?: string;
  documentation?: string;
  inputs: string[]; // ids
  outputs: string[]; // ids
}

export interface AbstractDiagram {
  version: number;
  nodes: Partial<AbstractNode>[],
  connectors: Partial<AbstractConnector>[],
  edges: Partial<AbstractEdge>[]
}

export interface DiagramOptions {
  gridsize: number
}
