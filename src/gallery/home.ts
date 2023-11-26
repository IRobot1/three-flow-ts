import { AmbientLight, BufferGeometry, MathUtils, MeshBasicMaterial, PointLight, SRGBColorSpace, Scene, Shape, ShapeGeometry, TextureLoader, Vector2 } from "three";
import { ThreeInteractive, InteractiveEventType, FlowDiagram, FlowLabelParameters, FlowLabel, FlowNodeParameters, FlowEdgeParameters, FlowConnectors, FlowDiagramParameters, FlowNode, FlowDiagramOptions } from "three-flow";

import { ThreeJSApp } from "../app/threejs-app";
import { TroikaFlowLabel } from "../examples/troika-label";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class MyFlowDiagram extends FlowDiagram {
  loader = new TextureLoader()

  constructor(options?: FlowDiagramOptions) {
    super(options)
  }

  override createLabel(label: FlowLabelParameters): FlowLabel {
    return new TroikaFlowLabel(this, label)
  }

  override createNode(node: Tile): FlowNode {
    return new MyFlowNode(this, node)
  }
}

class MyFlowNode extends FlowNode {
  constructor(diagram: MyFlowDiagram, tile: Tile) {
    super(diagram, tile)

    const texture = diagram.loader.load('/assets/examples/' + tile.assetimage + '.png')
    texture.colorSpace = SRGBColorSpace
    texture.offset.set(0.5, 0.5)
    this.material = new MeshBasicMaterial({ color: 'white', map: texture })

    const node = this
    node.addEventListener(InteractiveEventType.POINTERENTER, () => {
      node.position.z = 0.02
      node.label.visible = true
    })
    node.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
      node.position.z = 0
      node.label.visible = false
    })

  }

  private rectangularShape(width: number, height: number, radius: number): Shape {
    const halfwidth = width / 2
    const halfheight = height / 2

    const shape = new Shape()
      .moveTo(-halfwidth + radius, -halfheight)
      .lineTo(halfwidth - radius, -halfheight)
      .quadraticCurveTo(halfwidth, -halfheight, halfwidth, -halfheight + radius)
      .lineTo(halfwidth, halfheight - radius)
      .quadraticCurveTo(halfwidth, halfheight, halfwidth - radius, halfheight)
      .lineTo(-halfwidth + radius, halfheight)
      .quadraticCurveTo(-halfwidth, halfheight, -halfwidth, halfheight - radius)
      .lineTo(-halfwidth, -halfheight + radius)
      .quadraticCurveTo(-halfwidth, -halfheight, -halfwidth + radius, -halfheight)

    return shape
  }

  override createGeometry(): BufferGeometry {
    return new ShapeGeometry(this.rectangularShape(this.node.width!, this.node.height!, 0.1))
  }

}
interface Tile extends FlowNodeParameters {
  assetimage: string
  route: string
}


export class GalleryExample {
  dispose = () => { }

