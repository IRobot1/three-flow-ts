import { NgZone } from "@angular/core";

import { ACESFilmicToneMapping, BufferGeometry, Camera, Line, PCFSoftShadowMap, PerspectiveCamera, SRGBColorSpace, Scene, Vector2, Vector3, WebGLRenderer } from "three";

import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import Stats from 'three/examples/jsm/libs/stats.module.js';

import { ThreeInteractive } from "three-flow";

import { UIRouter } from "./ui-routes";

import { EffectComposer, Pass } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { PointerInteraction } from "three-fluix";

export interface renderState { scene: Scene, camera: Camera, renderer: WebGLRenderer }

export class ThreeJSApp extends WebGLRenderer {
  public camera!: Camera;
  readonly interactive: ThreeInteractive
  readonly pointer: PointerInteraction
  public router = new UIRouter()

  private _scene: Scene | undefined
  get scene() { return this._scene }
  set scene(newvalue: Scene | undefined) {
    if (this._scene != newvalue) {
      this._scene = newvalue
      this.pointer.scene = newvalue
    }
  }

  constructor(camera?: Camera, zone?: NgZone) {
    super({ alpha: true, antialias: true })

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

    this.setPixelRatio(window.devicePixelRatio)
    this.toneMapping = ACESFilmicToneMapping
    this.outputColorSpace = SRGBColorSpace

    this.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.domElement);

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

    this.interactive = new ThreeInteractive(this, this.camera)
    this.pointer = new PointerInteraction(this, this.camera)

    const animate = () => {
      if (!this.scene) return

      if (this.stats) this.stats.update()

      this.render(this.scene, this.camera);

      if (this.composer) this.composer.render()

    };

    if (zone) {
      zone.runOutsideAngular(() => {
        this.setAnimationLoop(animate);
      })
    }
    else
      this.setAnimationLoop(animate);
  }

  vrbutton?: HTMLElement

  // short-cut
  navigateto(route: string) {
    this.interactive.selectable.clear()
    this.interactive.draggable.clear()
    this.router.navigateto(route)
  }

  disableVR() {
    this.xr.enabled = false
    if (this.vrbutton) {
      document.body.removeChild(this.vrbutton);
      this.vrbutton = undefined
    }
  }

  enableVR(hidebutton = false) {
    const scene = this.scene!

    const geometry = new BufferGeometry();
    geometry.setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, - 5)]);

    const controller1 = this.xr.getController(0);
    controller1.name = 'left'
    controller1.add(new Line(geometry));
    scene.add(controller1);

    const controller2 = this.xr.getController(1);
    controller2.name = 'right'
    controller2.add(new Line(geometry));
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    const controllerGrip1 = this.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    const controllerGrip2 = this.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    this.xr.enabled = true
    this.vrbutton = VRButton.createButton(this)
    document.body.appendChild(this.vrbutton);
    if (hidebutton) this.vrbutton.style.visibility = 'hidden'
  }

  enterVR() {
    if (this.vrbutton) {
      const event = new Event('click')
      this.vrbutton.dispatchEvent(event)
      this.vrbutton.style.visibility = 'visible'
    }
  }

  stats?: Stats

  enableStats() {
    const stats = new Stats();
    document.body.appendChild(stats.dom);
    stats.showPanel(0);
    this.stats = stats
  }

  disableStats() {
    if (this.stats) {
      document.body.removeChild(this.stats.dom)
      this.stats = undefined
    }
  }

  composer?: EffectComposer

  enablePostProcessing(scene:Scene) {
    const composer = new EffectComposer(this);

    const renderPass = new RenderPass(scene, this.camera);
    composer.addPass(renderPass);

    this.composer = composer
  }

  addPass(pass: Pass) {
    this.composer?.addPass(pass)
  }

  disablePostProcessing() { this.composer = undefined }
}
