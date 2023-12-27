import { CatmullRomCurve3, Curve, EventDispatcher, Object3D, Object3DEventMap, Vector3 } from "three"

export enum FlowTrackEventType {
  TRACK_ADDED = 'itemAdded',
  TRACK_REMOVED = 'itemRemoved',
  START_REACHED = 'startReached',
  POSITION_UPDATED = 'positionUpdated',
  WAYPOINT_REACHED = 'waypointReached',
  END_REACHED = 'endReached',
}

export interface FlowTrackParameters {
  points: Vector3[]
  speed?: number
  waypoints?: Vector3[]
  waypointThreshold?: number
}

export interface TrackItemEventMap extends Object3DEventMap {
  startReached: { type: string }
  endReached: { type: string }
  positionUpdated: { type: string, position: Vector3 }
  waypointReached: { type: string, index: number, waypoint: Vector3 }
}

export interface TrackEventMap extends Object3DEventMap {
  itemAdded: { type: string, item: Object3D<TrackItemEventMap> }
  itemRemoved: { type: string, item: Object3D<TrackItemEventMap> }
}

export class FlowTrack extends EventDispatcher<TrackEventMap> implements FlowTrackParameters {
  speed: number
  waypoints?: Vector3[]
  waypointThreshold: number
  curve!: Curve<Vector3>
  curveLength!: number
  currentDistance: number = 0
  lastWaypointIndex: number = -1
  isMoving: boolean = false
  reverse: boolean = false;

  private objects: Array<Object3D<TrackItemEventMap>> = []

  constructor(params: FlowTrackParameters) {
    super()
    this.speed = params.speed != undefined ? params.speed : 1
    this.waypoints = params.waypoints
    this.waypointThreshold = params.waypointThreshold != undefined ? params.waypointThreshold : 0.1
    this.points = params.points
  }

  set points(newvalue: Vector3[]) {
    if (newvalue.length < 2) return
    this.curve = new CatmullRomCurve3(newvalue)
    this.curveLength = this.curve.getLength()
    this.currentDistance = 0
    this.lastWaypointIndex = -1
  }

  update(deltaTime: number) {
    if (!this.isMoving) return

    this.objects.forEach(item => {

      // Update current distance based on speed and direction
      this.currentDistance += (this.reverse ? -1 : 1) * this.speed * deltaTime;

      // Handle boundary conditions
      if (this.currentDistance > this.curveLength) {
        this.currentDistance = this.curveLength;
        item.dispatchEvent({ type: FlowTrackEventType.END_REACHED });
      } else if (this.currentDistance < 0) {
        this.currentDistance = 0;
        item.dispatchEvent({ type: FlowTrackEventType.START_REACHED, });
      } else {
        const newPoint = this.curve.getPointAt(this.currentDistance / this.curveLength)
        item.dispatchEvent({ type: FlowTrackEventType.POSITION_UPDATED, position: newPoint })
        this.checkWaypoints(newPoint, item)
      }
    })
  }

  private checkWaypoints(currentPosition: Vector3, item: Object3D<TrackItemEventMap>) {
    this.waypoints?.forEach((waypoint, index) => {
      if (index <= this.lastWaypointIndex) return
      if (currentPosition.distanceTo(waypoint) < this.waypointThreshold) {
        item.dispatchEvent({ type: FlowTrackEventType.WAYPOINT_REACHED, index, waypoint: waypoint })
        this.lastWaypointIndex = index
      }
    })
  }

  addItem(item: Object3D<TrackItemEventMap>) {
    this.objects.push(item);
    this.dispatchEvent({ type: FlowTrackEventType.TRACK_ADDED, item: item });
  }

  removeItem(item: Object3D<TrackItemEventMap>) {
    const index = this.objects.indexOf(item);
    if (index !== -1) {
      this.objects.splice(index, 1);
      this.dispatchEvent({ type: FlowTrackEventType.TRACK_REMOVED, item: item });
    }
  }

  start() {
    this.isMoving = true
  }

  stop() {
    this.isMoving = false
  }

  reverseDirection() {
    this.reverse = !this.reverse;
  }
}

interface FlowTrackManagerEventMap extends Object3DEventMap {
  itemAdded: { type: string, item: FlowTrack }
  itemRemoved: { type: string, item: FlowTrack }
}
export class FlowTracks extends Object3D<FlowTrackManagerEventMap> {
  private items: Array<FlowTrack> = []

  addTrack(parameters: FlowTrackParameters): FlowTrack {
    const item = this.createTrack(parameters)
    this.items.push(item)
    this.dispatchEvent({ type: FlowTrackEventType.TRACK_ADDED, item: item })
    return item
  }

  removeTrack(item: FlowTrack) {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.dispatchEvent({ type: FlowTrackEventType.TRACK_REMOVED, item: item });
    }
  }

  createTrack(parameters: FlowTrackParameters): FlowTrack {
    return new FlowTrack(parameters)
  }

  updateTracks(deltaTime: number) {
    this.items.forEach(item => item.update(deltaTime))
  }
}
