import { AmbientLight, AxesHelper, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../../app/threejs-app";
import { FlowDiagram } from "three-flow";
import { UIPanel } from "./panel";
import { PanelInteraction } from "./panel-interaction";
import { UIButton } from "./button";
import { UIEventType } from "./model";

export class GUIExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 2

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
    orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = false;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    //scene.add(new AxesHelper(3))

    const flow = new FlowDiagram()
    scene.add(flow);

    //const panel = new UIPanel({draggable:true})
    //scene.add(panel)

    //new PanelInteraction(panel, app.interactive)

    const button = new UIButton({
      position: { x: -0.5 },
      width:0.6, height:0.2,
      material: { color: 'gray' },
      label: {
        text: 'Click Me', material: { color: 'black' }
      }
    }, app.interactive)
    scene.add(button)
    //button.clicked = () => { console.warn('clicked from override') }
    button.addEventListener(UIEventType.CLICKED, () => {
      console.warn('clicked from event')
    })

    const icon = new UIButton({
      position: { x: 0.5 },
      width: 0.2, height: 0.2,
      material: { color: 'gray' },
      label: {
        text: 'favorite', material: { color: 'black' }, isicon: true
      }
    }, app.interactive)
    scene.add(icon)


    // const codepointsMap = new Map<string, string>()

    // codepoints.split('\n').forEach(line => {
    //     const parts = line.split(' ')
    //   codepointsMap.set(parts[0], `\\u${parts[1]}`)
    // })
    // console.warn(codepointsMap)
    this.dispose = () => {
      orbit.dispose()
    }
  }
}
