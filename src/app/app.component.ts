import { Component } from '@angular/core';
import { ThreeJSApp } from './threejs-app';
import { GalleryExample } from '../gallery/home';
import { DiagramExample } from '../examples/diagram';


@Component({
  selector: 'app-root',
  template: '',
})
export class AppComponent {
  title = 'test'
  constructor() {

    const app = new ThreeJSApp()

    app.router.add('/', () => { return new GalleryExample(app) })
    app.router.add('diagram', () => { return new DiagramExample(app) })
  }
}
