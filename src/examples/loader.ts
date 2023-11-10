import { AmbientLight, Box2, Box3, Color, FileLoader, PointLight, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { ThreeJSApp } from "../app/threejs-app";
import {
  AbstractConnector,
  AbstractEdge,
  AbstractNode,
  FlowInteractive,
  FlowGraph,
  FlowGraphOptions,
  AbstractGraph
} from "three-flow";

export class LoaderExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 0.5
    app.camera.position.z = 5

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


    const interactive = new FlowInteractive(app, app.camera)

    const loader = new FontLoader();

    var dropdown = document.createElement('select');
    dropdown.id = 'myDynamicDropdown';
    document.body.appendChild(dropdown);

    // Set styles programmatically
    Object.assign(dropdown.style, {
      position: 'absolute',
      top: 0,
      border: '2px solid #0087F7',
      borderRadius: '5px',
      width: '300px',
      textAlign: 'center',
      lineHeight: '200px',
      fontSize: '20px',
      color: '#0087F7',
      margin: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    });

    // Create and append the placeholder option
    var placeholderOption = document.createElement('option');
    placeholderOption.value = "";
    placeholderOption.textContent = "Select a JSON graph file";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    placeholderOption.hidden = true;
    dropdown.appendChild(placeholderOption);

    // Options for the dropdown
    let list = [
      { textContent: 'Language Graph', value: 'languages.json' },
      { textContent: 'Civilization Tech Tree', value: 'civilization.json' }
    ];

    // Add options to the dropdown
    list.forEach(function (option) {
      var optionElement = document.createElement('option');
      optionElement.value = option.value
      optionElement.textContent = option.textContent;
      dropdown.appendChild(optionElement);
    });

    // Event listener for the dropdown
    let flow: FlowGraph;
    dropdown.addEventListener('change', function () {
      console.log('You selected: ', this.value);

      if (flow) {
        flow.dispose()
        scene.remove(flow)
      }

      // Create a file loader to load the JSON file
      const fileLoader = new FileLoader();
      fileLoader.load(`assets/${this.value}`, (data) => {
        const graph = <AbstractGraph>JSON.parse(<string>data)
        console.warn(graph)
        flow = new FlowGraph(interactive, options)
        flow.load(graph)
        scene.add(flow);


        const box = new Box3().setFromObject(flow)
        const center = box.getCenter(new Vector3())
        app.camera.position.x = center.x
        app.camera.position.y = center.y
        orbit.target.set(app.camera.position.x, app.camera.position.y, 0)
        app.camera.position.z = 10
      });
    });


    const options: FlowGraphOptions = {
      gridsize: 0.3,
    }
    loader.load("assets/helvetiker_regular.typeface.json", (font) => {
      options.fonts = new Map<string, Font>([
        ['default', font],
      ])

    });



    this.dispose = () => {
      dropdown.remove()
      orbit.dispose()
    }

  }
}
