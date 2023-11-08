import { AmbientLight, CircleGeometry, MathUtils, Mesh, MeshBasicMaterial, PointLight, SRGBColorSpace, Scene, TextureLoader, Vector3 } from "three";
import { ThreeJSApp } from "../app/threejs-app";
import { FlowInteractive, InteractiveEventType, FlowObjects } from "three-flow";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";


interface Tile {
  title: string
  position: { x: number, y: number, z: number }
  assetimage: string
  titleblack?: boolean
  route: string
}

interface Gallery {
  tiles: Array<Tile>
}

const gallery: Gallery = {
  tiles: [
    { title: 'Basic', position: { x: 0, y: 0, z: 0 }, assetimage: 'basic', route: 'basic' },
    { title: 'Custom Geometry', position: { x: 3.02, y: 0, z: 0 }, assetimage: 'geometry', route: 'geometry', titleblack: false },
    { title: 'Builder', position: { x: -3.02, y: 0, z: 0 }, assetimage: 'builder', route: 'builder' },
    { title: 'Language Graph', position: { x: 1.51, y: 0.87, z: 0 }, assetimage: 'placeholder', route: 'languages' },
    //  { title: 'Color Entry', position: { x: 1.51 , y: -0.87, z: 0 }, assetimage: 'colorentry', route: 'colorentry' },
    //  { title: 'Expander', position: { x: -1.51 , y: 0.87, z: 0 }, assetimage: 'expander', route: 'expander', titleblack:true },
    //  { title: 'Data Entry', position: { x: -1.51 , y: -0.87, z: 0 }, assetimage: 'dataentry', route: 'dataentry' },
    //  { title: 'List', position: { x: 0 , y: 1.74, z: 0 }, assetimage: 'list', route: 'list' },
    //  { title: 'Panel', position: { x: 0 , y: -1.74, z: 0 }, assetimage: 'panel', route: 'panel' },
    //  { title: 'Radio', position: { x: -3.02 , y: 1.74, z: 0 }, assetimage: 'radio', route: 'radio' },
    //  { title: 'Select', position: { x: 3.02 , y: 1.74, z: 0 }, assetimage: 'select', route: 'select' },
    //  { title: 'Slider', position: { x: -3.02 , y: -1.74, z: 0 }, assetimage: 'slider', route: 'slider' },
    //  { title: 'Drag Panel', position: { x: 3.02 , y: -1.74, z: 0 }, assetimage: 'dragpanel', route: 'dragpanel' },
    //  { title: 'Icon', position: { x: -4.53, y: 0.87, z: 0 }, assetimage: 'icon', route: 'icon' },
    //  { title: 'Layout', position: { x: 4.53, y: 0.87, z: 0 }, assetimage: 'layout', route: 'layout' },
    //  { title: 'Window', position: { x: -4.53, y: -0.87, z: 0 }, assetimage: 'window', route: 'window', titleblack: true },
    //  { title: 'Material Buttons', position: { x: 4.53, y: -0.87, z: 0 }, assetimage: 'materialbuttons', route: 'materialbuttons' },
    //  { title: 'Progress Bar', position: { x: -1.51, y: 2.61, z: 0 }, assetimage: 'progressbar', route: 'progressbar' },
  ]
}
export class GalleryExample {
  dispose = () => { }

  constructor(app: ThreeJSApp) {
    app.camera.position.y = -0.3;
    app.camera.position.z = 5

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

    const ROTATION = 15

    const interactive = new FlowInteractive(app, app.camera)

    const black = new MeshBasicMaterial({ color: 'black' })

    const loader = new TextureLoader()

    const fontloader = new FontLoader();
    fontloader.load("assets/helvetiker_regular.typeface.json", (font) => {
      gallery.tiles.forEach(info => {
        const tile = new Mesh(new CircleGeometry(1, 6))
        const texture = loader.load('/assets/examples/' + info.assetimage + '.png')
        texture.colorSpace = SRGBColorSpace
        tile.material = new MeshBasicMaterial({ color: 'white', map: texture })
        tile.position.set(info.position.x, info.position.y, info.position.z)
        scene.add(tile)

        const geometry = new TextGeometry(info.title, { height: 0, font, size: 0.15 })
        geometry.center()
        const label = new Mesh(geometry)
        label.visible = false
        label.position.y -= 0.5
        label.position.z = 0.1
        if (info.titleblack) label.material = black
        tile.add(label)


        tile.addEventListener(InteractiveEventType.POINTERENTER, () => {
          tile.position.z = 0.1
          label.visible = true
        })
        tile.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
          tile.position.z = 0
          label.visible = false
        })
        tile.addEventListener('click', () => { app.navigateto(info.route) })

        interactive.selectable.add(tile)
      })
    });

    scene.rotation.x = MathUtils.degToRad(-ROTATION)



    this.dispose = () => {
      interactive.dispose()
    }
  }
}

