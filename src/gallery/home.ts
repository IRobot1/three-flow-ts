import { AmbientLight, CircleGeometry, MathUtils, Mesh, MeshBasicMaterial, PointLight, SRGBColorSpace, Scene, TextureLoader, Vector3 } from "three";
import { ThreeJSApp } from "../app/threejs-app";
import { Interactive, InteractiveEventType } from "./interactive";
import { InteractiveObjects } from "./interactive-objects";


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
    { title: 'Diagram', position: { x: 0, y: 0, z: 0 }, assetimage: 'placeholder', route: 'diagram' },
  //  { title: 'Room', position: { x: -3.02, y: 0, z: 0 }, assetimage: 'room', route: 'room', titleblack:true },
  //  { title: 'Buttons', position: { x: 3.02, y: 0, z: 0 }, assetimage: 'buttons', route: 'buttons' },
  //  { title: 'Checkbox', position: { x: 1.51 , y: 0.87, z: 0 }, assetimage: 'checkbox', route: 'checkbox' },
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
  dispose = () => {}

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

    const selectable = new InteractiveObjects()

    const black = new MeshBasicMaterial({ color: 'black' })

    const loader = new TextureLoader()
    gallery.tiles.forEach(info => {
      const tile = new Mesh(new CircleGeometry(1, 6))
      //tile.rotation.z = MathUtils.degToRad(45)
      const texture = loader.load('/assets/examples/' + info.assetimage + '.png')
      texture.colorSpace = SRGBColorSpace
      tile.material = new MeshBasicMaterial({ color: 'white', map: texture })
      tile.position.set(info.position.x, info.position.y, info.position.z)
      scene.add(tile)

      //const label = new Label(info.title)
      //label.anchorX = 'center'
      //label.fontSize = 0.2
      //label.visible = false
      //label.position.y -= 0.5
      //label.position.z = 0.1
      //label.rotation.x = MathUtils.degToRad(ROTATION)
      //if (info.titleblack) label.material = black
      //tile.add(label)

      tile.addEventListener(InteractiveEventType.POINTERENTER, () => {
        tile.position.z = 0.1
        //label.visible = true
      })
      tile.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
        tile.position.z = 0
        //label.visible = false
      })
      tile.addEventListener('click', () => { app.navigateto(info.route) })

      selectable.add(tile)
    })

    scene.rotation.x = MathUtils.degToRad(-ROTATION)

    const interactive = new Interactive(app, app.camera, selectable.list)

    this.dispose = () => {
      interactive.dispose()
    }
  }
}
