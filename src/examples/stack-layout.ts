import { Mesh, Object3D, Vector3 } from "three"

export interface StackData {
  object: Object3D     // the object
  size: number         // object's calculated width or height
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

  constructor(private object: Object3D, public spacing = 0, public autoLayout = true, public include: (object: Object3D) => boolean = filter) {

    object.addEventListener('childadded', (e: any) => {
      const object = e.child as Object3D
      if (this.monitorObject(object) && autoLayout) {
        //console.warn('childadded', object)
        this.updatePositions()
      }
    })

    object.addEventListener('childremoved', (e: any) => {
      const index = this.data.findIndex(item => item.object === e.child)
      if (index != -1) {
        console.warn('childremoved', e.child)
        this.data.splice(index, 1)

        if (autoLayout) this.updatePositions()
      }

    })

    //object.children.forEach((object, index) => {
    //  this.monitorObject(object)

    //  object.children.forEach(child => {
    //    this.monitorObject(child)
    //  })
    //})

    //if (autoLayout) this.updatePositions()
  }

  private _addObject(object: Object3D, initialSize: number): StackData {
    let size = initialSize
    if (!size) size = this.getSize(object)

    const data: StackData = { object, index: this.data.length, size }
    this.data.push(data)

    return data
  }

  addObject(object: Object3D, initialSize: number) {
    this._addObject(object, initialSize)
  }

  monitorObject(object: Object3D, initialSize = 0): boolean {
    if (!this.include(object)) return false

    const data = this._addObject(object, initialSize)

    object.addEventListener('height_changed', (e: any) => {
      if (this.orientation != 'vertical') return
      console.warn('height changed')
      data.size = e.height
      if (this.autoLayout) this.updatePositions()
    })

    object.addEventListener('width_changed', (e: any) => {
      if (this.orientation == 'vertical') return
      console.warn('width changed')
      data.size = e.width
      if (this.autoLayout) this.updatePositions()
    })

    // listen for Troika text size changes
    object.addEventListener('synccomplete', (e: any) => {
      data.size = this.getSize(object)
      if (this.autoLayout) this.updatePositions()
    })
    return true
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

  get totalSize() { return this._totalSize }
  set totalSize(newvalue: number) {
    if (this._totalSize != newvalue) {
      this._totalSize = newvalue
      this.object.dispatchEvent<any>({ type: 'layout_changed', size: newvalue })
    }
  }

  updatePositions(): number {
    const total = this.data.reduce((total, next) => total + next.size + this.spacing, this.spacing)

    let position = total / 2 // start at top
    this.data.forEach(item => {
      // move half of the item size
      if (this.orientation == 'vertical') {
        position -= this.spacing + item.size / 2
      }
      else {
        position += this.spacing + item.size / 2
      }

      // set position and move remainder of item size
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
