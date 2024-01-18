import { AmbientLight, AxesHelper, Color, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { FlowMaterials } from "three-flow";

import { ThreeJSApp } from "../app/threejs-app";
import { GUI } from "./gui/gui";
import { UIProperties } from "./gui/properties";
import { UIOptions } from "./gui/model";
import { FontCache } from "./gui/cache";
import { KeyboardInteraction } from "./gui/keyboard-interaction";

//
// adapted from https://github.com/georgealways/lil-gui/blob/master/examples/kitchen-sink/kitchen-sink.js
//

class GUIData {
  constructor(public gui: GUI, public x: number, public y: number, public z:number, public expanded = false) { }
}


export class PropertiesExample {

  dispose = () => { }
  guis: Array<GUIData> = []
  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 1.5
    app.camera.position.z = 1

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


    const z = -1.9

    const col1 = -2.6
    this.makeNumbers(col1, 3, z, true);
    this.makeImplicitStep(col1, 1.7, z, true);
    this.makeExplicitStep(col1, 0.5, z, true);

    const col2 = -0.9
    this.makeMiscNumbers(col2, 3, z, true);
    this.makeOptions(col2, 1.7, z, true);
    //this.makeColors(col2, 0.5, z, true);

    //const col3 = 0.9
    //this.makeColorStrings(col3, 3, z, true);
    //this.makeFolders(col3, 1.9, z, true);
    //this.makeNestedFolders(col3, 0.5, z, true);

    //const col4 = 2.6
    //this.makeDisable(col4, 3, z, true);
    //this.makeListen(col4, 1.6, z, true);
    //this.makeOnChange(col4, 0.5, z, true);

    const options: UIOptions = {
      materials: new FlowMaterials(),
      fontCache: new FontCache(),
      keyboard: new KeyboardInteraction(app)
    }

    //requestAnimationFrame(() => {

      this.guis.forEach(data => {
        const ui = new UIProperties({}, app.interactive, options, data.gui)
        scene.add(ui)
        ui.position.set(data.x, data.y, data.z)
      })
   // })

    this.dispose = () => {
      orbit.dispose()
    }
  }

  make(options: any, callback = (gui: GUI): any => { }): GUI {
    const gui = new GUI(options);
    return callback(gui) || gui;
  }

  getDepth(g: any) {
    let depth = 0;
    while (g !== g.root) {
      g = g.parent;
      depth++;
    }
    return depth;
  }
  addFiller(g: any) {
    const nested = this.getDepth(g) > 0 ? 'Nested ' : '';
    g.add({ x: 0.5 }, 'x', 0, 1).name(`${nested}Slider`);
    g.add({ x: true }, 'x').name(`${nested}Boolean`);
    g.add({ x: function () { } }, 'x').name(`${nested}Button`);
  }

  makeNumbers( x: number, y: number, z: number,  expanded: boolean) {
    const gui = this.make({ title: 'Numbers', width: 300 }, gui => {

      gui.add({ x: 0 }, 'x').name('No Parameters');
      gui.add({ x: 0 }, 'x', 0).name('Min');
      gui.add({ x: 0 }, 'x').max(0).name('Max');

      const guiStep = gui.addFolder('Step');

      guiStep.add({ x: 0 }, 'x').step(0.01).name('0.01');
      guiStep.add({ x: 0 }, 'x').step(0.1).name('0.1');
      guiStep.add({ x: 0 }, 'x').step(1).name('1');
      guiStep.add({ x: 0 }, 'x').step(10).name('10');

    });

    this.guis.push(new GUIData(gui, x,y,z, expanded));
  }

  makeImplicitStep(x: number, y: number, z: number, expanded = false) {
    const gui = this.make({ title: 'Implicit step', width: 300 }, gui => {

      const implicitStep = (min: number, max: number) => {
        gui.add({ x: max }, 'x', min, max).name(`[${min},${max}]`);
      };

      implicitStep(0, 1);
      implicitStep(0, 100);
      implicitStep(-1, 1);
      implicitStep(0, 3);
      implicitStep(0, 5);
      implicitStep(0, 7);
      implicitStep(0, 15);
      implicitStep(0, 1e32);

    });
    this.guis.push(new GUIData(gui, x,y,z, expanded));
  }

  makeExplicitStep(x: number, y: number, z: number, expanded = false) {
    const gui = this.make({ title: 'Explicit step', width: 300 }, gui => {

      const explicitStep = (min: number, max: number, step: number, label: string = step.toString()) => {
        gui.add({ x: max }, 'x', min, max, step).name(`[${min},${max}] step ${label}`);
      };

      explicitStep(0, 100, 1);
      explicitStep(0, 1, 0.1);
      explicitStep(-1, 1, 0.25);
      explicitStep(1, 16, .01);
      explicitStep(0, 15, .015);
      explicitStep(0, 5, 1 / 3, '1/3');

    });
    this.guis.push(new GUIData(gui, x, y, z, expanded));
  }

  makeMiscNumbers(x: number, y: number, z: number, expanded = false) {
    const gui = this.make({ title: 'Numbers Misc.', width: 300 }, gui => {

      let folder = gui.addFolder('Out of bounds');

      folder.add({ x: 2 }, 'x', 0, 1).name('[0,1] Too high');
      folder.add({ x: -2 }, 'x', 0, 1).name('[0,1] Too low');

      folder = gui.addFolder('Decimals');

      const decimalsObj = { x: 0 };

      const addDecimalCtrl = (v: any, argName = v) => {
        folder
          .add(decimalsObj, 'x', 0, 10)
          .name(`decimals( ${argName} )`)
          .decimals(v)
          .listen();
      };

      addDecimalCtrl(0);
      addDecimalCtrl(1);
      addDecimalCtrl(2);
      addDecimalCtrl(undefined, 'undef');

    });

    this.guis.push(new GUIData(gui, x, y, z, expanded));
  }

  makeOptions(x: number, y: number, z: number, expanded = false) {
    const gui = this.make({ title: 'Options', width: 300 }, gui => {

      gui.add({ x: 0 }, 'x', [0, 1, 2]).name('Array');
      gui.add({ x: 0 }, 'x', { Label1: 0, Label2: 1, Label3: 2 }).name('Object');
      gui.add({ x: {} }, 'x', [0, 1, 2]).name('Invalid initial');
      gui.add({ x: {} }, 'x', { Label1: 0, Label2: 1, Label3: 2 }).name('Invalid initial');

      const longString = 'Anoptionorvaluewithaproblematicallylongname';
      gui.add({ x: longString }, 'x', [longString, 1, 2]).name('Long names');

    });

    this.guis.push(new GUIData(gui, x, y, z, expanded));
  }

  makeColors(x: number, y: number, z: number, expanded = false) {
    const gui = this.make({ title: 'Colors', width: 300 }, gui => {

      const colorString = (str: string) => gui.addColor({ x: str }, 'x').name(`"${str}"`);

      colorString('#aa00Ff');
      colorString('aa00Ff');
      colorString('0xaa00Ff');
      colorString('#a0f');
      colorString('a0f');
      colorString('rgb(170, 0, 255)');

    });

    this.guis.push(new GUIData(gui, x, y, z, expanded));
  }

  makeColorStrings(x: number, y: number, z: number, expanded = false) {
    const gui = this.make({ title: 'Color Strings', width: 300 }, gui => {

      gui.addColor({ x: 0xaa00ff }, 'x').name('Hex Integer');
      gui.addColor({ x: { r: 2 / 3, g: 0, b: 1 } }, 'x').name('{r,g,b} 0-1');
      gui.addColor({ x: [2 / 3, 0, 1] }, 'x').name('[r,g,b] 0-1');

      const guiRGBScale = gui.addFolder('RGB Scale');

      guiRGBScale.addColor({ x: [170, 0, 255] }, 'x', 255).name('{r,g,b} 0-255');
      guiRGBScale.addColor({ x: { r: 170, g: 0, b: 255 } }, 'x', 255).name('[r,g,b] 0-255');

    });

    this.guis.push(new GUIData(gui, x, y, z, expanded));
  }

  makeFolders(x: number, y: number, z: number, expanded = false) {
    const gui = this.make({ title: 'Folders', width: 300 }, gui => {

      const folder1 = gui.addFolder('Folder');
      this.addFiller(folder1);

      this.addFiller(gui);

      gui.addFolder('Empty Folder');

      const folder2 = gui.addFolder('Closed Folder').close();

      this.addFiller(folder2);

    });

    this.guis.push(new GUIData(gui, x, y, z, expanded));
  }

  makeNestedFolders(x: number, y: number, z: number, expanded = false) {
    const gui = this.make({ title: 'Nested Folders', width: 300 }, gui => {

      const folder3 = gui.addFolder('Folder');

      this.addFiller(folder3);

      const folder4 = folder3.addFolder('Nested Folder');

      this.addFiller(folder4);

      folder4.addFolder('Empty Nested Folder');

      this.addFiller(folder4);

    });

    this.guis.push(new GUIData(gui, x, y, z, expanded));
  }

  makeDisable(x: number, y: number, z: number, expanded = false) {
    const gui = this.make({ title: 'Disable', width: 300 }, gui => {

      gui.add({ Number: 0 }, 'Number').disable().enable();
      gui.add({ Number: 0 }, 'Number').disable();

      gui.add({ Slider: 0 }, 'Slider', 0, 1).disable().enable();
      gui.add({ Slider: 0 }, 'Slider', 0, 1).disable();

      gui.add({ String: 'foo' }, 'String').disable().enable();
      gui.add({ String: 'foo' }, 'String').disable();

      gui.add({ Boolean: true }, 'Boolean').disable().enable();
      gui.add({ Boolean: true }, 'Boolean').disable();

      gui.add({ Options: 'a' }, 'Options', ['a', 'b', 'c']).disable().enable();
      gui.add({ Options: 'a' }, 'Options', ['a', 'b', 'c']).disable();

      gui.add({ func() { console.log('hi'); } }, 'func').name('Function').disable().enable();
      gui.add({ func() { console.log('hi'); } }, 'func').name('Function').disable();

      gui.addColor({ Color: 0xaa00ff }, 'Color').disable().enable();
      gui.addColor({ Color: 0xaa00ff }, 'Color').disable();

    });

    this.guis.push(new GUIData(gui, x, y, z, expanded));
  }

  makeListen(x: number, y: number, z: number, expanded = false) {
    const gui = this.make({ title: 'Listen', width: 300 }, gui => {

      const params = { animate: false };

      gui.add(params, 'animate');

      function listenTester(name: string, cycle: any, ...addArgs: any) {

        const obj: any = {};
        obj[name] = cycle[cycle.length - 1];
        gui.add(obj, name, ...addArgs).listen();
        let index = 0;

        const loop = () => {

          if (params.animate) obj[name] = cycle[index];
          if (++index > cycle.length - 1) {
            index = 0;
          }

          setTimeout(loop, 1000);

        };

        loop();

      }

      listenTester('Number', [1, 2, 3, 4, 5]);
      listenTester('Slider', [5, 4, 3, 2, 1], 1, 5);

      listenTester('String', ['foo', 'bar', 'baz']);
      listenTester('Boolean', [true, false]);

      listenTester('Options', ['a', 'b', 'c'], ['a', 'b', 'c']);

      gui.add = gui.addColor; // hehe
      listenTester('Color', [0xaa00ff, 0x00aaff, 0xffaa00]);

    });

    this.guis.push(new GUIData(gui, x, y, z, expanded));
  }

  makeOnChange(x: number, y: number, z: number, expanded = false) {
    const gui = this.make({ title: 'onChange', width: 300 }, gui => {

      const tallies = { onChange: 0, onFinishChange: 0 };

      const change = (e: any) => {
        console.log(e.property + ' onChange');
        tallies.onChange++;
      }

      const finishChange = (e: any) => {
        console.log(e.property + ' onFinishChange');
        tallies.onFinishChange++;
      }

      let folder;

      folder = gui.addFolder('Tallies');
      folder.add(tallies, 'onChange').disable().listen();
      folder.add(tallies, 'onFinishChange').disable().listen();

      gui.add({ Number: 0 }, 'Number').onChange(change).onFinishChange(finishChange);

      gui.add({ Slider: 0 }, 'Slider', 0, 1).onChange(change).onFinishChange(finishChange);

      gui.add({ String: 'foo' }, 'String').onChange(change).onFinishChange(finishChange);

      gui.add({ Boolean: true }, 'Boolean').onChange(change).onFinishChange(finishChange);

      gui.add({ Options: 'a' }, 'Options', ['a', 'b', 'c']).onChange(change).onFinishChange(finishChange);

      gui.add({ func() { console.log('hi'); } }, 'func').onChange(change).onFinishChange(finishChange);

      gui.addColor({ Color: 0xaa00ff }, 'Color').onChange(change).onFinishChange(finishChange);

      gui.onFinishChange(e => {
        console.log('gui.onFinishChange', e);
      });

    });

    this.guis.push(new GUIData(gui, x, y, z, expanded));
  }



}
