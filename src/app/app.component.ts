import { Component } from '@angular/core';
import { ThreeJSApp } from './threejs-app';
import { GalleryExample } from '../gallery/home';
import { BasicExample } from '../examples/basic';
import { CustomGeometryExample } from '../examples/custom-geometry';


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
  }
}
