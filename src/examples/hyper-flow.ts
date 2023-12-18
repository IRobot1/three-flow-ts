import { AmbientLight, AxesHelper, CanvasTexture, Color, DoubleSide, MeshBasicMaterial, MeshBasicMaterialParameters, PointLight, RepeatWrapping, SRGBColorSpace, Scene, Texture } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";
import { FlowConnectors, FlowDiagram, FlowDiagramOptions, FlowNode, FlowNodeParameters } from "three-flow";
import { MathUtils } from "three/src/math/MathUtils";

export class HyperFlowExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.set(4, 3, 4)

    scene.background = new Color(0x444444)

    const ambient = new AmbientLight()
    ambient.intensity = 1
    scene.add(ambient)

    const light = new PointLight(0xffffff, 1, 100)
    light.position.set(-1, 1, 2)
    light.castShadow = true
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 * 2
    scene.add(light)

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.enableRotate = true;
    orbit.update();
    //orbit.addEventListener('change', (e:any) => {
    //  console.warn(app.camera.position)
    //})

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    //scene.add(new AxesHelper(3))

    const flow = new HyperFlowDiagram({ linestyle: 'step' })
    scene.add(flow);
    flow.rotation.x = MathUtils.degToRad(-80)

    const connectors = new FlowConnectors(flow)

    let z = -2
    // bottom
    const bottom1 = flow.addNode({
      x: -1, y: -1, z, connectors: [
        { id: 'b1c1', anchor: 'front' }
      ]
    })
    const bottom2 = flow.addNode({ x: 1, y: -1, z })
    const bottom3 = flow.addNode({ x: 1, y: 1, z })
    const bottom4 = flow.addNode({ x: -1, y: 1, z })

    // middle
    z = 0
    const middle1 = flow.addNode({
      x: -0.6, y: -0.6, z, connectors: [
        { id: 'm1c1', anchor: 'back', transform: { rotate: { y: 180 } } },
      ]
    })
    const middle2 = flow.addNode({ x: 0.6, y: -0.6, z })
    const middle3 = flow.addNode({ x: 0.6, y: 0.6, z })
    const middle4 = flow.addNode({ x: -0.6, y: 0.6, z })

    //// top
    //z = 2
    //// bottom
    //const top1 = flow.addNode({ x: -1, y: -1, z })
    //const top2 = flow.addNode({ x: 1, y: -1, z })
    //const top3 = flow.addNode({ x: 1, y: 1, z })
    //const top4 = flow.addNode({ x: -1, y: 1, z })

    flow.addEdge({ from: bottom1.name, to: middle1.name, fromconnector: 'b1c1', toconnector: 'm1c1' })

    this.dispose = () => {
      orbit.dispose()
    }
  }
}

class HyperFlowNode extends FlowNode {
  constructor(diagram: HyperFlowDiagram, parameters: FlowNodeParameters) {
    super(diagram, parameters)

    const map = diagram.generateTexture('rgb(0, 0, 0, 0)', 3, 10, 'white', 'blue', Math.PI, 5)

    this.material = diagram.getMaterial('geometry', this.name, <MeshBasicMaterialParameters>{
      color: 'white', map, transparent: true, side: DoubleSide
    })


  }

  //  createGeometry(parameters: FlowNodeParameters): BufferGeometry {
  //    return new PlaneGeometry(this.width, this.height)
  //  }
}
class HyperFlowDiagram extends FlowDiagram {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D;

  constructor(options?: FlowDiagramOptions) {
    super(options)

    const canvas = document.createElement('canvas');
    const CANVAS_SIZE = 256
    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE

    this.canvas = canvas
    this.context = canvas.getContext('2d')!

  }

  generateTexture(bgColor: string, numSquares: number, cornerRadius: number, color1: string, color2: string, rotationRange: number, spacing: number): Texture {
    const ctx = this.context

    const CANVAS_SIZE = 256
    const width = CANVAS_SIZE
    const height = CANVAS_SIZE


    // Set the background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const totalSpacing = spacing * (numSquares - 1);
    const squareSize = (width - totalSpacing) / numSquares;

    // Function to draw a rounded rectangle
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    // Draw each square in the grid
    for (let i = 0; i < numSquares; i++) {
      for (let j = 0; j < numSquares; j++) {
        const x = i * (squareSize + spacing);
        const y = j * (squareSize + spacing);

        // Create a gradient at a random rotation
        const angle = Math.random() * rotationRange;
        const gradient = ctx.createLinearGradient(
          x + squareSize / 2 + Math.cos(angle) * squareSize / 2,
          y + squareSize / 2 + Math.sin(angle) * squareSize / 2,
          x + squareSize / 2 - Math.cos(angle) * squareSize / 2,
          y + squareSize / 2 - Math.sin(angle) * squareSize / 2
        );

        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);

        // Draw the square with rounded corners
        drawRoundedRect(x, y, squareSize, squareSize, cornerRadius);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    const texture = new CanvasTexture(this.canvas)
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping

    return texture
  }

  // Usage example:
  // Assuming you have a canvas context 'ctx'
  // drawCanvasTexture(ctx, 256, 256, '#000000', 3, 10, '#ff0000', '#0000ff', Math.PI);


  override dispose() {
    super.dispose()
    document.removeChild(this.canvas)
  }

  override createNode(parameters: FlowNodeParameters): FlowNode {
    return new HyperFlowNode(this, parameters)
  }
}
