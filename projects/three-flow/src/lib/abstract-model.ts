export interface AbstractConnector {
  id: string;
  connectortype: string;
  userData: { [key: string]: any };
}

export interface AbstractEdge {
  id: string;
  from: string;
  to: string;
  userData: { [key: string]: any };
}

export interface AbstractNode {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  color: number | string;
  label: string;
  labelsize: number;
  labelcolor: number | string;
  labelfont: string;
  userData: { [key: string]: any };
  resizable: boolean;
  resizecolor: number | string;
  draggable: boolean;
  scaleable: boolean;
  scalecolor: number | string;
  scale: number;
  inputs: string[]; // ids
  outputs: string[]; // ids
}

export interface AbstractGraph {
  version: number;
  nodes: Partial<AbstractNode>[],
  connectors: Partial<AbstractConnector>[],
  edges: Partial<AbstractEdge>[]
}

