import { Path, Vector3 } from "three";
import { AnchorType } from "./model";
import { Path3 } from "./path3";

// The following code is adapted from https://github.com/xyflow/xyflow/tree/main/packages/system/src/utils/edges
// * returns three.js Path instead of SVG path string
// * reverse Y direction - its down for SVG and up for three.js
// * smaller radius values in cm instead of pixels

export type GetStraightPath3Params = {
  sourceX: number;
  sourceY: number;
  sourceZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
};


export interface GetSmoothStepPath3Params {
  sourceX: number;
  sourceY: number;
  sourceZ: number;
  sourcePosition: AnchorType;
  targetX: number;
  targetY: number;
  targetZ: number;
  targetPosition: AnchorType;
  borderRadius?: number;
  centerX?: number;
  centerY?: number;
  centerZ?: number;
  offset?: number;
}


export type GetBezierPath3Params = {
  sourceX: number;
  sourceY: number;
  sourceZ: number;
  sourcePosition: AnchorType;
  targetX: number;
  targetY: number;
  targetZ: number;
  targetPosition: AnchorType;
  curvature?: number;
};

type GetControlWithCurvatureParams = {
  pos: AnchorType;
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;
  c: number;
};

export class FlowEdgePath3 {

  getStraightPath({
    sourceX,
    sourceY,
    sourceZ,
    targetX,
    targetY,
    targetZ,
  }: GetStraightPath3Params): { path: Path3, labelX: number, labelY: number, labelZ: number, offsetX: number, offsetY: number, offsetZ: number } {
    const [labelX, labelY, labelZ, offsetX, offsetY, offsetZ] = this.getEdgeCenter({
      sourceX,
      sourceY,
      sourceZ,
      targetX,
      targetY,
      targetZ,
    });

    const path = new Path3()
    path.moveTo(sourceX, sourceY, sourceZ)
    path.lineTo(targetX, targetY, targetZ)
    return { path, labelX, labelY, labelZ, offsetX, offsetY, offsetZ };
  }


