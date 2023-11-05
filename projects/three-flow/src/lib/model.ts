import {
  AbstractConnector,
  AbstractEdge,
  AbstractNode
} from "./abstract-model";

export interface ThreeConnector extends AbstractConnector {
  highlight: () => void;
  unhighlight: () => void;
  updateVisuals: () => void;
}

export interface ThreeEdge extends AbstractEdge {
  interact: () => void;
  compatibility: (connectorId: string) => boolean;
  updateVisuals: () => void;
}

export interface ThreeNode extends AbstractNode {
  interact: () => void;
  updateVisuals: () => void;
}
