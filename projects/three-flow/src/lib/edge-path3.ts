import { Vector3 } from "three";
import { AnchorType } from "./model";
import { Path3 } from "./path3";

// The following code is adapted from https://github.com/xyflow/xyflow/tree/main/packages/system/src/utils/edges
// * returns three.js Path instead of SVG path string
// * reverse Y direction - its down for SVG and up for three.js
// * smaller radius values in cm instead of pixels

export type GetStraightPath3Params = {
  source: Vector3
  target: Vector3
};


export interface GetSmoothStepPath3Params {
  source: Vector3
  sourcePosition: AnchorType;
  target: Vector3
  targetPosition: AnchorType;
  borderRadius?: number;
  center?: Vector3
  lineoffset?: number;
}


export type GetBezierPath3Params = {
  source: Vector3
  sourcePosition: AnchorType;
  target: Vector3
  targetPosition: AnchorType;
  curvature?: number;
};

type GetControlWithCurvatureParams = {
  pos: AnchorType;
  v1: Vector3
  v2: Vector3
  c: number;
};

export class FlowEdgePath3 {

  getStraightPath({
    source,
    target,
  }: GetStraightPath3Params): { path: Path3, label: Vector3, offset: Vector3 } {
    const [label, offset] = this.getEdgeCenter({
      source,
      target,
    });

    const path = new Path3()
    path.moveTo(source.x, source.y, source.z)
    path.lineTo(target.x, target.y, target.z)
    return { path, label, offset };
  }


  private getEdgeCenter({
    source,
    target,
  }: {
    source: Vector3
    target: Vector3
  }): [Vector3, Vector3] {
    const offset = new Vector3()
    const center = new Vector3()
    offset.x = Math.abs(target.x - source.x) / 2;
    center.x = target.x < source.x ? target.x + offset.x : target.x - offset.x;

    offset.y = Math.abs(target.y - source.y) / 2;
    center.y = target.y < source.y ? target.y + offset.y : target.y - offset.y;

    offset.z = Math.abs(target.z - source.z) / 2;
    center.z = target.z < source.z ? target.z + offset.z : target.z - offset.z;

    return [center, offset];
  }

