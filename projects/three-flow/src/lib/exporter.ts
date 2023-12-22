import { Object3D } from "three";


//
// code adapted from https://github.com/mrdoob/three.js/blob/master/examples/misc_exporter_gltf.html
//

export class Exporter {


  static link: any;

  constructor() {
    if (!Exporter.link) {
      Exporter.link = document.createElement('a');
      Exporter.link.style.display = 'none';
      document.body.appendChild(Exporter.link); 
    }
  }

  save(blob: any, filename: string) {

    Exporter.link.href = URL.createObjectURL(blob);
    Exporter.link.download = filename;
    Exporter.link.click();

  }

  saveString(text: string, filename: string, mimetype = 'text/plain') {

    this.save(new Blob([text], { type: mimetype }), filename);

  }

  saveJSON(object: any, filename: string, mimetype = 'application/json') {

    this.save(new Blob([JSON.stringify(object, undefined, 2)], { type: mimetype }), filename);

  }



}
