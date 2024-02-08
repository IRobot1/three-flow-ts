import GUI from "three/examples/jsm/libs/lil-gui.module.min"
import { ConnectorMesh, FlowConnectors } from "./connector"
import { FlowDiagram, FlowDiagramOptions } from "./diagram"
import { FlowInteraction } from "./interactive"
import { FlowEventType, FlowNodeParameters } from "./model"
import { FlowNode } from "./node"
import { FlowProperties } from "./properties"
import { FlowPointer } from "./three-interactive"
import { Exporter } from "./exporter"


export interface DesignerStorage { }
export interface FlowDesignerOptions {
  diagram?: FlowDiagramOptions
  title?: string,
  initialFileName?: string,
  mimeType?: string,
  keyboard?: {
    [code: string]: (keyboard: KeyboardEvent, selectedNode: FlowNode | undefined, selectedConnector: ConnectorMesh | undefined) => void
  } // map of keyboard code actions
}

export abstract class FlowDiagramDesigner extends FlowDiagram {
  connectors: FlowConnectors
  properties: FlowProperties
  interaction: FlowInteraction
  keyboard?: KeyboardEvent
  gui!: GUI
  inputElement!: HTMLInputElement

  override dispose() {
    document.body.removeChild(this.inputElement)
    this.gui.destroy()
    this.properties.dispose()
    this.interaction.dispose()
    super.dispose()
  }

  // overridable
  // required
  abstract loadDesign(storage: DesignerStorage) :void
  abstract saveDesign(): DesignerStorage 
  abstract loadAsset(parameters: FlowNodeParameters): FlowNode 

  // optional
  createFlowInteraction(interactive: FlowPointer): FlowInteraction {
    return new FlowInteraction(this, interactive)
  }

  createFlowConnectors(): FlowConnectors {
    return new FlowConnectors(this)
  }

  createFlowProperties(): FlowProperties {
    // TODO: guioptions
    return new FlowProperties(this, this.interaction)
  }

  constructor(interactive: FlowPointer, private designoptions: FlowDesignerOptions) {
    super(designoptions.diagram)

    this.filename = designoptions.initialFileName ? designoptions.initialFileName : 'flow-designer.json'
    this.mimetype = designoptions.mimeType ? designoptions.mimeType : 'application/json'

    this.interaction = this.createFlowInteraction(interactive)
    this.connectors = this.createFlowConnectors()
    const properties = this.properties = this.createFlowProperties()

    this.addEventListener(FlowEventType.KEY_DOWN, (e: any) => {
      const keyboard = e.keyboard as KeyboardEvent
      this.keyboard = keyboard

      let node = properties.selectedNode
      if (!node && properties.selectedConnector) node = properties.selectedConnector.parent as FlowNode

      if (designoptions.keyboard) {
        const callback = designoptions.keyboard[keyboard.code]
        if (callback) callback(keyboard, node, properties.selectedConnector)
      }
    })

    this.addEventListener<any>(FlowEventType.KEY_UP, (e: any) => {
      this.keyboard = e.keyboard as KeyboardEvent
    })


    this.initGUI()
  }

  mimetype: string
  filename: string

  private save() {
    const storage = this.saveDesign()
    const fileSaver = new Exporter()
    fileSaver.saveJSON(storage, this.filename)
  }

  private load() {
    this.inputElement.click()
  }

  private newDiagram() {
    this.clear()
    this.dispatchEvent<any>({ type: FlowEventType.DIAGRAM_NEW })
  }


  private initGUI() {
    const gui = new GUI({ title: this.designoptions.title });
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = '0';
    gui.domElement.style.left = '15px';
    this.gui = gui

    // Create the input element
    var inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.style.display = "none";
    inputElement.accept = this.mimetype;
    inputElement.multiple = false

    // Add event listener for the 'change' event
    inputElement.addEventListener("change", () => {
      if (!inputElement.files || inputElement.files.length == 0) return
      const file = inputElement.files[0]

      const reader = new FileReader();
      reader.readAsText(file);
      reader.onloadend = () => {
        this.clear()

        const storage = <DesignerStorage>JSON.parse(<string>reader.result)
        this.loadDesign(storage)
      };

    });
    this.inputElement = inputElement

    // Append the input element to the body or another DOM element
    document.body.appendChild(inputElement);

    gui.add<any, any>(this, 'newDiagram').name('New')
    gui.add<any, any>(this, 'load').name('Load')
    gui.add<any, any>(this, 'filename').name('File name')
    gui.add<any, any>(this, 'save').name('Save')

    requestAnimationFrame(() => {
      this.dispatchEvent<any>({ type: FlowEventType.DIAGRAM_PROPERTIES, gui: this.gui })
    })
  }

}
