import { Material, MaterialParameters, MeshBasicMaterial, MeshBasicMaterialParameters } from "three"
import { LineMaterial, LineMaterialParameters } from "three/examples/jsm/lines/LineMaterial"
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader"

interface WaitingContext {
  callbacks: Array<(data: Font) => void>  // store callbacks while waiting for load to complete
}

export class FontCache {
  private fontMap = new Map<string, Font>()
  private waitingMap = new Map<string, WaitingContext>()

  private fontLoader = new FontLoader()

  constructor(warn = false) {
    if (warn) console.warn('Warning: font being loaded/cached multiple times')
  }

  getFont(url: string, onLoad: (data: Font) => void) {
    let font = this.fontMap.get(url)
    if (!font) {
      // check if we're waiting for this url to load
      let waiting = this.waitingMap.get(url)
      if (!waiting) {
        // create list for callbacks to be remembered
        waiting = { callbacks: [] }
        this.waitingMap.set(url, waiting)

        this.fontLoader.load(url, (font: Font) => {
          this.fontMap.set(url, font)
          onLoad(font)
          if (!waiting) return
          waiting.callbacks.forEach(onLoad => onLoad(font))
        })
      }
      else {
        // waiting, so remember the callback
        waiting.callbacks.push(onLoad)
      }
    }
    else
      onLoad(font)
  }
}