  constructor(app: ThreeJSApp) {
    app.camera.position.z = 4

    const scene = new Scene()
    app.scene = scene;

    const ambient = new AmbientLight()
    ambient.intensity = 0.1
    scene.add(ambient)

    const light = new PointLight(0xffffff, 1, 100)
    light.position.set(-1, 1, 2)
    light.castShadow = true
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 * 2
    scene.add(light)

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    //orbit.enableRotate = false;
    orbit.update();

    const ROTATION = 15
    scene.rotation.x = MathUtils.degToRad(-ROTATION)

    const interactive = new ThreeInteractive(app, app.camera)

    const nodes: Tile[] = [
      {
        text: "basic",
        assetimage: 'basic', route: 'basic',
        y: 2.5,
        label: { text: "Basic" },
        connectors: [
          { id: "c1basic", anchor: 'left', color: 'white ' },
          { id: "c2basic", anchor: 'right', color: 'white ' },
          { id: "c3basic", anchor: 'bottom', color: 'white ' },
        ],
      },
      {
        text: 'custom',
        x: 1.5, y: 1,
        assetimage: 'geometry', route: 'geometry',
        label: { text: "Custom Geometry" },
        connectors: [
          { id: "c1custom", anchor: 'top', color: 'white ' },
          { id: "c2custom", anchor: 'bottom', color: 'white ' }
        ],
      },
      {
        text: 'builder',
        label: { text: "Builder" },
        x: -1.5, y: 1,
        assetimage: 'builder', route: 'builder',
        connectors: [
          { id: "c1builder", anchor: 'top', color: 'white ' },
          { id: "c2builder", anchor: 'bottom', color: 'white ' }
        ],
      },
      {
        text: 'loader',
        x: 0, y: -0.5,
        label: { text: "Loader from JSON" },
        assetimage: 'loader', route: 'loader',
        connectors: [
          { id: "c1loader", anchor: 'top', color: 'white ' },
        ],
      },
      {
        text: 'languages',
        label: { text: "Languages" },
        x: -3, y: -0.5,
        assetimage: 'languages', route: 'languages',
        connectors: [
          { id: "c1languages", anchor: 'top', color: 'white ' },
        ],
      },
      {
        text: 'civilization',
        label: { text: "Civiilization Tech Tree" },
        x: -1.5, y: -0.5,
        assetimage: 'civilization', route: 'civilization',
        connectors: [
          { id: "c1civilization", anchor: 'top', color: 'white ' },
        ],
      },
      {
        text: 'mermaid',
        label: { text: "Mermaid Flowchart" },
        x: 1.5, y: -0.5,
        assetimage: 'mermaid', route: 'mermaid',
        connectors: [
          { id: "c1mermaid", anchor: 'top', color: 'white ' },
        ],
      },
      {
        text: 'visuals',
        label: { text: "Visuals" },
        x: 4.5, y: 1,
        assetimage: 'visuals', route: 'visuals',
        connectors: [
          { id: "c1visuals", anchor: 'top', color: 'white ' },
          { id: "c2visuals", anchor: 'bottom', color: 'white ' },
        ],
      },
      {
        text: 'popout',
        label: { text: "2D Popout" },
        x: 3, y: -0.5,
        assetimage: 'popout', route: 'popout',
        connectors: [
          { id: "c1popout", anchor: 'top', color: 'white ' },
        ],
      },
      {
        text: 'frames',
        label: { text: "Tranparent Frames" },
        x: 4.5, y: -0.5,
        assetimage: 'frames', route: 'frames',
        connectors: [
          { id: "c1frames", anchor: 'top', color: 'white ' },
        ],
      },
      {
        text: 'edgestyles',
        label: { text: "Edge Styles" },
        x: 0, y: 1,
        assetimage: 'edgestyles', route: 'edgestyles',
        connectors: [
          { id: "c1edgestyles", anchor: 'top', color: 'white ' },
        ],
      },
    ];


    const edges: FlowEdgeParameters[] = [
      {
        v: "basic",
        w: "custom",
        fromconnector: "c2basic",
        toconnector: "c1custom",
        color: 'white'
      },
      {
        v: "custom",
        w: "mermaid",
        fromconnector: "c2custom",
        toconnector: "c1mermaid",
      },
      {
        v: "basic",
        w: "builder",
        fromconnector: "c1basic",
        toconnector: "c1builder"
      },
      {
        v: "builder",
        w: "languages",
        fromconnector: "c2builder",
        toconnector: "c1languages"
      },
      {
        v: "builder",
        w: "civilization",
        fromconnector: "c2builder",
        toconnector: "c1civilization"
      },
      {
        v: "builder",
        w: "loader",
        fromconnector: "c2builder",
        toconnector: "c1loader"
      },
      {
        v: "basic",
        w: "visuals",
        fromconnector: "c2basic",
        toconnector: "c1visuals"
      },
      {
        v: "visuals",
        w: "popout",
        fromconnector: "c2visuals",
        toconnector: "c1popout"
      },
      {
        v: "visuals",
        w: "frames",
        fromconnector: "c2visuals",
        toconnector: "c1frames"
      },
      {
        v: "basic",
        w: "edgestyles",
        fromconnector: "c3basic",
        toconnector: "c1edgestyles"
      },
    ];

    const diagram: FlowDiagramParameters = {
      version: 1,
      nodes, edges
    }

    const flow = new MyFlowDiagram({ linestyle:'split'})
    scene.add(flow);

    // make the flow interactive
    //new FlowInteraction(flow, app, app.camera)

    // support connectors
    new FlowConnectors(flow)

    // common adjustments
    nodes.forEach(node => {
      if (node.x == undefined) node.x = 0
      node.x -= 1
      node.draggable = false
      node.label!.color = 'white'
      node.label!.size = 0.15
      node.label!.hidden = true
      node.labelanchor = 'top'
      node.labeltransform = {
        rotate: { x: 15 }, translate: { y: 0.15 }
      }
      node.connectors?.forEach(c => {
        c.radius = 0.03
        c.color = 'white'
      })
    })

    //edges.forEach(edge => {
    //})

    flow.load(diagram)

    // add click to navigate to example
    flow.allNodes.forEach(node => {
      const tile = node.node as Tile
      node.addEventListener('click', () => { app.navigateto(tile.route) })

      interactive.selectable.add(node)
    })



    this.dispose = () => {
      flow.dispose()
      orbit.dispose()
      interactive.dispose()
    }
  }
}

