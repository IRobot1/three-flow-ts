import { BufferGeometry, Camera, Line, PCFSoftShadowMap, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { UIRouter } from "./ui-routes";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

export interface renderState { scene: Scene, camera: Camera, renderer: WebGLRenderer }

export class ThreeJSApp extends WebGLRenderer {
  public camera!: Camera;

  public router = new UIRouter()

  private _scene: Scene | undefined
  get scene() { return this._scene }
  set scene(newvalue: Scene | undefined) {
    if (this._scene != newvalue) {
      this._scene = newvalue
      if (newvalue) {
        const geometry = new BufferGeometry();
        geometry.setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, - 5)]);

        const controller1 = this.xr.getController(0);
        controller1.name = 'left'
        controller1.add(new Line(geometry));
        newvalue.add(controller1);

        const controller2 = this.xr.getController(1);
        controller2.name = 'right'
        controller2.add(new Line(geometry));
        newvalue.add(controller2);

        const controllerModelFactory = new XRControllerModelFactory();

        const controllerGrip1 = this.xr.getControllerGrip(0);
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
        newvalue.add(controllerGrip1);

        const controllerGrip2 = this.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        newvalue.add(controllerGrip2);
      }
    }
  }

  constructor(camera?: Camera) {
    super()

    this.router.addEventListener('load', () => {
      this.camera.position.set(0, 0, 0)
      this.camera.rotation.set(0, 0, 0)
    })

    if (!camera) {
      this.camera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
    }
    else
      this.camera = camera

    this.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.domElement);

    this.xr.enabled = false
    if (this.xr.enabled)
      document.body.appendChild(VRButton.createButton(this));

    this.shadowMap.enabled = true;
    this.shadowMap.type = PCFSoftShadowMap;

    window.addEventListener('resize', () => {
      var width = window.innerWidth;
      var height = window.innerHeight;
      this.setSize(width, height);

      if (this.camera.type == 'PerspectiveCamera') {
        const perspective = this.camera as PerspectiveCamera
        perspective.aspect = width / height;
        perspective.updateProjectionMatrix();
      }
    });

    const animate = () => {
      if (!this.scene) return

      this.render(this.scene, this.camera);

    };
    this.setAnimationLoop(animate);
  }

  // short-cut
  navigateto(route: string) {
    this.router.navigateto(route)
  }


}
