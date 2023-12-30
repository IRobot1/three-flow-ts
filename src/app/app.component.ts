import { Component, NgZone } from '@angular/core';
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
import { EdgeStylesExample } from '../examples/edge-styles';
import { DocumentationExample } from '../examples/documentation';
import { PodiumExample } from '../examples/podium';
import { BannerExample } from '../examples/banner';
import { ComputerNetworkExample } from '../examples/live-data/computer-network';
import { KPIExample } from '../examples/kpi';
import { MindmapExample } from '../examples/mindmap';
import { HyperFlowExample } from '../examples/hyper-flow';
import { DesignerExample } from '../examples/designer';
import { AlchemistExample } from '../examples/alchemist';
import { ConnectorsExample } from '../examples/connectors';
import { TracksExample } from '../examples/track';
import { StressExample } from '../examples/stress';
import { GUIExample } from '../examples/gui/example';


@Component({
  selector: 'app-root',
  template: '',
})
export class AppComponent {
  title = 'test'
  constructor(zone: NgZone) {

    zone.runOutsideAngular(() => {

      const app = new ThreeJSApp(undefined)

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
      app.router.add('edgestyles', () => { return new EdgeStylesExample(app) })
      app.router.add('documentation', () => { return new DocumentationExample(app) })
      app.router.add('podium', () => { return new PodiumExample(app) })
      app.router.add('banner', () => { return new BannerExample(app) })
      app.router.add('livedata', () => { return new ComputerNetworkExample(app) })
      //app.router.add('kpi', () => { return new KPIExample(app) })
      app.router.add('mindmap', () => { return new MindmapExample(app) })
      app.router.add('hyperflow', () => { return new HyperFlowExample(app) })
      app.router.add('designer', () => { return new DesignerExample(app) })
      app.router.add('alchemist', () => { return new AlchemistExample(app) })
      app.router.add('connectors', () => { return new ConnectorsExample(app) })
      app.router.add('tracks', () => { return new TracksExample(app) })
      app.router.add('stress', () => { return new StressExample(app) })
      app.router.add('gui', () => { return new GUIExample(app) })
    })
  }
}
