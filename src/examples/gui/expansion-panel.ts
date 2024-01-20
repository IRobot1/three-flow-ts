import { ThreeInteractive } from "three-flow";
import { UITextButton } from "./button-text";
import { PanelParameters, TextButtonParameters } from "./model";
import { CircleGeometry, MathUtils, Mesh, MeshBasicMaterialParameters } from "three";
import { PanelEventType, PanelOptions, UIPanel } from "./panel";

export interface ExpansionPanelParameters extends TextButtonParameters {
  expanded?: boolean   // default is false
  panel?: PanelParameters
  spacing?: number     // space between the button and panel
}

export enum ExpansionPanelEventType {
  PANEL_EXPANDED = 'panel_expanded'
}

export class UIExpansionPanel extends UITextButton {
  panel: UIPanel
  expanded = false
  spacing: number

  private indicator: Mesh
  constructor(parameters: ExpansionPanelParameters, interactive: ThreeInteractive, options: PanelOptions) {
    parameters.disableScaleOnClick = true
    parameters.label.alignX = 'left'
    parameters.label.padding = 0.05

    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'expansion-panel'

    this.spacing = parameters.spacing != undefined ? parameters.spacing : 0.02

    const radius = this.height * 0.9 / 2
    this.label.maxwidth = this.width - (radius + this.label.padding)
    this.label.position.x = (-this.width) / 2 + radius + this.label.padding

    const mesh = this.createIndicator(radius)
    mesh.material = this.materials.getMaterial('geometry', 'expansion-indicator', <MeshBasicMaterialParameters>{ color: 'black' })
    mesh.position.set((-this.width + radius + this.label.padding) / 2, 0, 0.001)
    this.add(mesh)
    this.indicator = mesh

    let panelparams = parameters.panel
    if (!panelparams) panelparams = {}
    const panel = this.createPanel(panelparams)
    this.add(panel)
    panel.position.y = -(this.height + panel.height) / 2 - this.spacing
    panel.visible = false
    this.panel = panel

    panel.addEventListener(PanelEventType.HEIGHT_CHANGED, () => {
      panel.position.y = -(this.height + panel.height) / 2 - this.spacing
    })

    if (parameters.expanded) {
      // allow callbacks or events to be fired after construction has finised
      requestAnimationFrame(() => {
        this.pressed()
      })
    }
  }

  // provide a custom panel
  setPanel(panel: UIPanel) {
    this.remove(this.panel)
    this.add(panel)
    panel.position.x = (panel.width - this.width) / 2
    panel.position.y = -(this.height + panel.height) / 2 - this.spacing
    this.panel = panel
  }

  override pressed() {
    this.panel.visible = !this.panel.visible
    this.indicator.rotation.z = this.indicatorRotation(this.panel.visible)
    this.panelExpanded(this.expanded = this.panel.visible)
  }

  // overridables
  createPanel(parameters: PanelParameters): UIPanel {
    return new UIPanel(parameters, this.options)
  }

  createIndicator(radius: number): Mesh {
    const geometry = new CircleGeometry(0.04, 3)
    return new Mesh(geometry)
  }


  indicatorRotation(opened: boolean): number {
    if (opened)
      return MathUtils.degToRad(-90)
    return MathUtils.degToRad(90)
  }

  panelExpanded(expanded: boolean) {
    this.dispatchEvent<any>({ type: ExpansionPanelEventType.PANEL_EXPANDED, expanded })
  }
}
