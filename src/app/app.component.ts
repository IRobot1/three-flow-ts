import { Component } from '@angular/core';
import { ThreeJSApp } from './threejs-app';
import { GalleryExample } from '../gallery/home';
import { BasicExample } from '../examples/basic';
import { CustomGeometryExample } from '../examples/custom-geometry';
import { BuilderExample } from '../examples/builder';
import { LanguagesExample } from '../examples/languages';
import { CivilizationExample } from '../examples/civilization';
import { LoaderExample } from '../examples/loader';
import { MermaidExample } from '../examples/mermaid';
import { ProcessExample } from '../examples/process';
import { PopoutExample } from '../examples/popout';
import { FramesExample } from '../examples/frames';


@Component({
  selector: 'app-root',
  template: '',
})
export class AppComponent {
  title = 'test'
  constructor() {

    const app = new ThreeJSApp()

    app.router.add('/', () => { return new GalleryExample(app) })
    app.router.add('basic', () => { return new BasicExample(app) })
    app.router.add('geometry', () => { return new CustomGeometryExample(app) })
    app.router.add('builder', () => { return new BuilderExample(app) })
    app.router.add('languages', () => { return new LanguagesExample(app) })
    app.router.add('civilization', () => { return new CivilizationExample(app) })
    app.router.add('loader', () => { return new LoaderExample(app) })
    app.router.add('mermaid', () => { return new MermaidExample(app) })
    app.router.add('visuals', () => { return new ProcessExample(app) })
    app.router.add('popout', () => { return new PopoutExample(app) })
    app.router.add('frames', () => { return new FramesExample(app) })
  }
}
