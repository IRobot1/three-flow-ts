import { AmbientLight, AxesHelper, Box2, Box3, Color, PointLight, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../../app/threejs-app";
import { FlowDiagram } from "three-flow";
import { UIEventType, UIOptions } from "./model";
import { UIKeyboard, UIKeyboardEvent } from "./keyboard";
import { MaterialCache } from "./cache";
import { UIButton } from "./button";
import { InputManagerOptions, UIInputManager } from "./input-manager";
import { UITextEntry } from "./text-entry";
import { UINumberEntry } from "./number-entry";
import { UICheckBox } from "./checkbox";
import { UIColorEntry } from "./color-entry";
import { UISliderbar } from "./sliderbar";
import { UITextButton } from "./button-text";

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
    //orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = false;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    scene.add(new AxesHelper(3))

    const flow = new FlowDiagram()
    scene.add(flow);

    //const panel = new UIPanel({draggable:true})
    //scene.add(panel)

    //new PanelInteraction(panel, app.interactive)

    const button = new UITextButton({
      position: { y: 0.75 },
      width: 1, height: 0.4,
      border: { material: { color: 'red' }, width: 0.04 },
      highlight: {
        width:0.04 
      },
      label: {
        text: 'Click Me', //material: { color: 'black' }
      }
    }, app.interactive)
    scene.add(button)
    ////button.clicked = () => { console.warn('clicked from override') }
    button.addEventListener(UIEventType.BUTTON_PRESSED, () => {
      console.warn('clicked from event')
    })

    //const icon = new UIButton({
    //  position: { x: 0.5 },
    //  width: 0.2, height: 0.2,
    //  material: { color: 'gray' },
    //  label: {
    //    text: 'favorite', material: { color: 'black' }, isicon: true
    //  }
    //}, app.interactive)
    //scene.add(icon)

    //const textbutton = new UIButton({
    //  position: { x: -0.5 },
    //  width: 0.6, height: 0.2,
    //  material: { color: 'gray' },
    //  label: {
    //    text: 'Click Me', material: { color: 'black' }
    //  }
    //}, app.interactive)
    //scene.add(textbutton)
    //let count =1
    //setInterval(() => {
    //  textbutton.text = count.toString()

    //  count++
    //},1000)

    const options: InputManagerOptions = {
      materialCache: new MaterialCache(),
      //selectedOffset: {axes:'y', offset:0},
      //selectedMaterial: { color: 'red' }
    }

    const input = new UIInputManager(app, options)

    const text1 = new UITextEntry({ height: 0.3, label: { text: 'test', material: { color: 'black' } } }, app.interactive, options)
    scene.add(text1)
    text1.password = true
    text1.position.y = 0.35

    const text2 = new UINumberEntry({ initialvalue: 0, height: 0.3, label: { material: { color: 'black' } } }, app.interactive, options)
    scene.add(text2)


    const checkbox = new UICheckBox({ checked: false, height: 0.3, width: 0.3 }, app.interactive, options)
    scene.add(checkbox)
    checkbox.position.y = -0.35

    const colorentry = new UIColorEntry({ height: 0.3, fill: { color: 'blue' } }, app.interactive, options)
    scene.add(colorentry)
    colorentry.position.y = -0.7


    const sliderbar = new UISliderbar({ height: 0.3 }, app.interactive, options)
    scene.add(sliderbar)
    sliderbar.position.y = -1.05

    input.add(button, text1, text2, checkbox, colorentry, sliderbar)

    //console.warn(options.materialCache)
    //const keyboard = new UIKeyboard({}, app.interactive)
    //scene.add(keyboard)
    //keyboard.visible = true

    //keyboard.newtext = (text: string) => {
    //  console.warn(text)
    //}
    //keyboard.command = (keycode: string) => {
    //  console.warn(keycode)
    //}
    //keyboard.keydown = (event: UIKeyboardEvent) => {
    //  console.warn(event)
    //}
    //keyboard.keyup= (event: UIKeyboardEvent) => {
    //  console.warn(event)
    //}

    //const codepointsMap = new Map<string, string>()

    //codepoints.split('\n').forEach(line => {
    //  const parts = line.split(' ')
    //  codepointsMap.set(parts[0], `\\u${parts[1]}`)
    //})
    //console.warn(codepointsMap)

    this.dispose = () => {
      orbit.dispose()
    }
  }
}



const codepoints = ``
