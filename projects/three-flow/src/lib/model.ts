import { Object3D, Line, Mesh } from "three";
import {
  AbstractConnector,
  AbstractEdge,
  AbstractNode
} from "./abstract-model";

export interface ThreeConnector extends AbstractConnector {
  object3D: Mesh;
  labelObject3D: Object3D;
  parentNode: ThreeNode;
  highlight: () => void;
  unhighlight: () => void;
  updateVisuals: () => void;
}

export interface ThreeEdge extends AbstractEdge {
  object3D: Line;

  interact: () => void;
  compatibility: (connectorId: string) => boolean;
  updateVisuals: () => void;
}

export interface ThreeNode extends AbstractNode {
  interact: () => void;
  updateVisuals: () => void;
}
