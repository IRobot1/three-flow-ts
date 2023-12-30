import { AmbientLight, BoxGeometry, BufferGeometry, DoubleSide, ExtrudeGeometry, LineBasicMaterial, LineSegments, MaterialParameters, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, MeshStandardMaterialParameters, PlaneGeometry, PointLight, SRGBColorSpace, Scene, Shape, ShapeGeometry, TextureLoader, Vector2 } from "three";
import { ThreeInteractive, InteractiveEventType, FlowDiagram, FlowLabelParameters, FlowLabel, FlowNodeParameters, FlowEdgeParameters, FlowConnectors, FlowDiagramParameters, FlowNode, FlowDiagramOptions } from "three-flow";

import { ThreeJSApp } from "../app/threejs-app";
import { TroikaFlowLabel } from "../examples/troika-label";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry";

class MyFlowDiagram extends FlowDiagram {
  loader = new TextureLoader()

  constructor(options?: FlowDiagramOptions) {
    super(options)
  }

  override createMeshMaterial(purpose: string, parameters: MaterialParameters) {
    //parameters.side = DoubleSide
    return new MeshStandardMaterial(parameters)
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

    this.castShadow = true

    const texture = diagram.loader.load('/assets/examples/' + tile.assetimage + '.png')
    texture.colorSpace = SRGBColorSpace
    texture.offset.set(0.5, 0.5)
    this.material = diagram.getMaterial('geometry', tile.assetimage, <MeshStandardMaterialParameters>{ color: 'white', map: texture })

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
    return new ExtrudeGeometry(
      this.rectangularShape(this.parameters.width!, this.parameters.height!, 0.1),
      { bevelEnabled: false, depth: 0.03 }
    )
  }

}
interface Tile extends FlowNodeParameters {
  assetimage: string
  route: string
}


export class GalleryExample {
  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene;

    const ambient = new AmbientLight()
    ambient.intensity = 1
    scene.add(ambient)

    const light = new PointLight(0xffffff, 1.5, 100)
    light.position.set(0, 1.6, 0)
    light.castShadow = true
    //light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 * 4
    scene.add(light)

