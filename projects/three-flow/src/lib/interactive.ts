import { Vector2, Raycaster, Renderer, Camera, Object3D, Plane, Vector3, Matrix4, Intersection, BaseEvent } from 'three';

export const InteractiveEventType = {
  POINTERENTER: 'pointerenter',
  POINTERLEAVE: 'pointerleave',
  POINTERMISSED: 'pointermissed',
  DRAGSTART: 'dragstart',
  DRAG: 'drag',
  DRAGEND: 'dragend',
}

export interface InteractiveDragStartEvent extends BaseEvent { position: Vector3, data: Array<Intersection> }
export interface InteractiveDragEvent extends BaseEvent { position: Vector3 }
export interface InteractiveDragEnd extends BaseEvent { position: Vector3 }


export class FlowObjects {
  private _list: Array<Object3D> = [];

  get list(): Array<Object3D> { return this._list; }

  add(...object: Object3D[]) {
    this._list.push(...object);
  }

  remove(...object: Object3D[]) {
    object.forEach(item => {
      const index = this._list.findIndex(x => x == item);
      if (index != undefined && index != -1)
        this._list.splice(index, 1);
    });
  }
}


export class FlowInteractive {
  public selectable = new FlowObjects()
  public draggable = new FlowObjects()


  dispose = () => { }

  constructor(renderer: Renderer, camera: Camera) {

    const _pointer = new Vector2();
    const _plane = new Plane();
    const _offset = new Vector3();
    const _worldPosition = new Vector3();
    const _intersection = new Vector3();
    const _inverseMatrix = new Matrix4();

    const entered: Array<Object3D> = [];

    let _selected: any;

    const _event = { type: '', position: _intersection, data: [] as Array<Intersection>, stop: false };

    const raycaster = new Raycaster();

    // Pointer Events

    const element = document;

    const onPointerEvent = (event: PointerEvent | MouseEvent) => {
      event.stopPropagation();

      const rect = renderer.domElement.getBoundingClientRect();

      _pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
      _pointer.y = - (event.clientY - rect.top) / rect.height * 2 + 1;

      raycaster.setFromCamera(_pointer, camera);
      let _intersects = raycaster.intersectObjects(this.selectable.list, false);

      _event.data = _intersects

      if (_intersects.length > 0) {
        // remember what's overlapping
        const overlapping = new Set<Object3D>(entered)

        _event.stop = false
        _intersects.forEach(intersection => {
          // stop bubbling event to anything behind last object
          if (_event.stop) return

          const object = intersection.object;

          // ignore anything not in the scene
          if (!object.parent) return

          if (!entered.includes(object)) {
            if (!_selected) {
              _event.type = InteractiveEventType.POINTERENTER;
              object.dispatchEvent<any>(_event);
              entered.push(object);
            }
          }
          else
            overlapping.delete(object)

          _event.type = event.type;

          object.dispatchEvent<any>(_event);

        })

        // anything that hasn't been removed is no longer overlapping
        overlapping.forEach(object => {
          if (object == _selected) return
          _event.type = InteractiveEventType.POINTERLEAVE;
          object.dispatchEvent<any>(_event);

          // if entered, remove it
          const index = entered.indexOf(object)
          if (index != -1) {
            entered.splice(index, 1)
          }
        })
      }

      else {
        // warning - in else, only check event, not _event

        entered.forEach(item => {
          if (item == _selected) return
          _event.type = InteractiveEventType.POINTERLEAVE;
          item.dispatchEvent<any>(_event);
        })
        entered.length = 0

        // some popup selectables close when clicking outside of them, for example, dropdown menu and color picker
        if (event.type == 'click') {
          _event.type = InteractiveEventType.POINTERMISSED;
          this.selectable.list.forEach(item => {
            if (item.visible)
              item.dispatchEvent<any>(_event)
          })
        }
      }

      // prevent dragging if last event was stopped
      if (!_selected && _event.stop) return

      _intersects = raycaster.intersectObjects(this.draggable.list, false);
      _event.data = _intersects

      if (_intersects.length > 0) {
        const intersection = _intersects[0];

        const object = intersection.object;

        if (event.type == 'pointerdown') {
          _selected = object;

          _plane.setFromNormalAndCoplanarPoint(_selected.getWorldDirection(_plane.normal), _worldPosition.setFromMatrixPosition(_selected.matrixWorld));

          if (raycaster.ray.intersectPlane(_plane, _intersection)) {
            let owner = _selected.parent
            if (owner.type != 'Scene') owner = _selected
            _inverseMatrix.copy(owner.matrixWorld).invert();
            _intersection.applyMatrix4(_inverseMatrix)
          }

          _selected.dispatchEvent({ type: InteractiveEventType.DRAGSTART, position: _intersection, data: _intersects });
        }
      }
      if (event.type == 'pointermove') {
        if (_selected) {

          if (raycaster.ray.intersectPlane(_plane, _intersection)) {

            _intersection.applyMatrix4(_inverseMatrix)
          }

          // let selected object decide if dragging is allowed
          _selected.dispatchEvent({ type: InteractiveEventType.DRAG, position: _intersection });

        }
      }
      else if (event.type == 'pointerup') {
        if (_selected) {

          _selected.dispatchEvent({ type: InteractiveEventType.DRAGEND, position: _intersection });

          _selected = undefined;

        }
      }
    }

    element.addEventListener('pointerdown', onPointerEvent);
    element.addEventListener('pointerup', onPointerEvent);
    element.addEventListener('pointermove', onPointerEvent);
    element.addEventListener('click', onPointerEvent);

    this.dispose = () => {
      element.removeEventListener('pointerdown', onPointerEvent);
      element.removeEventListener('pointerup', onPointerEvent);
      element.removeEventListener('pointermove', onPointerEvent);
      element.removeEventListener('click', onPointerEvent);
    }
  }

}
