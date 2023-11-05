import { MeshBasicMaterial, Mesh, PlaneGeometry, Shape, ShapeGeometry, Color, Vector3 } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font } from "three/examples/jsm/loaders/FontLoader";

import { AbstractNode, NodeType, NodeState, AbstractConnector, AbstractDiagram } from "./abstract-model";
import { FlowConnector } from "./connector";
import { connect } from "rxjs";

export class FlowNode extends Mesh {
  // AbstractNode properties
  nodeid: string;
  width: number;
  height: number;
  color: number | string;
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

  constructor(private diagram: AbstractDiagram, node: AbstractNode, private font: Font) {
    super();

    this.nodeid = node.nodeid;
    this.width = node.width;
    this.height = node.height;
    this.color = node.color
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

    const radius = Math.min(this.width, this.height) * 0.1
    const shape = this.roundedRect(this.width, this.height, radius)
    this.geometry = new ShapeGeometry(shape)

    this.material = new MeshBasicMaterial({ color: this.color });

    this.position.set(this.location.x, this.location.y, this.location.z);


    // Create a text mesh for the label
    const textMaterial = new MeshBasicMaterial({ color: 0xffffff });
    this.labelMesh = new Mesh();
    this.labelMesh.material = textMaterial
    this.labelMesh.position.set(0, this.height / 2 - this.labelsize * 1.2, 0.001)

    this.add(this.labelMesh);

    // Initialize input connectors
    const starty = this.height / 2 - this.labelsize * 3
    let y = starty
    this.inputs.forEach(id => {
      const connector = this.diagram.connectors.find(c => c.connectorid == id)
      if (connector) {
        const threeConnector = new FlowConnector(connector);
        threeConnector.position.set(-this.width / 2, y, 0.001)
        this.inputConnectors.push(threeConnector);
        this.add(threeConnector);

      }
      y -= 0.22
    });

    // Initialize output connectors
    y = starty
    this.outputs.forEach(id => {
      const connector = this.diagram.connectors.find(c => c.connectorid == id)
      if (connector) {
        const threeConnector = new FlowConnector(connector);
        threeConnector.position.set(this.width / 2, y, 0.001)
        this.outputConnectors.push(threeConnector);
        this.add(threeConnector);
      }
      y -= 0.22
    });

    this.updateVisuals();
  }

  // used when node is moved and edge needs to redraw using new connector position
  getConnector(id: string): FlowConnector | undefined {
    let connector = this.inputConnectors.find(c => c.connectorid == id)
    if (!connector) {
      connector = this.outputConnectors.find(c => c.connectorid == id)
    }
    return connector;
  }

  interact() { }

  updateVisuals() {
    // Update the position of the node
    this.position.set(this.location.x, this.location.y, this.location.z);

    // Update the text mesh based on the label and state
    const geometry = new TextGeometry(this.label, { font: this.font, height: 0, size: this.labelsize });
    geometry.center()
    this.labelMesh.geometry = geometry;

    const setColor = (material: any, color: number | string) => {
      material.color.set(color)
    }

    // Update connectors
    this.inputConnectors.forEach((connector) => connector.updateVisuals());
    this.outputConnectors.forEach((connector) => connector.updateVisuals());

    // Update node material based on state
    switch (this.state) {
      case 'selected':
        setColor(this.material, 0xaaaaaa);
        break;
      case 'active':
        setColor(this.material, 0x00ff00);
        break;
      case 'disabled':
        setColor(this.material, 0x444444);
        break;
      default:
        setColor(this.material, this.color);
        break;
    }
  }

  private roundedRect(width: number, height: number, radius: number): Shape {
    const ctx = new Shape();
    const halfwidth = width / 2
    const halfheight = height / 2
    ctx.moveTo(-halfwidth + radius, -halfheight);
    ctx.lineTo(halfwidth - radius, -halfheight);
    ctx.quadraticCurveTo(halfwidth, -halfheight, halfwidth, -halfheight + radius);
    ctx.lineTo(halfwidth, halfheight - radius);
    ctx.quadraticCurveTo(halfwidth, halfheight, halfwidth - radius, halfheight);
    ctx.lineTo(-halfwidth + radius, halfheight);
    ctx.quadraticCurveTo(-halfwidth, halfheight, -halfwidth, halfheight - radius);
    ctx.lineTo(-halfwidth, -halfheight + radius);
    ctx.quadraticCurveTo(-halfwidth, -halfheight, -halfwidth + radius, -halfheight);
    ctx.closePath();
    return ctx;
  }

}
