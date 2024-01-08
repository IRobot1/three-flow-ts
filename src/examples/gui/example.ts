import { AmbientLight, AxesHelper, Box2, Box3, Color, PointLight, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../../app/threejs-app";
import { FlowDiagram } from "three-flow";
import { UIEventType, UIOptions } from "./model";
import { UIKeyboard, UIKeyboardEvent } from "./keyboard";
import { FontCache, MaterialCache } from "./cache";
import { UIButton } from "./button";
import { InputManagerOptions, UIInputManager } from "./input-manager";
import { UITextEntry } from "./text-entry";
import { UINumberEntry } from "./number-entry";
import { UICheckBox } from "./checkbox";
import { UIColorEntry } from "./color-entry";
import { UISliderbar } from "./sliderbar";
import { UITextButton } from "./button-text";
import { UILabel } from "./label";
import { UIList } from "./list";

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

    requestAnimationFrame(() => {

      //const panel = new UIPanel({draggable:true})
      //scene.add(panel)

      //new PanelInteraction(panel, app.interactive)

      const options: InputManagerOptions = {
        fontCache: new FontCache(),
        materialCache: new MaterialCache(),
        //selectedOffset: {axes:'y', offset:0},
        //selectedMaterial: { color: 'red' }
      }


      const button = new UITextButton({
        position: { y: 0.75 },
        width: 1, height: 0.4,
        border: { material: { color: 'red' }, width: 0.04 },
        highlight: {
          width: 0.04
        },
        label: {
          text: 'Click Me', //material: { color: 'black' }
        }
      }, app.interactive, options)
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

      const label1 = new UILabel({ text: 'this is a test', maxwidth: 0.5 }, options)
      scene.add(label1)
      label1.position.x = -1

      const label2 = new UILabel({ text: 'this is a test', maxwidth: 0.5, alignX: 'right' }, options)
      scene.add(label2)
      label2.position.x = -1
      label2.position.y = -0.1


      const input = new UIInputManager(app, options)

      const text1 = new UITextEntry({
        height: 0.3,
        //password: true, prompt: '|', passwordChar: '?',
        label: { text: 'test', material: { color: 'black' } }
      }, app.interactive, options)
      scene.add(text1)
      text1.position.y = 0.35

      const text2 = new UINumberEntry({ initialvalue: 0, height: 0.3, label: { material: { color: 'black' } } }, app.interactive, options)
      scene.add(text2)


      const checkbox = new UICheckBox({ checked: false, height: 0.3, width: 0.3 }, app.interactive, options)
      scene.add(checkbox)
      checkbox.position.y = -0.35

      const colorentry = new UIColorEntry({ height: 0.3, fill: { color: 'blue' } }, app.interactive, options)
      scene.add(colorentry)
      colorentry.position.y = -0.7


      const hsliderbar = new UISliderbar({ height: 0.3 }, app.interactive, options)
      scene.add(hsliderbar)
      hsliderbar.position.y = -1.05

      const vsliderbar = new UISliderbar({ width: 0.3, height:1, slidersize:0.5, orientation:'vertical' }, app.interactive, options)
      scene.add(vsliderbar)
      vsliderbar.position.x = 1
      vsliderbar.position.y = -1


      const list = new UIList({
        data: storydata,
        field: 'text',
        //orientation: 'vertical',
        //itemheight: 0.3,
        //itemcount: 5,
      }, app.interactive, options)
      scene.add(list)
      list.position.x = 1.2
      list.position.y = 0
      list.addEventListener(UIEventType.LIST_SELECTED_CHANGED, () => {
        console.warn(list.selectedtext)
      })

      input.add(button, text1, text2, checkbox, colorentry, hsliderbar, list)

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

    })

    this.dispose = () => {
      orbit.dispose()
    }
  }
}

const storydata: Array<{ text: string }> = [
  { text: 'Criminal Of Nightmares' },
  { text: 'Knight Of The Ancients and Scorcery' },
  { text: 'Pilots Without Duty' },
  { text: 'Horses With Pride' },
  { text: 'Swindlers And Men' },
  { text: 'Aliens And Mice' },
  { text: 'Planet Of The Forsaken' },
  { text: 'Rise With Pride' },
  { text: 'Becoming The Town' },
  { text: 'Battling In The River' },
  { text: 'Warrior Of Greatness' },
  { text: 'Enemy Without Courage' },
  { text: 'Humans Of Earth' },
  { text: 'Giants Of The Sea' },
  { text: 'Girls And Strangers' },
  { text: 'Rebels And Giants' },
  { text: 'Beginning Of The Frontline' },
  { text: 'Family Of Dread' },
  { text: 'Amusing The River' },
]

const stories: Array<string> = [
  'Criminal Of Nightmares',
  'Knight Of The Ancients and Scorcery',
  'Pilots Without Duty',
  'Horses With Pride',
  'Swindlers And Men',
  'Aliens And Mice',
  'Planet Of The Forsaken',
  'Rise With Pride',
  'Becoming The Town',
  'Battling In The River',
  'Warrior Of Greatness',
  'Enemy Without Courage',
  'Humans Of Earth',
  'Giants Of The Sea',
  'Girls And Strangers',
  'Rebels And Giants',
  'Beginning Of The Frontline',
  'Family Of Dread',
  'Amusing The River',
]

