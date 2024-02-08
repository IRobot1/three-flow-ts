import { Material, MaterialParameters, MeshStandardMaterial, Vector3 } from "three";
import { FlowInteraction, FlowPointer, FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowLabel, FlowLabelParameters, FlowNode, FlowNodeParameters, FlowDiagramDesigner } from "three-flow";

import { FlowMaterials } from "three-flow";

export class AssetViewer extends FlowNode {

  constructor(diagram: FlowDiagram, parameters: FlowNodeParameters) {
    parameters.width = 1
    parameters.height = 0.2
    parameters.z = 0.001
    parameters.resizable = parameters.scalable = false

    super(diagram, parameters);
  }

  addAssets(assetparameters: FlowNodeParameters[]) {
    const diagram = this.diagram as AssetViewerDiagram
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

class AssetViewerMaterials extends FlowMaterials {

  override createMeshMaterial(parameters: MaterialParameters): Material {
    return new MeshStandardMaterial(parameters);
  }
}

export class AssetViewerDiagram extends FlowDiagram {
  connectors: FlowConnectors
  interaction: FlowInteraction

  override dispose() {
    this.interaction.dispose()
    super.dispose()
  }

  constructor(interactive: FlowPointer, public designer: FlowDiagramDesigner, options: FlowDiagramOptions = {}) {
    if (!options.materialCache) options.materialCache = new AssetViewerMaterials()

    super(options)

    this.connectors = new FlowConnectors(this)
    this.interaction = new FlowInteraction(this, interactive)
  }

  createAsset(parameters: FlowNodeParameters): FlowNode {
    return new FlowNode(this, parameters) // blank node
  }

  createViewer(parameters: FlowNodeParameters): FlowNode {
    return new AssetViewer(this, parameters)
  }

  override createNode(parameters: FlowNodeParameters): FlowNode {
    if (parameters.type == 'asset')
      return this.createViewer(parameters)
    return this.createAsset(parameters)
  }
}
