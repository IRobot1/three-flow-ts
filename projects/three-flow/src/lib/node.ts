import { MeshBasicMaterial, Mesh } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font } from "three/examples/jsm/loaders/FontLoader";

import { AbstractNode, NodeType, NodeState } from "./abstract-model";
import { FlowConnector } from "./connector";

export class FlowNode extends Mesh {
  // AbstractNode properties
  nodeid: string;
  location: { x: number; y: number; z: number };
  label: string;
  state: NodeState;
  nodetype: NodeType;
  inputs: string[];
  outputs: string[];
  error?: string;
  documentation?: string;
  category: string;
  resizable: boolean;
  draggable: boolean;
  labelsize: number;
  labelcolor: string;

  // Three.js specific properties
  labelMesh: Mesh;
  inputConnectors: FlowConnector[] = [];
  outputConnectors: FlowConnector[] = [];

  constructor(node: AbstractNode, private font: Font) {
    super();

    this.nodeid = node.nodeid;
    this.location = node.position;
    this.label = node.label;
    this.state = node.state;
    this.nodetype = node.nodetype;
    this.inputs = node.inputs;
    this.outputs = node.outputs;
    this.error = node.error;
    this.documentation = node.documentation;
    if (node.data) this.userData = node.data;
    this.category = node.category
    this.resizable = node.resizable
    this.draggable = node.draggable
    this.labelsize = node.labelsize
    this.labelcolor = node.labelcolor

    // Create the Three.js object
    this.position.set(this.location.x, this.location.y, this.location.z);

    // Create a text mesh for the label
    const textMaterial = new MeshBasicMaterial({ color: 0xffffff });
    this.labelMesh = new Mesh();
    this.labelMesh.material = textMaterial

    this.add(this.labelMesh);

    // Initialize input connectors
    this.inputs.forEach(inputId => {
      const connector = this.inputConnectors.find(c => c.connectorid === inputId);
      if (connector) {
        const threeConnector = new FlowConnector(connector, this);
        this.inputConnectors.push(threeConnector);
        this.add(threeConnector);
      }
    });

    // Initialize output connectors
    this.outputs.forEach(outputId => {
      const connector = this.outputConnectors.find(c => c.connectorid === outputId);
      if (connector) {
        const threeConnector = new FlowConnector(connector, this);
        this.outputConnectors.push(threeConnector);
        this.add(threeConnector);
      }
    });

    this.updateVisuals();
  }
  interact() { }

  updateVisuals() {
    // Update the position of the node
    this.position.set(this.location.x, this.location.y, this.location.z);

    // Update the text mesh based on the label and state
    this.labelMesh.geometry = new TextGeometry(this.label, { font: this.font, height: 0, size: this.labelsize});
    (this.labelMesh.material as any).color.set(
      this.state === "selected" ? 0xff0000 : this.labelcolor
    );

    // Update connectors
    this.inputConnectors.forEach((connector) => connector.updateVisuals());
    this.outputConnectors.forEach((connector) => connector.updateVisuals());
  }

  // ... other methods and properties
}
