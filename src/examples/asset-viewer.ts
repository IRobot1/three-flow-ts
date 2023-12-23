import { Material, MaterialParameters, MeshStandardMaterial, Vector3 } from "three";
import { FlowInteraction, ThreeInteractive, FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowLabel, FlowLabelParameters, FlowNode, FlowNodeParameters, FlowDiagramDesigner } from "three-flow";
import { TroikaFlowLabel } from "./troika-label";

export class AssetNode extends FlowNode {

  constructor(diagram: FlowDiagram, parameters: FlowNodeParameters) {
    parameters.width = 1
    parameters.height = 0.2
    parameters.z = 0.001
    parameters.resizable = parameters.scalable = false

    super(diagram, parameters);
  }

  addAssets(assetparameters: FlowNodeParameters[]) {
    const diagram = this.diagram as AssetViewer
    const designer = diagram.designer

    const nodes: Array<FlowNode> = []
    const padding = 0.2
    let position = 0

    assetparameters.forEach(parameters => {
      parameters.x = parameters.y = parameters.z = 0
      parameters.draggable = false
      const node = diagram.addNode(parameters)

      // change parent from diagram to this node
      this.add(node)

      const nodeconnectors = diagram.connectors.addConnectors(node, [
        {
          id: '', anchor: 'center', radius: node.width / 2,
          selectable: true, draggable: true, hidden: true, createOnDrop: false
        },
      ])

      nodes.push(node)
      position += node.height
      node.position.y = -position
      position += padding

      const mesh = nodeconnectors.connectors[0]

      mesh.pointerEnter = (): string => { return 'cell' }

      // override drop complete for the asset to create a new node when dragging
      mesh.dropCompleted = (diagram: FlowDiagram, start: Vector3): FlowNode | undefined => {
        const parentNode = mesh.parent as FlowNode

        // clone parameters of the template
        const parameters = JSON.parse(JSON.stringify(parentNode.parameters)) as FlowNodeParameters
        parameters.id = undefined
        parameters.x = start.x
        parameters.y = start.y
        parameters.connectors = undefined
        parameters.selectable = parameters.draggable = true
        return designer.loadAsset(parameters)
      }
    })
  }
}

export class AssetViewer extends FlowDiagram {
  connectors: FlowConnectors
  interaction: FlowInteraction

  override dispose() {
    this.interaction.dispose()
    super.dispose()
  }

  constructor(interactive: ThreeInteractive, public designer: FlowDiagramDesigner, options?: FlowDiagramOptions) {
    super(options)
    this.connectors = new FlowConnectors(this)
    this.interaction = new FlowInteraction(this, interactive)
  }

  createAsset(parameters: FlowNodeParameters): FlowNode {
    return new FlowNode(this, parameters) // blank node
  }

  override createMeshMaterial(purpose: string, parameters: MaterialParameters): Material {
    return new MeshStandardMaterial(parameters);
  }

  override createLabel(parameters: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, parameters)
  }

  override createNode(parameters: FlowNodeParameters): FlowNode {
    if (parameters.type == 'asset')
      return new AssetNode(this, parameters)
    return this.createAsset(parameters)
  }
}