    app.camera.position.y = 1.45
    app.camera.position.z = 0.15

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, 0.5, -0.1)
    //orbit.enableRotate = false;
    orbit.update();

    const room = new LineSegments(
      new BoxLineGeometry(6, 6, 6, 10, 10, 10),
      new LineBasicMaterial({ color: 0x808080 })
    );

    room.geometry.translate(0, 3, 0);
    scene.add(room)

    const floor = new Mesh(new PlaneGeometry(5.5, 5.5), new MeshStandardMaterial({ color: '#666' }))
    scene.add(floor)
    floor.rotation.x = MathUtils.degToRad(-90)
    floor.position.y = 0.1
    floor.receiveShadow = true


    const table = new Mesh(new BoxGeometry(2, 0.1, 1), new MeshStandardMaterial({ color: '#333' }))
    scene.add(table)
    table.position.y = 0.93
    table.receiveShadow = table.castShadow = true

    const row0 = 4
    const row1 = 2.5
    const row2 = 1
    const row3 = -0.5

    const column1 = -4.5
    const column2 = -3
    const column3 = -1.5
    const column3a = 0
    const column4 = 1.5
    const column5 = 3
    const column6 = 4.5
    const column7 = 6
    const column8 = 7.5
    const column9 = 9
    const column10 = 10.5


    const nodes: Tile[] = [
      {
        id: 'documentation',
        label: { text: "Flow Relationships" },
        x: column2, y: row0,
        assetimage: 'documentation', route: 'documentation',
        connectors: [
          { id: "c1documentation", anchor: 'bottom',  },
        ],
      },
      {
        id: 'stress',
        label: { text: "Stress Test" },
        x: column1, y: row1,
        assetimage: 'stress', route: 'stress',
        connectors: [
          { id: "c1stress", anchor: 'right',  },
        ],
      },
      {
        id: "basic",
        assetimage: 'basic', route: 'basic',
        x: column3, y: row1,
        label: { text: "Basic" },
        connectors: [
          { id: "c1basic", anchor: 'left' },
          { id: "c2basic", anchor: 'right' },
          { id: "c3basic", anchor: 'bottom' },
        ],
      },
      {
        id: 'custom',
        x: column4, y: row2,
        assetimage: 'geometry', route: 'geometry',
        label: { text: "Custom Geometry" },
        connectors: [
          { id: "c1custom", anchor: 'top' },
          { id: "c2custom", anchor: 'bottom' }
        ],
      },
      {
        id: 'builder',
        label: { text: "Builder" },
        x: column2, y: row2,
        assetimage: 'builder', route: 'builder',
        connectors: [
          { id: "c1builder", anchor: 'top' },
          { id: "c2builder", anchor: 'bottom' }
        ],
      },
      {
        id: 'loader',
        x: column3, y: row3,
        label: { text: "Loader from JSON" },
        assetimage: 'loader', route: 'loader',
        connectors: [
          { id: "c1loader", anchor: 'top' },
        ],
      },
      {
        id: 'languages',
        label: { text: "Languages" },
        x: column1, y: row3,
        assetimage: 'languages', route: 'languages',
        connectors: [
          { id: "c1languages", anchor: 'top' },
        ],
      },
      {
        id: 'civilization',
        label: { text: "Civiilization Tech Tree" },
        x: column2, y: row3,
        assetimage: 'civilization', route: 'civilization',
        connectors: [
          { id: "c1civilization", anchor: 'top' },
        ],
      },
      {
        id: 'mermaid',
        label: { text: "Mermaid Flowchart" },
        x: column4, y: row3,
        assetimage: 'mermaid', route: 'mermaid',
        connectors: [
          { id: "c1mermaid", anchor: 'top' },
        ],
      },
      {
        id: 'visuals',
        label: { text: "Visuals" },
        x: column7, y: row1,
        assetimage: 'visuals', route: 'visuals',
        connectors: [
          { id: "c1visuals", anchor: 'left' },
          { id: "c2visuals", anchor: 'bottom' },
          { id: "c3visuals", anchor: 'right' },
        ],
      },
      {
        id: 'popout',
        label: { text: "2D Popout" },
        x: column6, y: row2,
        assetimage: 'popout', route: 'popout',
        connectors: [
          { id: "c1popout", anchor: 'top' },
        ],
      },
      {
        id: 'frames',
        label: { text: "Tranparent Frames" },
        x: column7, y: row2,
        assetimage: 'frames', route: 'frames',
        connectors: [
          { id: "c1frames", anchor: 'top' },
          { id: "c2frames", anchor: 'bottom' },
        ],
      },
      {
        id: 'edgestyles',
        label: { text: "Edge Styles" },
        x: column3, y: row2,
        assetimage: 'edgestyles', route: 'edgestyles',
        connectors: [
          { id: "c1edgestyles", anchor: 'top' },
        ],
      },
      {
        id: 'podium',
        label: { text: "Podium Timeline" },
        x: column8, y: row2,
        assetimage: 'podium', route: 'podium',
        connectors: [
          { id: "c1podium", anchor: 'top' },
          { id: "c2podium", anchor: 'bottom' },
        ],
      },
      {
        id: 'banner',
        label: { text: "Banners" },
        x: column6, y: row3,
        assetimage: 'banner', route: 'banner',
        connectors: [
          { id: "c1banner", anchor: 'top' },
        ],
      },
      {
        id: 'livedata',
        label: { text: "Live Data" },
        x: column7, y: row3,
        assetimage: 'livedata', route: 'livedata',
        connectors: [
          { id: "c1livedata", anchor: 'top' },
        ],
      },
      {
        id: 'connectors',
        label: { text: "Connectors" },
        x: column5, y: row2,
        assetimage: 'connectors', route: 'connectors',
        connectors: [
          { id: "c1connectors", anchor: 'top' },
          { id: "c2connectors", anchor: 'bottom' },
        ],
      },
      {
        id: 'tracks',
        label: { text: "Tracks" },
        x: column5, y: row3,
        assetimage: 'tracks', route: 'tracks',
        connectors: [
          { id: "c1tracks", anchor: 'top' },
        ],
      },
      //{
      //  id: 'kpi',
      //  label: { text: "KPI" },
      //  x: column5, y: row2,
      //  assetimage: 'kpi', route: 'kpi',
      //  connectors: [
      //    { id: "c1kpi", anchor: 'top' },
      //  ],
      //},
      {
        id: 'mindmap',
        label: { text: "Mind Map" },
        x: column3a, y: row2,
        assetimage: 'mindmap', route: 'mindmap',
        connectors: [
          { id: "c1mindmap", anchor: 'top' },
          { id: "c2mindmap", anchor: 'bottom' },
        ],
      },
      {
        id: 'hyperflow',
        label: { text: "Hyper Flow" },
        x: column3a, y: row3,
        assetimage: 'hyperflow', route: 'hyperflow',
        connectors: [
          { id: "c1hyperflow", anchor: 'top' },
        ],
      },
      {
        id: 'designer',
        label: { text: "Basic Designer" },
        x: column9, y: row1,
        assetimage: 'designer', route: 'designer',
        connectors: [
          { id: "c1designer", anchor: 'left' },
          { id: "c2designer", anchor: 'bottom' },
        ],
      },
      {
        id: 'alchemist',
        label: { text: "Alchemist Recipes" },
        x: column9, y: row2,
        assetimage: 'alchemist', route: 'alchemist',
        connectors: [
          { id: "c1alchemist", anchor: 'top' },
        ],
      },
      {
        id: 'gui',
        label: { text: "User Interface" },
        x: column9, y: row0,
        assetimage: 'gui', route: 'gui',
      //  connectors: [
      //    { id: "c1gui", anchor: 'top' },
      //  ],
      },
    ];


    const edges: FlowEdgeParameters[] = [
      {
        from: "basic",
        to: "custom",
        fromconnector: "c2basic",
        toconnector: "c1custom",
      },
      {
        from: "custom",
        to: "mermaid",
        fromconnector: "c2custom",
        toconnector: "c1mermaid",
      },
      {
        from: "basic",
        to: "builder",
        fromconnector: "c1basic",
        toconnector: "c1builder"
      },
      {
        from: "builder",
        to: "languages",
        fromconnector: "c2builder",
        toconnector: "c1languages"
      },
      {
        from: "builder",
        to: "civilization",
        fromconnector: "c2builder",
        toconnector: "c1civilization"
      },
      {
        from: "builder",
        to: "loader",
        fromconnector: "c2builder",
        toconnector: "c1loader"
      },
      {
        from: "basic",
        to: "visuals",
        fromconnector: "c2basic",
        toconnector: "c1visuals"
      },
      {
        from: "visuals",
        to: "popout",
        fromconnector: "c2visuals",
        toconnector: "c1popout"
      },
      {
        from: "visuals",
        to: "frames",
        fromconnector: "c2visuals",
        toconnector: "c1frames"
      },
      {
        from: "visuals",
        to: "podium",
        fromconnector: "c2visuals",
        toconnector: "c1podium"
      },
      {
        from: "basic",
        to: "edgestyles",
        fromconnector: "c3basic",
        toconnector: "c1edgestyles"
      },
      {
        from: "basic",
        to: "documentation",
        fromconnector: "c1basic",
        toconnector: "c1documentation"
      },
      {
        from: "popout",
        to: "banner",
        fromconnector: "c2popout",
        toconnector: "c1banner"
      },
      {
        from: "frames",
        to: "livedata",
        fromconnector: "c2frames",
        toconnector: "c1livedata"
      },
      {
        from: "basic",
        to: "connectors",
        fromconnector: "c2basic",
        toconnector: "c1connectors"
      },
      //{
      //  from: "basic",
      //  to: "kpi",
      //  fromconnector: "c2basic",
      //  toconnector: "c1kpi"
      //},
      {
        from: "basic",
        to: "mindmap",
        fromconnector: "c2basic",
        toconnector: "c1mindmap"
      },
      {
        from: "mindmap",
        to: "hyperflow",
        fromconnector: "c2mindmap",
        toconnector: "c1hyperflow"
      },
      {
        from: "visuals",
        to: "designer",
        fromconnector: "c3visuals",
        toconnector: "c1designer"
      },
      {
        from: "designer",
        to: "alchemist",
        fromconnector: "c2designer",
        toconnector: "c1alchemist"
      },
      {
        from: "connectors",
        to: "tracks",
        fromconnector: "c2connectors",
        toconnector: "c1tracks"
      },
      {
        from: "stress",
        to: "basic",
        fromconnector: "c1stress",
        toconnector: "c1basic"
      },
    ];

    const diagram: FlowDiagramParameters = {
      version: 1,
      nodes, edges
    }

    const flow = new MyFlowDiagram({ linestyle: 'step' })
    scene.add(flow);

    flow.rotation.x = MathUtils.degToRad(-90)
    flow.scale.setScalar(0.1)
    flow.position.y = 1
    flow.position.z = 0.1

    // support connectors
    new FlowConnectors(flow)

    // common adjustments
    nodes.forEach(node => {
      if (node.x == undefined) node.x = 0
      node.x -= 1
      node.draggable = false
      node.autogrow = false
      node.label!.material = { color: 'white' }
      node.label!.size = 0.15
      node.label!.hidden = true
      node.labelanchor = 'top'
      node.labeltransform = {
        rotate: { x: 15 }, translate: { y: 0.15 }
      }
      node.connectors?.forEach(c => {
        c.radius = 0.03
        c.material = { color: 'white' }
      })
    })

    //edges.forEach(edge => {
    //})

    flow.loadDiagram(diagram)

    // add click to navigate to example
    flow.allNodes.forEach(node => {
      const tile = node.parameters as Tile
      node.addEventListener(InteractiveEventType.CLICK, () => { app.navigateto(tile.route) })

      app.interactive.selectable.add(node)
    })



    this.dispose = () => {
      flow.dispose()
      orbit.dispose()
    }
  }
}

