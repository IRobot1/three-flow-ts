import { CanvasTexture, Material, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, SRGBColorSpace } from "three";

export interface FlowBackgroundParameters {
  width?: number      // default is 4
  height?: number     // default is 3
  fillcolor?: string // default is black
  linecolor?: string // default is white
}

export class FlowBackground extends Mesh {
  canvas: HTMLCanvasElement
  constructor(private parameters: FlowBackgroundParameters) {
    const width = parameters.width != undefined ? parameters.width : 4
    const height = parameters.height != undefined ? parameters.height : 3

    super(new PlaneGeometry(width, height))

    const canvas = document.createElement('canvas');
    const CANVAS_SIZE = 512
    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE

    this.canvas = canvas
    const context = canvas.getContext('2d', { alpha: true })!

    this.draw(context)

    const texture = new CanvasTexture(this.canvas)
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(width, height);

    const material = this.material as MeshBasicMaterial
    material.map = texture
    material.transparent = true
  }

  // overridable
  draw(ctx: CanvasRenderingContext2D) {
    const linecolor = this.parameters.linecolor ? this.parameters.linecolor : 'rgb(255, 255, 255, 64)'
    const fillcolor = this.parameters.fillcolor ? this.parameters.fillcolor : 'rgb(0, 0, 0, 0)'

    const canvas = this.canvas

    ctx.fillStyle = fillcolor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Size of the grid
    const gridSize = 10;

    // Width and height of each cell
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;

    // Set line color
    ctx.strokeStyle = linecolor;
    // Function to set line width
    const setLineWidth = (index: number) => {
      if (index === 0 || index === gridSize) {
        ctx.lineWidth = 4; // Thicker line for boundaries
      } else {
        ctx.lineWidth = 1; // Thinner line for inner grid lines
      }
    };

    // Draw horizontal lines
    for (let i = 0; i <= gridSize; i++) {
      setLineWidth(i);
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(canvas.width, i * cellHeight);
      ctx.stroke();
    }

    // Draw vertical lines
    for (let j = 0; j <= gridSize; j++) {
      setLineWidth(j);
      ctx.beginPath();
      ctx.moveTo(j * cellWidth, 0);
      ctx.lineTo(j * cellWidth, canvas.height);
      ctx.stroke();
    }
  }


  dispose() {
    document.removeChild(this.canvas)
  }

}
