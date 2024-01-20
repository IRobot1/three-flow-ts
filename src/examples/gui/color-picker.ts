import { BufferGeometry, CanvasTexture, MathUtils, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, PlaneGeometry, RingGeometry, SRGBColorSpace, Shape, Vector2 } from "three";
import { PanelParameters } from "./model";
import { PanelOptions, UIPanel } from "./panel";
import { RoundedRectangleShape } from "three-flow";
import { InteractiveEventType, ThreeInteractive } from "three-flow";

export interface ColorPickerParameters extends PanelParameters {
}

export interface ColorPickerOptions extends PanelOptions { }

export enum ColorPickerEventType {
  COLOR_VALUE_CHANGED = 'color_value_changed',
}

export class UIColorPicker extends UIPanel {
  private _colorvalue: string = 'black'
  get colorvalue(): string { return this._colorvalue }
  set colorvalue(newvalue: string) {
    if (this._colorvalue != newvalue) {
      this._colorvalue = newvalue
      this.dispatchEvent<any>({ type: ColorPickerEventType.COLOR_VALUE_CHANGED, color: newvalue })
    }
  }

  private interactives: Array<Object3D>

  constructor(parameters: ColorPickerParameters, protected interaction: ThreeInteractive, options: ColorPickerOptions) {
    parameters.highlightable = false

    super(parameters, options)

    const shadewidth = this.width * 0.7
    const shadeheight = this.height * 0.9
    const shadegeometry = new PlaneGeometry(shadewidth, shadeheight)
    const shademesh = new Mesh(shadegeometry)
    this.add(shademesh);
    shademesh.position.set(-this.width * 0.1, 0, this.depth / 2 + 0.001)

    const ringscale = Math.min(this.width, this.height)
    // outer ring
    const white = this.materials.getMaterial('geometry', 'outer-ring', <MeshBasicMaterialParameters>{ color: 'black' })
    const outergeometry = this.createRing(ringscale * 0.045, ringscale * 0.05)
    const ringmesh = new Mesh(outergeometry, white)

    // inner ring
    const black = this.materials.getMaterial('geometry', 'inner-ring', <MeshBasicMaterialParameters>{ color: 'white' })
    const innergeometry = this.createRing(ringscale * 0.04, ringscale * 0.045)
    const innerringmesh = new Mesh(innergeometry, black)
    ringmesh.add(innerringmesh)

    shademesh.add(ringmesh)
    ringmesh.position.z = 0.001

    this.addShadeRingMesh(shademesh, shadewidth, shadeheight, ringmesh)

    const rangewidth = this.width * 0.15
    const rangeheight = this.height * 0.9
    const rangegeometry = new PlaneGeometry(rangewidth, rangeheight)

    const rangemesh = new Mesh(rangegeometry)
    this.add(rangemesh);
    rangemesh.position.set(this.width * 0.375, 0, this.depth / 2 + 0.001)

    this.addRangeMesh(shademesh, rangemesh)

    this.interactives = [this, shademesh, ringmesh, innerringmesh, rangemesh]
    interaction.selectable.add(...this.interactives)
  }

  dispose() {
    this.interaction.selectable.remove(...this.interactives)
  }

  private shadecontext!: CanvasRenderingContext2D;

  addShadeRingMesh(shademesh: Mesh, shadewidth: number, shadeheight: number, ringmesh: Mesh) {
    let color: string = ''

    this.addEventListener<any>(ColorPickerEventType.COLOR_VALUE_CHANGED, (e) => {
      if (e.color == color) return

      const material = this.initcolorshades(e.color)
      if (material) shademesh.material = material
    })


    let halfwidth = shadewidth / 2
    let halfheight = shadeheight / 2
    ringmesh.position.set(halfwidth, halfheight, 0.001)

    shademesh.addEventListener(InteractiveEventType.CLICK, (e: any) => {
      if (!this.visible) return

      const uv = e.data as Vector2
      let x = uv.x * 100
      let y = uv.y * 100

      const imageData = this.shadecontext.getImageData(x, y, 1, 1).data;
      color = this.getStyleColor(imageData[0], imageData[1], imageData[2]);
      this.colorvalue = color

      x = MathUtils.mapLinear(uv.x, 0, 1, -halfwidth, halfwidth);
      y = MathUtils.mapLinear(uv.y, 0, 1, halfheight, -halfheight);
      ringmesh.position.set(x, y, ringmesh.position.z)

      e.stop = true
    });

  }

  private initcolorshades(color: string): MeshBasicMaterial {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    const options: CanvasRenderingContext2DSettings = { willReadFrequently: true }
    const context = canvas.getContext('2d', options)!;

    const white = context.createLinearGradient(0, 0, 100, 0);
    white.addColorStop(0, 'rgba(255,255,255,1)');
    white.addColorStop(1, 'rgba(255,255,255,0)');

    const black = context.createLinearGradient(0, 0, 0, 100);
    black.addColorStop(0, 'rgba(0,0,0,0)');
    black.addColorStop(1, 'rgba(0,0,0,1)');

    context.fillStyle = color;
    context.fillRect(0, 0, 100, 100);

    context.fillStyle = white;
    context.fillRect(0, 0, 100, 100);

    context.fillStyle = black;
    context.fillRect(0, 0, 100, 100);

    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace

    this.shadecontext = context;
    return new MeshBasicMaterial({ map: texture });
  }

  private getStyleColor(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  private rangecontext!: CanvasRenderingContext2D;

  addRangeMesh(shademesh: Mesh, rangemesh: Mesh) {
    const material = this.initcolorrange()
    if (material) rangemesh.material = material

    rangemesh.addEventListener(InteractiveEventType.CLICK, (e: any) => {
      if (!this.visible) return

      const uv = e.data as Vector2

      const x = uv.x * 10;
      const y = uv.y * 100;

      const imageData = this.rangecontext.getImageData(x, y, 1, 1).data;

      const material = this.initcolorshades(this.getStyleColor(imageData[0], imageData[1], imageData[2]));
      if (material) shademesh.material = material

      e.stop = true
    });

  }

  private initcolorrange(): MeshBasicMaterial {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 100;

    const options: CanvasRenderingContext2DSettings = { willReadFrequently: true }
    const context = canvas.getContext('2d', options)!


    const gradient = context.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0.05, 'rgba(255, 0, 0, 1)');
    gradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
    gradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
    gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
    gradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
    gradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
    gradient.addColorStop(0.95, 'rgba(255, 0, 0, 1)');


    context.fillStyle = gradient;
    context.fillRect(0, 0, 10, 100);

    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace;

    this.rangecontext = context;
    return new MeshBasicMaterial({ map: texture });
  }


  // overridables

  createRing(innerradius: number, outerradius: number): BufferGeometry {
    return new RingGeometry(innerradius, outerradius)
  }
}