  private getEdgeCenter({
    sourceX,
    sourceY,
    sourceZ,
    targetX,
    targetY,
    targetZ,
  }: {
    sourceX: number;
    sourceY: number;
    sourceZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
  }): [number, number, number, number, number, number] {
    const xOffset = Math.abs(targetX - sourceX) / 2;
    const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

    const yOffset = Math.abs(targetY - sourceY) / 2;
    const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

    const zOffset = Math.abs(targetZ - sourceZ) / 2;
    const centerZ = targetZ < sourceZ ? targetZ + zOffset : targetZ - zOffset;

    return [centerX, centerY, centerZ, xOffset, yOffset, zOffset];
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
    center: Partial<Vector3>;
    offset: number;
  }): [Vector3[], number, number, number, number, number, number] {
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

    const [defaultCenterX, defaultCenterY, defaultCenterZ, defaultOffsetX, defaultOffsetY, defaultOffsetZ] = this.getEdgeCenter({
      sourceX: source.x,
      sourceY: source.y,
      sourceZ: source.z,
      targetX: target.x,
      targetY: target.y,
      targetZ: target.z,
    });

    centerZ = center.z || defaultCenterZ;

    // opposite handle positions, default case
    if (sourceDir[dirXY] * targetDir[dirXY] === -1) {
      centerX = center.x || defaultCenterX;
      centerY = center.y || defaultCenterY;
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
          const gapOffset = Math.min(offset - 1, offset - diff);
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

    return [pathPoints, centerX, centerY, centerZ, defaultOffsetX, defaultOffsetY, defaultOffsetZ];
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
    if (primaryDir === 'x') {
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
    }
    else if (primaryDir === 'y') {
      // no bend
      if ((a.x === x && x === c.x) || (a.z === z && z === c.z)) {
        path.lineTo(x, y, z)
      }
      else {
        // first segment is horizontal
        if (a.z === z) {
          const xDir = a.x < c.x ? -1 : 1;
          const zDir = a.z < c.z ? 1 : -1;
          path.lineTo(x + bendSize * xDir, y, z)
          path.quadraticCurveTo(x, y, z, x, y, z + bendSize * zDir)
        }
        else {
          const xDir = a.x < c.x ? 1 : -1;
          const zDir = a.z < c.z ? -1 : 1;
          path.lineTo(x, y, z + bendSize * zDir)
          path.quadraticCurveTo(x, y, z, x + bendSize * xDir, y, z)
        }
      }

    }
    else {
      if ((a.z === z && z === c.z) || (a.y === y && y === c.y)) {
        path.lineTo(x, y, z)
      }
      else {
        // first segment is horizontal
        if (a.y === y) {
          const zDir = a.z < c.z ? -1 : 1;
          const yDir = a.y < c.y ? 1 : -1;
          path.lineTo(x, y, z + bendSize * zDir)
          path.quadraticCurveTo(x, y, z, x, y + bendSize * yDir, z)
        }
        else {
          const zDir = a.z < c.z ? 1 : -1;
          const yDir = a.y < c.y ? -1 : 1;
          path.lineTo(x, y + bendSize * yDir, z)
          path.quadraticCurveTo(x, y, z, x, y, z + bendSize * zDir)
        }
      }
    }

  }



  getSmoothStepPath({
    sourceX,
    sourceY,
    sourceZ,
    sourcePosition = 'bottom',
    targetX,
    targetY,
    targetZ,
    targetPosition = 'top',
    borderRadius = 0.1,
    centerX,
    centerY,
    centerZ,
    offset = 0.1,
  }: GetSmoothStepPath3Params): { path: Path3, labelX: number, labelY: number,  labelZ: number, offsetX: number, offsetY: number, offsetZ: number } {
    const [points, labelX, labelY, labelZ, offsetX, offsetY, offsetZ] = this.calcPoints({
      source: new Vector3(sourceX, sourceY, sourceZ),
      sourcePosition,
      target: new Vector3(targetX, targetY),
      targetPosition,
      center: { x: centerX, y: centerY },
      offset,
    });

    const path = new Path3()
    points.forEach((p, i) => {

      if (i > 0 && i < points.length - 1) {
        this.calcBend(points[i - 1], p, points[i + 1], borderRadius, path);
      } else {
        if (i == 0)
          path.moveTo(p.x, p.y,p.z)
        else
          path.lineTo(p.x, p.y,p.z)
      }
    });

    return { path, labelX, labelY, labelZ, offsetX, offsetY, offsetZ };
  }

  private getBezierEdgeCenter({
    sourceX,
    sourceY,
    sourceZ,
    targetX,
    targetY,
    targetZ,
    sourceControlX,
    sourceControlY,
    sourceControlZ,
    targetControlX,
    targetControlY,
    targetControlZ,
  }: {
    sourceX: number;
    sourceY: number;
    sourceZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
    sourceControlX: number;
    sourceControlY: number;
    sourceControlZ: number;
    targetControlX: number;
    targetControlY: number;
    targetControlZ: number;
  }): [number, number, number, number, number, number] {
    // cubic bezier t=0.5 mid point, not the actual mid point, but easy to calculate
    // https://stackoverflow.com/questions/67516101/how-to-find-distance-mid-point-of-bezier-curve
    const centerX = sourceX * 0.125 + sourceControlX * 0.375 + targetControlX * 0.375 + targetX * 0.125;
    const centerY = sourceY * 0.125 + sourceControlY * 0.375 + targetControlY * 0.375 + targetY * 0.125;
    const centerZ = sourceZ * 0.125 + sourceControlZ * 0.375 + targetControlZ * 0.375 + targetZ * 0.125;
    const offsetX = Math.abs(centerX - sourceX);
    const offsetY = Math.abs(centerY - sourceY);
    const offsetZ = Math.abs(centerZ - sourceZ);

    return [centerX, centerY, centerZ, offsetX, offsetY, offsetZ];
  }

  private calculateControlOffset(distance: number, curvature: number): number {
    if (distance >= 0) {
      return 0.5 * distance;
    }

    return curvature * 2.5 * Math.sqrt(-distance);
  }

  private getControlWithCurvature({ pos, x1, y1, z1, x2, y2, z2, c }: GetControlWithCurvatureParams): [number, number, number] {
    switch (pos) {
      case 'left':
        return [x1 - this.calculateControlOffset(x1 - x2, c), y1, z1];
      case 'right':
        return [x1 + this.calculateControlOffset(x2 - x1, c), y1, z1];
      case 'top':
        return [x1, y1 + this.calculateControlOffset(y1 - y2, c), z1];
      case 'bottom':
        return [x1, y1 - this.calculateControlOffset(y2 - y1, c), z1];
      case 'front':
        return [x1, y1, z1 - this.calculateControlOffset(z1 - z2, c)];
      case 'back':
        return [x1, y1, z1 + this.calculateControlOffset(z1 - z2, c)];
      case 'center':
      default:
        return [x1, y1, z1]
    }
  }

  getBezierPath({
    sourceX,
    sourceY,
    sourceZ,
    sourcePosition = 'bottom',
    targetX,
    targetY,
    targetZ,
    targetPosition = 'top',
    curvature = 0.25,
  }: GetBezierPath3Params): { path: Path3, labelX: number, labelY: number, labelZ: number, offsetX: number, offsetY: number, offsetZ: number } {
    const [sourceControlX, sourceControlY, sourceControlZ] = this.getControlWithCurvature({
      pos: sourcePosition,
      x1: sourceX,
      y1: sourceY,
      z1: sourceZ,
      x2: targetX,
      y2: targetY,
      z2: targetZ,
      c: curvature,
    });
    const [targetControlX, targetControlY, targetControlZ] = this.getControlWithCurvature({
      pos: targetPosition,
      x1: targetX,
      y1: targetY,
      z1: sourceZ,
      x2: sourceX,
      y2: sourceY,
      z2: targetZ,
      c: curvature,
    });
    const [labelX, labelY, labelZ, offsetX, offsetY, offsetZ] = this.getBezierEdgeCenter({
      sourceX,
      sourceY,
      sourceZ,
      targetX,
      targetY,
      targetZ,
      sourceControlX,
      sourceControlY,
      sourceControlZ,
      targetControlX,
      targetControlY,
      targetControlZ,
    });

    const path = new Path3()
    path.moveTo(sourceX, sourceY, sourceZ)
    path.bezierCurveTo(sourceControlX, sourceControlY, sourceControlZ, targetControlX, targetControlY, targetControlZ, targetX, targetY, targetZ)

    return {
      path,
      labelX,
      labelY,
      labelZ,
      offsetX,
      offsetY,
      offsetZ,
    }
  }
}
