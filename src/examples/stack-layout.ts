import { Mesh, Object3D, Vector3 } from "three"

export interface StackData {
  object: Object3D     // the object
  size: number         // object's calculated width or height
  extrasize: number    // useful for expander when extra height is needed
  index: number        // useful for sorting to change order
}

export type LayoutOrientation = 'vertical' | 'horizontal'

function filter(object: Object3D): boolean {
  return object.type == 'Mesh'
}

export class StackLayout {
  private _orientation: LayoutOrientation = 'vertical'
  private _totalSize = 0

  data: Array<StackData> = []

  constructor(public monitor: Object3D, public spacing = 0, public autoLayout = true, include: (object: Object3D) => boolean = filter) {

    const monitorObject = (object: Object3D): boolean => {
      if (!include(object)) return false

      const size = this.getSize(object)
      const extrasize = this.getExtraSize(object)
      const data: StackData = { object, index: this.data.length, size, extrasize }
      this.data.push(data)

      object.addEventListener('height_changed', (e: any) => {
        if (this.orientation != 'vertical') return
        console.warn('height changed')
        data.size = e.height
        data.extrasize = this.getExtraSize(object)
        if (autoLayout) this.updatePositions()
      })

      object.addEventListener('width_changed', (e: any) => {
        if (this.orientation == 'vertical') return
        console.warn('width changed')
        data.size = e.width
        data.extrasize = this.getExtraSize(object)
        if (autoLayout) this.updatePositions()
      })

      // listen for Troika text size changes
      object.addEventListener('synccomplete', (e: any) => {
        console.warn('synccomplete')
        data.size = this.getSize(object)
        data.extrasize = this.getExtraSize(object)
        if (autoLayout) this.updatePositions()
      })
      return true
    }

    monitor.addEventListener('childadded', (e: any) => {
      const object = e.child as Object3D
      console.warn(e.child)
      let included = false
      included = included || monitorObject(object)

      object.children.forEach(child => {
        included = included || monitorObject(child)
      })

      console.warn(included)
      if (included && autoLayout) this.updatePositions()
    })

    monitor.addEventListener('childremoved', (e: any) => {
      console.warn('childremoved', e.child)
      if (autoLayout) this.updatePositions()
    })

    monitor.children.forEach((object, index) => {
      monitorObject(object)

      object.children.forEach(child => {
        monitorObject(child)
      })
    })

    if (autoLayout) this.updatePositions()
  }

  get orientation() { return this._orientation }
  set orientation(newvalue: LayoutOrientation) {
    if (this._orientation != newvalue) {
      this._orientation = newvalue
      this.updatePositions()
    }
  }

  private _size = new Vector3()

  getSize(object: Object3D): number {
    const mesh = object as Mesh
    let tbox = mesh.geometry.boundingBox
    if (!tbox) {
      mesh.geometry.computeBoundingBox()
      tbox = mesh.geometry.boundingBox
    }
    const box = tbox!
    const size = box.getSize(this._size)
    if (this.orientation == 'vertical')
      return size.y
    return size.x
  }

  getExtraSize(object: Object3D): number {
    return 0 //object.userData['extraheight']
  }

  get totalSize() { return this._totalSize }
  set totalSize(newvalue: number) {
    if (this._totalSize != newvalue) {
      this._totalSize = newvalue
      this.monitor.dispatchEvent<any>({ type: 'layout_changed', size: newvalue })
    }
  }

  updatePositions(): number {
    const total = this.data.reduce((total, next) => total + next.size + next.extrasize + this.spacing, this.spacing)
    console.warn(this.data, total/2)

    let position = 0
    this.data.forEach((item, index) => {
      if (index == 0)
        position = total / 2 - this.spacing - item.size / 2
      else {
        if (this.orientation == 'vertical') {
          position -= this.spacing + (item.size + item.extrasize)/2
        }
        else {
          position += this.spacing + (item.size + item.extrasize)/2
        }
      }
      if (this.orientation == 'vertical') {
        item.object.position.y = position
        position -= item.size / 2
      }
      else {
        item.object.position.x = position
        position += item.size / 2
      }

    })

    this.totalSize = total
    return total
  }
}
