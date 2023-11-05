export type ConnectorType =
  | "input"
  | "output"
  | "execution"
  | "event"
  | "debugging";

export type ConnectorState = "selected" | "active" | "disabled" | "default";

export interface AbstractConnector {
  connectorid: string;
  connectortype: ConnectorType;
  location: { x: number; y: number; z: number };
  connectedEdges: string[];
  multiplicity: number;
  compatibility: string[];
  draggable: boolean;
  size: number;
  shape: string;
  color: string;
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
  edgeid: string;
  startConnectorId: string;
  endConnectorId: string;
  intermediatePoints: string[]; // IDs of intermediate points
  label?: string;
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
  nodeid: string;
  nodetype: NodeType;
  position: { x: number; y: number; z: number };
  width: number;
  height: number;
  color: number | string;
  label: string;
  labelsize: number;
  labelcolor: string;
  data?: { [key: string]: any };
  state: NodeState;
  category: string;
  resizable: boolean;
  draggable: boolean;
  error?: string;
  documentation?: string;
  inputs: string[];
  outputs: string[];
}

export function serializeDiagram(
  nodes: AbstractNode[],
  connectors: AbstractConnector[],
  edges: AbstractEdge[]
): string {
  const diagram = {
    verion: 1,
    nodes,
    connectors,
    edges
  };
  return JSON.stringify(diagram, null, 2);
}
