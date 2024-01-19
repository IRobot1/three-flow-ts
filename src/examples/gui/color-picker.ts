import { BufferGeometry, CanvasTexture, MathUtils, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, RingGeometry, SRGBColorSpace, Vector2 } from "three";
import { PanelParameters } from "./model";
import { PanelOptions, UIPanel } from "./panel";
import { RoundedRectangleShape } from "three-flow";
import { InteractiveEventType, ThreeInteractive } from "three-flow";

export interface ColorPickerParameters extends PanelParameters {
  initialcolor?: string     // default is white
}

export interface ColorPickerOptions extends PanelOptions { }

export enum ColorPickerEventType {
  COLOR_VALUE_CHANGED = 'color_value_changed',
}

export class UIColorPicker extends UIPanel {
  private _colorvalue: string
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

    this._colorvalue = parameters.initialcolor != undefined ? parameters.initialcolor : 'white'

    const shadesize = this.width * 0.7
    const shadershape = new RoundedRectangleShape(shadesize, this.height * 0.9, this.radius)
    const shadegeometry = this.createGeometry(shadershape)
    const shademesh = new Mesh(shadegeometry)
    shademesh.position.set(-this.width * 0.1, 0, this.depth / 2 + 0.001)

    // outer ring
    const white = this.materials.getMaterial('geometry', 'outer-ring', <MeshBasicMaterialParameters>{ color: 'white' })
    const outergeometry = this.createRing(this.width * 0.045, this.height * 0.05)
    const ringmesh = new Mesh(outergeometry, white)
    ringmesh.rotation.y = MathUtils.degToRad(180)


    // inner ring
    const black = this.materials.getMaterial('geometry', 'inner-ring', <MeshBasicMaterialParameters>{ color: 'black' })
    const innergeometry = this.createRing(this.width * 0.03, this.height * 0.045)
    const innerringmesh = new Mesh(innergeometry, black)
    ringmesh.add(innerringmesh)
    innerringmesh.rotation.y = MathUtils.degToRad(180)
    innerringmesh.position.z = - 0.001

    this.addShadeRingMesh(shademesh, ringmesh)


    const rangeshape = new RoundedRectangleShape(this.width * 0.15, this.height * 0.9, this.radius)
    const rangegeometry = this.createGeometry(rangeshape)
    const rangemesh = new Mesh(rangegeometry)
    rangemesh.position.set(this.width * 0.375, 0, this.depth / 2 + 0.001)

    this.addRangeMesh(rangemesh)

    this.interactives = [this, shademesh, ringmesh, innerringmesh, rangemesh]
    

  }

  dispose() {
    this.interaction.selectable.remove(...this.interactives)
  }

  private shadecontext!: CanvasRenderingContext2D;
  private _shademesh!: Mesh

  addShadeRingMesh(shademesh: Mesh, ringmesh: Mesh) {
    let color: string = ''

    this.addEventListener<any>(ColorPickerEventType.COLOR_VALUE_CHANGED, (e) => {
      if (e.color == color) return

      const material = this.initcolorshades(e.color)
      if (material) shademesh.material = material
    })

    this.add(shademesh);

    shademesh.add(ringmesh)


    let halfwidth = 0
    let halfheight = 0
    shademesh.geometry.computeBoundingBox()
    const box = shademesh.geometry.boundingBox
    if (box) {
      halfwidth = (box.max.x - box.min.x) / 2
      halfheight = (box.max.y - box.min.y) / 2
    }
    ringmesh.position.set(halfwidth, halfheight, 0.001)

    shademesh.addEventListener(InteractiveEventType.CLICK, (e: any) => {
      const uv = e.data[0].uv as Vector2
      const x = uv.x * 100
      const y = (1 - uv.y) * 100

      const imageData = this.shadecontext.getImageData(x, y, 1, 1).data;
      color = this.getStyleColor(imageData[0], imageData[1], imageData[2]);
      this.colorvalue = color

      ringmesh.position.x = MathUtils.mapLinear(uv.x, 0, 1, -halfwidth, halfwidth);
      ringmesh.position.y = MathUtils.mapLinear(1 - uv.y, 0, 1, halfheight, -halfheight);

      e.stop = true
    });

    this._shademesh = shademesh
  }

  private initcolorshades(color: string): MeshBasicMaterial | undefined {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    const options: CanvasRenderingContext2DSettings = { willReadFrequently: true }
    const context = canvas.getContext('2d', options);
    if (!context) return;

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

  addRangeMesh(rangemesh: Mesh) {
    this.add(rangemesh);
    const material = this.initcolorrange()
    if (material) rangemesh.material = material

    rangemesh.addEventListener('click', (e: any) => {
      const uv = e.data[0].uv as Vector2

      const x = uv.x * 10;
      const y = (1 - uv.y) * 100;

      const imageData = this.rangecontext.getImageData(x, y, 1, 1).data;

      const material = this.initcolorshades(this.getStyleColor(imageData[0], imageData[1], imageData[2]));
      if (material) this._shademesh.material = material

      e.stop = true
    });

  }

  private initcolorrange(): MeshBasicMaterial | undefined {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 100;

    const options: CanvasRenderingContext2DSettings = { willReadFrequently: true }
    const context = canvas.getContext('2d', options);
    if (!context) return;


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
