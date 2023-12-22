import { ConnectorMesh, FlowConnectors } from "./connector"
import { FlowDiagram, FlowDiagramOptions } from "./diagram"
import { FlowInteraction } from "./interactive"
import { FlowEventType } from "./model"
import { FlowNode } from "./node"
import { FlowProperties } from "./properties"
import { ThreeInteractive } from "./three-interactive"


export interface DesignerStorage { }

export interface FlowDesignerOptions {
  diagram?: FlowDiagramOptions
  keyboard?: {
    [code: string]: (keyboard: KeyboardEvent, selectedNode: FlowNode | undefined, selectedConnector: ConnectorMesh | undefined) => void
  } // map of keyboard code actions
}

export class FlowDiagramDesigner extends FlowDiagram {
  connectors: FlowConnectors
  properties: FlowProperties
  interaction: FlowInteraction
  keyboard?: KeyboardEvent

  override dispose() {
    this.properties.dispose()
    this.interaction.dispose()
    super.dispose()
  }

  // overridable
  // required
  init() { }
  loadDesign(storage: DesignerStorage) { }
  saveDesign(): DesignerStorage { return {} }

  // optional
  createFlowInteraction(interactive: ThreeInteractive): FlowInteraction {
    return new FlowInteraction(this, interactive)
  }

  createFlowConnectors(): FlowConnectors {
    return new FlowConnectors(this)
  }

  createFlowProperties(): FlowProperties {
    // TODO: guioptions
    return new FlowProperties(this, this.interaction)
  }

  constructor(interactive: ThreeInteractive, options: FlowDesignerOptions) {
    super(options.diagram)

    this.interaction = this.createFlowInteraction(interactive)
    this.connectors = this.createFlowConnectors()
    const properties = this.properties = this.createFlowProperties()

    this.addEventListener(FlowEventType.KEY_DOWN, (e: any) => {
      const keyboard = e.keyboard as KeyboardEvent
      this.keyboard = keyboard

      let node = properties.selectedNode
      if (!node && properties.selectedConnector) node = properties.selectedConnector.parent as FlowNode

      if (options.keyboard) {
        const callback = options.keyboard[keyboard.code]
        if (callback) callback(keyboard, node, properties.selectedConnector)
      }
    })
    this.addEventListener<any>(FlowEventType.KEY_UP, (e: any) => {
      this.keyboard = e.keyboard as KeyboardEvent
    })


    requestAnimationFrame(() => {
      this.init()
    })

  }


}