  private calcPoints({
    source,
    sourcePosition = 'bottom',
    target,
    targetPosition = 'top',
    center,
    offset,
  }: {
    source: Vector3;
    sourcePosition: AnchorType;
    target: Vector3;
    targetPosition: AnchorType;
    center: Vector3;
    offset: number;
  }): [Vector3[], Vector3, Vector3] {
    const handleDirections = {
      'left': { x: -1, y: 0, z: 0 },
      'right': { x: 1, y: 0, z: 0 },
      'top': { x: 0, y: 1, z: 0 },
      'bottom': { x: 0, y: -1, z: 0 },
      'center': { x: 0, y: 0, z: 0 },
      'front': { x: 0, y: 0, z: 1 },
      'back': { x: 0, y: 0, z: -1 },
    };

    const sourceDir = handleDirections[sourcePosition];
    const targetDir = handleDirections[targetPosition];
    const sourceGapped = new Vector3(source.x + sourceDir.x * offset, source.y + sourceDir.y * offset, source.z + sourceDir.z * offset);
    const targetGapped = new Vector3(target.x + targetDir.x * offset, target.y + targetDir.y * offset, target.z + targetDir.z * offset);

    const getDirection = ({
      source,
      sourcePosition = 'bottom',
      target,
    }: {
      source: Vector3;
      sourcePosition: AnchorType;
      target: Vector3;
    }): Vector3 => {
      if (sourcePosition === 'left' || sourcePosition === 'right') {
        return source.x < target.x ? new Vector3(1, 0, 0) : new Vector3(-1, 0, 0);
      }
      else if (sourcePosition === 'top' || sourcePosition === 'bottom') {
        return source.y < target.y ? new Vector3(0, 1, 0) : new Vector3(0, -1, 0);
      }
      return source.z < target.z ? new Vector3(0, 0, 1) : new Vector3(0, 0, -1);
    };


    const dir = getDirection({
      source: sourceGapped,
      sourcePosition,
      target: targetGapped,
    });
    const dirXY = dir.x !== 0 ? 'x' : 'y';
    const currDir = dir[dirXY];

    let points: Vector3[] = [];
    let centerX, centerY, centerZ;
    const sourceGapOffset = { x: 0, y: 0, z: 0 };
    const targetGapOffset = { x: 0, y: 0, z: 0 };

    const [defaultCenter, defaultOffset] = this.getEdgeCenter({
      source, target,
    });

    centerZ = center.z || defaultCenter.z;

    // opposite handle positions, default case
    if (sourceDir[dirXY] * targetDir[dirXY] === -1) {
      centerX = center.x || defaultCenter.x;
      centerY = center.y || defaultCenter.y;
      //    --->
      //    |
      // >---
      const verticalSplit: Vector3[] = [
        new Vector3(centerX, sourceGapped.y),
        new Vector3(centerX, targetGapped.y),
      ];
      //    |
      //  ---
      //  |
      const horizontalSplit: Vector3[] = [
        new Vector3(sourceGapped.x, centerY),
        new Vector3(targetGapped.x, centerY),
      ];

      if (sourceDir[dirXY] === currDir) {
        points = dirXY === 'x' ? verticalSplit : horizontalSplit;
      } else {
        points = dirXY === 'x' ? horizontalSplit : verticalSplit;
      }
    } else {
      // sourceTarget means we take x from source and y from target, targetSource is the opposite
      const sourceTarget: Vector3[] = [new Vector3(sourceGapped.x, targetGapped.y)];
      const targetSource: Vector3[] = [new Vector3(targetGapped.x, sourceGapped.y)];
      // this handles edges with same handle positions
      if (dirXY === 'x') {
        points = sourceDir.x === currDir ? targetSource : sourceTarget;
      } else {
        points = sourceDir.y === currDir ? sourceTarget : targetSource;
      }

      if (sourcePosition === targetPosition) {
        const diff = Math.abs(source[dirXY] - target[dirXY]);

        // if an edge goes from right to right for example (sourcePosition === targetPosition) and the distance between source.x and target.x is less than the offset, the added point and the gapped source/target will overlap. This leads to a weird edge path. To avoid this we add a gapOffset to the source/target
        if (diff <= offset) {
          const gapOffset = Math.min(offset, offset - diff);
          if (sourceDir[dirXY] === currDir) {
            sourceGapOffset[dirXY] = (sourceGapped[dirXY] > source[dirXY] ? -1 : 1) * gapOffset;
          } else {
            targetGapOffset[dirXY] = (targetGapped[dirXY] > target[dirXY] ? -1 : 1) * gapOffset;
          }
        }
      }

      // these are conditions for handling mixed handle positions like Right -> Bottom for example
      if (sourcePosition !== targetPosition) {
        const dirAccessorOpposite = dirXY === 'x' ? 'y' : 'x';
        const isSameDir = sourceDir[dirXY] === targetDir[dirAccessorOpposite];
        const sourceGtTargetOppo = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
        const sourceLtTargetOppo = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
        const flipSourceTarget =
          (sourceDir[dirXY] === 1 && ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
          (sourceDir[dirXY] !== 1 && ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

        if (flipSourceTarget) {
          points = dirXY === 'x' ? sourceTarget : targetSource;
        }
      }

      const sourceGapPoint = { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y, z: sourceGapped.z + sourceGapOffset.z };
      const targetGapPoint = { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y, z: targetGapped.z + targetGapOffset.z };
      const maxXDistance = Math.max(Math.abs(sourceGapPoint.x - points[0].x), Math.abs(targetGapPoint.x - points[0].x));
      const maxYDistance = Math.max(Math.abs(sourceGapPoint.y - points[0].y), Math.abs(targetGapPoint.y - points[0].y));
      const maxZDistance = Math.max(Math.abs(sourceGapPoint.z - points[0].z), Math.abs(targetGapPoint.z - points[0].z));

      // we want to place the label on the longest segment of the edge
      if (maxXDistance >= maxYDistance) {
        centerX = (sourceGapPoint.x + targetGapPoint.x) / 2;
        centerY = points[0].y;
      } if (maxZDistance >= maxYDistance) {
        centerZ = (sourceGapPoint.z + targetGapPoint.z) / 2;
        centerY = points[0].y;
        centerX = points[0].x;
      } else {
        centerX = points[0].x;
        centerY = (sourceGapPoint.y + targetGapPoint.y) / 2;
        centerZ = points[0].z;
      }
    }

    const pathPoints = [
      source,
      new Vector3(sourceGapped.x + sourceGapOffset.x, sourceGapped.y + sourceGapOffset.y, sourceGapped.z + sourceGapOffset.z),
      ...points,
      new Vector3(targetGapped.x + targetGapOffset.x, targetGapped.y + targetGapOffset.y, targetGapped.z + targetGapOffset.z),
      target,
    ];

    return [pathPoints, center, defaultOffset];
  }

  // Helper function to determine the primary direction of the bend
  private determinePrimaryDirection(a: Vector3, b: Vector3, c: Vector3): 'x' | 'y' | 'z' {
    const xDiff = Math.abs(a.x - c.x);
    const yDiff = Math.abs(a.y - c.y);
    const zDiff = Math.abs(a.z - c.z);

    if (xDiff > yDiff && xDiff > zDiff) return 'x';
    if (yDiff > xDiff && yDiff > zDiff) return 'y';
    return 'z';
  }

  private calcBend(a: Vector3, b: Vector3, c: Vector3, size: number, path: Path3) {
    const bendSize = Math.min(a.distanceTo(b) / 2, b.distanceTo(c) / 2, size);
    const { x, y, z } = b;

    // Determine the primary direction of the bend (X, Y, or Z)
    const primaryDir = this.determinePrimaryDirection(a, b, c);
    //if (primaryDir === 'x') {
    // no bend
    if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) {
      path.lineTo(x, y, z)
    }
    else {
      // first segment is horizontal
      if (a.y === y) {
        const xDir = a.x < c.x ? -1 : 1;
        const yDir = a.y < c.y ? 1 : -1;
        path.lineTo(x + bendSize * xDir, y, z)
        path.quadraticCurveTo(x, y, z, x, y + bendSize * yDir, z)
      }
      else {
        const xDir = a.x < c.x ? 1 : -1;
        const yDir = a.y < c.y ? -1 : 1;
        path.lineTo(x, y + bendSize * yDir, z)
        path.quadraticCurveTo(x, y, z, x + bendSize * xDir, y, z)
      }
    }
    //}
    //else if (primaryDir === 'y') {
    //  // no bend
    //  if ((a.x === x && x === c.x) || (a.z === z && z === c.z)) {
    //    path.lineTo(x, y, z)
    //  }
    //  else {
    //    // first segment is horizontal
    //    if (a.z === z) {
    //      const xDir = a.x < c.x ? -1 : 1;
    //      const zDir = a.z < c.z ? 1 : -1;
    //      path.lineTo(x + bendSize * xDir, y, z)
    //      path.quadraticCurveTo(x, y, z, x, y, z + bendSize * zDir)
    //    }
    //    else {
    //      const xDir = a.x < c.x ? 1 : -1;
    //      const zDir = a.z < c.z ? -1 : 1;
    //      path.lineTo(x, y, z + bendSize * zDir)
    //      path.quadraticCurveTo(x, y, z, x + bendSize * xDir, y, z)
    //    }
    //  }

    //}
    //else {
    //  if ((a.z === z && z === c.z) || (a.y === y && y === c.y)) {
    //    path.lineTo(x, y, z)
    //  }
    //  else {
    //    // first segment is horizontal
    //    if (a.y === y) {
    //      const zDir = a.z < c.z ? -1 : 1;
    //      const yDir = a.y < c.y ? 1 : -1;
    //      path.lineTo(x, y, z + bendSize * zDir)
    //      path.quadraticCurveTo(x, y, z, x, y + bendSize * yDir, z)
    //    }
    //    else {
    //      const zDir = a.z < c.z ? 1 : -1;
    //      const yDir = a.y < c.y ? -1 : 1;
    //      path.lineTo(x, y + bendSize * yDir, z)
    //      path.quadraticCurveTo(x, y, z, x, y, z + bendSize * zDir)
    //    }
    //  }
    //}

  }



  getSmoothStepPath({
    source,
    sourcePosition = 'bottom',
    target,
    targetPosition = 'top',
    borderRadius = 0.1,
    center = new Vector3(),
    lineoffset = 0.1,
  }: GetSmoothStepPath3Params): { path: Path3, label: Vector3, offset: Vector3 } {
    const [points, label, offset] = this.calcPoints({
      source,
      sourcePosition,
      target,
      targetPosition,
      center,
      offset: lineoffset,
    });

    const path = new Path3()
    points.forEach((p, i) => {

      if (i > 0 && i < points.length - 1) {
        this.calcBend(points[i - 1], p, points[i + 1], borderRadius, path);
      } else {
        if (i == 0)
          path.moveTo(p.x, p.y, p.z)
        else
          path.lineTo(p.x, p.y, p.z)
      }
    });

    return { path, label, offset };
  }

  private getBezierEdgeCenter({
    source,
    target,
    sourceControl,
    targetControl,
  }: {
    source: Vector3
    target: Vector3
    sourceControl: Vector3
    targetControl: Vector3
  }): [Vector3, Vector3] {
    // cubic bezier t=0.5 mid point, not the actual mid point, but easy to calculate
    // https://stackoverflow.com/questions/67516101/how-to-find-distance-mid-point-of-bezier-curve
    const center = new Vector3()
    center.x = source.x * 0.125 + sourceControl.x * 0.375 + targetControl.x * 0.375 + target.x * 0.125;
    center.y = source.y * 0.125 + sourceControl.y * 0.375 + targetControl.y * 0.375 + target.y * 0.125;
    center.z = source.z * 0.125 + sourceControl.z * 0.375 + targetControl.z * 0.375 + target.z * 0.125;

    const offset = new Vector3()
    offset.x = Math.abs(center.x - source.x);
    offset.y = Math.abs(center.y - source.y);
    offset.z = Math.abs(center.z - source.z);

    return [center, offset];
  }

  private calculateControlOffset(distance: number, curvature: number): number {
    if (distance >= 0) {
      return 0.5 * distance;
    }

    return curvature * 2.5 * Math.sqrt(-distance);
  }

  private getControlWithCurvature({ pos, v1, v2, c }: GetControlWithCurvatureParams): Vector3 {
    const v = new Vector3()
    switch (pos) {
      case 'left':
        v.set(v1.x - this.calculateControlOffset(v1.x - v2.x, c), v1.y, v1.z)
        break
      case 'right':
        v.set(v1.x + this.calculateControlOffset(v2.x - v1.x, c), v1.y, v1.z)
        break
      case 'top':
        v.set(v1.x, v1.y + this.calculateControlOffset(v1.y - v2.y, c), v1.z)
        break
      case 'bottom':
        v.set(v1.x, v1.y - this.calculateControlOffset(v2.y - v1.y, c), v1.z)
        break
      case 'front':
        v.set(v1.x, v1.y, v1.z - this.calculateControlOffset(v1.z - v2.z, c))
        break
      case 'back':
        v.set(v1.x, v1.y, v1.z + this.calculateControlOffset(v1.z - v2.z, c))
        break
      case 'center':
      default:
        v.set(v1.x, v1.y, v1.z)
        break
    }
    return v
  }

  getBezierPath({
    source,
    sourcePosition = 'bottom',
    target,
    targetPosition = 'top',
    curvature = 0.25,
  }: GetBezierPath3Params): { path: Path3, label: Vector3, offset: Vector3 } {
    const sourceControl = this.getControlWithCurvature({
      pos: sourcePosition,
      v1: source,
      v2: target,
      c: curvature,
    });
    const targetControl = this.getControlWithCurvature({
      pos: targetPosition,
      v1: new Vector3(target.x, target.y, source.z),
      v2: new Vector3(source.x, source.y, target.z),
      c: curvature,
    });
    const [label, offset] = this.getBezierEdgeCenter({
      source,
      target,
      sourceControl,
      targetControl,
    });

    const path = new Path3()
    path.moveTo(source.x, source.y, source.z)
    path.bezierCurveTo(sourceControl.x, sourceControl.y, sourceControl.z, targetControl.x, targetControl.y, targetControl.z, target.x, target.y, target.z)

    return { path, label, offset, }
  }
}
