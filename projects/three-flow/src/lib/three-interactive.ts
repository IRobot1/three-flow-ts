import { Vector2, Raycaster, Renderer, Camera, Object3D, Plane, Vector3, Matrix4, Intersection, BaseEvent, WebGLRenderer } from 'three';

export const InteractiveEventType = {
  POINTERMOVE: 'pointermove',
  POINTERDOWN: 'pointerdown',
  POINTERUP: 'pointerup',
  POINTERENTER: 'pointerenter',
  POINTERLEAVE: 'pointerleave',
  POINTERMISSED: 'pointermissed',
  CLICK: 'click',
  CONTEXTMENU: 'contextmenu',
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

  clear() { this._list.length = 0 }
}


export class ThreeInteractive {
  public selectable = new FlowObjects()
  public draggable = new FlowObjects()


  dispose = () => { }

  constructor(public renderer: WebGLRenderer, public camera: Camera) {

    const _pointer = new Vector2();
    const _plane = new Plane();
    const _offset = new Vector3();
    const _worldPosition = new Vector3();
    const _intersection = new Vector3();
    const _inverseMatrix = new Matrix4();

    const entered: Array<Object3D> = [];

    let _selected: any;

    const _event = { type: '', position: _intersection, data: _pointer, intersections: [] as Array<Intersection>, stop: false };

    const raycaster = new Raycaster();

    // Pointer Events
    const events: any = {
      'pointermove': 'pointermove',
      'pointerdown': 'pointerdown',
      'pointerup': 'pointerup',
      'click': 'click',
      'contextmenu': 'contextmenu',
      'move': 'pointermove',
      'selectstart': 'pointerdown',
      'selectend': 'pointerup',
      'select': 'click',
    };

    const element = document;

    const onPointerEvent = (event: PointerEvent | MouseEvent) => {
      event.stopPropagation();

      const rect = renderer.domElement.getBoundingClientRect();

      _pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
      _pointer.y = - (event.clientY - rect.top) / rect.height * 2 + 1;

      raycaster.setFromCamera(_pointer, camera);
      handleEvent(event)
    }

    const handleEvent = (newevent: PointerEvent | MouseEvent) => {
      const selectIntersects = raycaster.intersectObjects(this.selectable.list, false);

      _event.type = events[newevent.type];
      _event.intersections = selectIntersects

      if (selectIntersects.length > 0) {
        // remember what's overlapping
        const overlapping = new Set<Object3D>(entered)

        _event.stop = false
        selectIntersects.forEach(intersection => {
          // stop bubbling event to anything behind last object
          if (_event.stop) return

          const object = intersection.object;

          // ignore anything not in the scene
          if (!object.parent) return

          if (!entered.includes(object)) {
            if (!_selected) {
              _event.type = InteractiveEventType.POINTERENTER;
              entered.push(object);
            }
          }
          else
            overlapping.delete(object)

          const uv = intersection.uv;
          if (uv)
            _event.data.set(uv.x, 1 - uv.y);

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
        if (_event.type == 'click') {
          _event.type = InteractiveEventType.POINTERMISSED;
          this.selectable.list.forEach(item => {
            if (item.visible)
              item.dispatchEvent<any>(_event)
          })
        }
      }

      // prevent dragging if last event was stopped
      if (!_selected && _event.stop) return

      const dragIntersects = raycaster.intersectObjects(this.draggable.list, false);

      if (selectIntersects.length > 0) {
        const intersection = selectIntersects[0];

        const object = intersection.object;

        if (_event.type == 'pointerdown') {
          _selected = object;

          _plane.setFromNormalAndCoplanarPoint(_selected.getWorldDirection(_plane.normal), _worldPosition.setFromMatrixPosition(_selected.matrixWorld));

          if (raycaster.ray.intersectPlane(_plane, _intersection)) {
            _inverseMatrix.copy(_selected.parent.matrixWorld).invert();

            _selected.dispatchEvent({ type: InteractiveEventType.DRAGSTART, position: _intersection.applyMatrix4(_inverseMatrix), selectIntersects, dragIntersects });
          }

        }
      }
      if (_event.type == 'pointermove') {
        if (_selected) {

          if (raycaster.ray.intersectPlane(_plane, _intersection)) {

            // let selected object decide if dragging is allowed
            _selected.dispatchEvent({ type: InteractiveEventType.DRAG, position: _intersection.applyMatrix4(_inverseMatrix), selectIntersects, dragIntersects });
          }


        }
      }
      else if (_event.type == 'pointerup') {
        if (_selected) {
          document.body.style.cursor = 'default'

          _selected.dispatchEvent({ type: InteractiveEventType.DRAGEND, position: _intersection, selectIntersects, dragIntersects });

          _selected = undefined;

        }
      }
    }

    element.addEventListener('pointerdown', onPointerEvent);
    element.addEventListener('pointerup', onPointerEvent);
    element.addEventListener('pointermove', onPointerEvent);
    element.addEventListener('click', onPointerEvent);
    element.addEventListener('contextmenu', onPointerEvent);

    const tempMatrix = new Matrix4();

    const onXRControllerEvent = (event: any) => {
      if (event.target == null) return

      const controller = event.target as Object3D;
      tempMatrix.identity().extractRotation(controller.matrixWorld);

      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

      handleEvent(event)
    }

    const controller1 = renderer.xr.getController(0);
    controller1.addEventListener('move', onXRControllerEvent);
    controller1.addEventListener('select', onXRControllerEvent);
    controller1.addEventListener('selectstart', onXRControllerEvent);
    controller1.addEventListener('selectend', onXRControllerEvent);

    const controller2 = renderer.xr.getController(1);
    controller2.addEventListener('move', onXRControllerEvent);
    controller2.addEventListener('select', onXRControllerEvent);
    controller2.addEventListener('selectstart', onXRControllerEvent);
    controller2.addEventListener('selectend', onXRControllerEvent);

    this.dispose = () => {

      element.removeEventListener('pointerdown', onPointerEvent);
      element.removeEventListener('pointerup', onPointerEvent);
      element.removeEventListener('pointermove', onPointerEvent);
      element.removeEventListener('click', onPointerEvent);
      element.removeEventListener('contextmenu', onPointerEvent);
    }
  }

}
