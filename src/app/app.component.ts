import { Component } from '@angular/core';
import { ThreeJSApp } from './threejs-app';
import { GalleryExample } from '../gallery/home';
import { BasicExample } from '../examples/basic';
import { CustomGeometryExample } from '../examples/custom-geometry';
import { BuilderExample } from '../examples/builder';
import { LanguagesExample } from '../examples/languages';


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
  }
}
