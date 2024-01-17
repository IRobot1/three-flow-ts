import { ThreeInteractive } from "three-flow";
import { UITextButton } from "./button-text";
import { PanelParameters, TextButtonParameters } from "./model";
import { CircleGeometry, MathUtils, Mesh, MeshBasicMaterialParameters } from "three";
import { PanelEventType, PanelOptions, UIPanel } from "./panel";

export interface ExpansionPanelParameters extends TextButtonParameters {
  expanded?: boolean   // default is false
  panel: PanelParameters
}

export enum ExpansionPanelEventType {
  PANEL_EXPANDED = 'panel_expanded'
}

export class UIExpansionPanel extends UITextButton {
  panel: UIPanel
  expanded = false

  private indicator: Mesh
  constructor(parameters: ExpansionPanelParameters, interactive: ThreeInteractive, options: PanelOptions) {
    parameters.disableScaleOnClick = true
    parameters.label.alignX = 'left'
    parameters.label.padding = 0.05
    parameters.panel.selectable = false
    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'expansion-panel'

    const radius = this.height * 0.9 / 2
    this.label.maxwidth = this.width - (radius + this.label.padding)

    const mesh = this.createIndicator(radius)
    mesh.material = this.materials.getMaterial('geometry', 'expansion-indicator', <MeshBasicMaterialParameters>{ color: 'black' })
    mesh.position.set((this.width - radius - this.label.padding) / 2, 0, 0.001)
    this.add(mesh)
    this.indicator = mesh

    const panel = new UIPanel(parameters.panel, this.options)
    this.add(panel)
    panel.position.y = -(this.height + panel.height) / 2 - 0.02
    panel.visible = false
    this.panel = panel

    panel.addEventListener(PanelEventType.HEIGHT_CHANGED, () => {
      panel.position.y = -(this.height + panel.height) / 2 - 0.02
    })

    if (parameters.expanded) {
      // allow callbacks or events to be fired after construction has finised
      requestAnimationFrame(() => {
        this.pressed()
      })
    }
  }

  override pressed() {
    this.panel.visible = !this.panel.visible
    this.indicator.rotation.z = this.indicatorRotation(this.panel.visible)
    this.panelExpanded(this.expanded = this.panel.visible)
  }

  // overridables

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
