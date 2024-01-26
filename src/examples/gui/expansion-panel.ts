import { ThreeInteractive } from "three-flow";
import { UITextButton } from "./button-text";
import { PanelParameters, TextButtonParameters } from "./model";
import { Mesh, MeshBasicMaterialParameters } from "three";
import { PanelEventType, PanelOptions, UIPanel } from "./panel";
import { UILabel } from "./label";

export interface ExpansionPanelParameters extends TextButtonParameters {
  expanded?: boolean   // default is false
  panel?: PanelParameters
  spacing?: number     // space between the button and panel
  indicatorMaterial?: MeshBasicMaterialParameters  // default is black
}

export enum ExpansionPanelEventType {
  PANEL_EXPANDED = 'panel_expanded'
}

export class UIExpansionPanel extends UITextButton {
  panel: UIPanel
  expanded = false

  protected _spacing: number
  get spacing() { return this._spacing }
  set spacing(newvalue: number) {
    if (this._spacing != newvalue) {
      this._spacing = newvalue
      this.panel.position.y = -(this.height + this.panel.height) / 2 - this.spacing

    }
  }

  private expandedIndicator!: Mesh
  private collapsedIndicator!: Mesh

  constructor(parameters: ExpansionPanelParameters, interactive: ThreeInteractive, options: PanelOptions) {
    parameters.disableScaleOnClick = true
    parameters.label.alignX = 'left'
    parameters.label.padding = 0.05

    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'expansion-panel'

    this._spacing = parameters.spacing != undefined ? parameters.spacing : 0.02

    const radius = this.height * 0.9 / 2
    this.label.maxwidth = this.width - (radius + this.label.padding)
    this.label.position.x = (-this.width) / 2 + radius + this.label.padding

    const indicatorParams = parameters.indicatorMaterial ? parameters.indicatorMaterial : { color:'black'}
    const indicatorMaterial = this.materials.getMaterial('geometry', 'expansion-indicator', indicatorParams)

    requestAnimationFrame(() => {
      const expandedMesh = this.createExpandedIndicator(radius)
      expandedMesh.material = indicatorMaterial
      expandedMesh.position.set((-this.width + radius + this.label.padding) / 2, 0, 0.001)
      this.add(expandedMesh)
      this.expandedIndicator = expandedMesh

      const collapsedMesh = this.createCollapsedIndicator(radius)
      collapsedMesh.material = indicatorMaterial
      collapsedMesh.position.set((-this.width + radius + this.label.padding) / 2, 0, 0.001)
      this.add(collapsedMesh)
      collapsedMesh.visible = false
      this.collapsedIndicator = collapsedMesh

      if (parameters.expanded) {
        // allow callbacks or events to be fired after construction has finised
        requestAnimationFrame(() => {
          this.pressed()
        })
      }
    })

    let panelparams = parameters.panel
    if (!panelparams) panelparams = {}
    this.panel = this.createPanel(panelparams)
    this.setPanel(this.panel)
    this.panel.visible = false

    this.addEventListener(PanelEventType.WIDTH_CHANGED, () => {
      this.label.maxwidth = this.width - (radius + this.label.padding)
      this.label.position.x = -this.width / 2 + radius + this.label.padding

      this.collapsedIndicator.position.x = this.expandedIndicator.position.x = -this.width / 2 + this.label.padding
    })


  }

  // provide a custom panel
  setPanel(panel: UIPanel) {
    this.remove(this.panel)
    this.add(panel)
    panel.position.x = (panel.width - this.width) / 2
    panel.position.y = -(this.height + panel.height) / 2 - this.spacing
    this.panel = panel

    panel.addEventListener(PanelEventType.HEIGHT_CHANGED, () => {
      panel.position.y = -(this.height + panel.height) / 2 - this.spacing
    })

  }

  override pressed() {
    this.panel.visible = !this.panel.visible

    this.expandedIndicator.visible = this.panel.visible
    this.collapsedIndicator.visible = !this.panel.visible

    this.panelExpanded(this.expanded = this.panel.visible)
  }

  // overridables
  createPanel(parameters: PanelParameters): UIPanel {
    return new UIPanel(parameters, this.options)
  }

  createExpandedIndicator(radius: number): Mesh {
    return new UILabel({ text: 'expand_more', isicon: true }, this.options)
  }

  createCollapsedIndicator(radius: number): Mesh {
    return new UILabel({ text: 'expand_less', isicon: true }, this.options)
  }

  panelExpanded(expanded: boolean) {
    this.dispatchEvent<any>({ type: ExpansionPanelEventType.PANEL_EXPANDED, expanded })
  }
}
