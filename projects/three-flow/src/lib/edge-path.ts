import { Path, Vector3 } from "three";
import { AnchorType } from "./model";

export type GetStraightPathParams = {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
};

export interface GetSmoothStepPathParams {
  sourceX: number;
  sourceY: number;
  sourcePosition?: AnchorType;
  targetX: number;
  targetY: number;
  targetPosition?: AnchorType;
  borderRadius?: number;
  centerX?: number;
  centerY?: number;
  offset?: number;
}


export type GetBezierPathParams = {
  sourceX: number;
  sourceY: number;
  sourcePosition?: AnchorType;
  targetX: number;
  targetY: number;
  targetPosition?: AnchorType;
  curvature?: number;
};

type GetControlWithCurvatureParams = {
  pos: AnchorType;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: number;
};

export class FlowEdgePath {

  getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  }: GetStraightPathParams): { path: Path, labelX: number, labelY: number, offsetX: number, offsetY: number } {
    const [labelX, labelY, offsetX, offsetY] = this.getEdgeCenter({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });

    const path = new Path()
    path.moveTo(sourceX, sourceY)
    path.lineTo(targetX, targetY)
    return { path, labelX, labelY, offsetX, offsetY };
  }


  private getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  }: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  }): [number, number, number, number] {
    const xOffset = Math.abs(targetX - sourceX) / 2;
    const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

    const yOffset = Math.abs(targetY - sourceY) / 2;
    const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

    return [centerX, centerY, xOffset, yOffset];
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
  }): [Vector3[], number, number, number, number] {
    const handleDirections = {
      'left': { x: -1, y: 0 },
      'right': { x: 1, y: 0 },
      'top': { x: 0, y: -1 },
      'bottom': { x: 0, y: 1 },
      'center': { x: 0, y: 0 },
    };

    const sourceDir = handleDirections[sourcePosition];
    const targetDir = handleDirections[targetPosition];
    const sourceGapped = new Vector3(source.x + sourceDir.x * offset, source.y + sourceDir.y * offset);
    const targetGapped = new Vector3(target.x + targetDir.x * offset, target.y + targetDir.y * offset);

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
        return source.x < target.x ? new Vector3(1, 0) : new Vector3(-1, 0);
      }
      return source.y < target.y ? new Vector3(0, 1) : new Vector3(0, -1);
    };


    const dir = getDirection({
      source: sourceGapped,
      sourcePosition,
      target: targetGapped,
    });
    const dirAccessor = dir.x !== 0 ? 'x' : 'y';
    const currDir = dir[dirAccessor];

    let points: Vector3[] = [];
    let centerX, centerY;
    const sourceGapOffset = { x: 0, y: 0 };
    const targetGapOffset = { x: 0, y: 0 };

    const [defaultCenterX, defaultCenterY, defaultOffsetX, defaultOffsetY] = this.getEdgeCenter({
      sourceX: source.x,
      sourceY: source.y,
      targetX: target.x,
      targetY: target.y,
    });

    // opposite handle positions, default case
    if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
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

      if (sourceDir[dirAccessor] === currDir) {
        points = dirAccessor === 'x' ? verticalSplit : horizontalSplit;
      } else {
        points = dirAccessor === 'x' ? horizontalSplit : verticalSplit;
      }
    } else {
      // sourceTarget means we take x from source and y from target, targetSource is the opposite
      const sourceTarget: Vector3[] = [new Vector3(sourceGapped.x, targetGapped.y)];
      const targetSource: Vector3[] = [new Vector3(targetGapped.x, sourceGapped.y)];
      // this handles edges with same handle positions
      if (dirAccessor === 'x') {
        points = sourceDir.x === currDir ? targetSource : sourceTarget;
      } else {
        points = sourceDir.y === currDir ? sourceTarget : targetSource;
      }

      if (sourcePosition === targetPosition) {
        const diff = Math.abs(source[dirAccessor] - target[dirAccessor]);

        // if an edge goes from right to right for example (sourcePosition === targetPosition) and the distance between source.x and target.x is less than the offset, the added point and the gapped source/target will overlap. This leads to a weird edge path. To avoid this we add a gapOffset to the source/target
        if (diff <= offset) {
          const gapOffset = Math.min(offset - 1, offset - diff);
          if (sourceDir[dirAccessor] === currDir) {
            sourceGapOffset[dirAccessor] = (sourceGapped[dirAccessor] > source[dirAccessor] ? -1 : 1) * gapOffset;
          } else {
            targetGapOffset[dirAccessor] = (targetGapped[dirAccessor] > target[dirAccessor] ? -1 : 1) * gapOffset;
          }
        }
      }

      // these are conditions for handling mixed handle positions like Right -> Bottom for example
      if (sourcePosition !== targetPosition) {
        const dirAccessorOpposite = dirAccessor === 'x' ? 'y' : 'x';
        const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessorOpposite];
        const sourceGtTargetOppo = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
        const sourceLtTargetOppo = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
        const flipSourceTarget =
          (sourceDir[dirAccessor] === 1 && ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
          (sourceDir[dirAccessor] !== 1 && ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

        if (flipSourceTarget) {
          points = dirAccessor === 'x' ? sourceTarget : targetSource;
        }
      }

      const sourceGapPoint = { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y };
      const targetGapPoint = { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y };
      const maxXDistance = Math.max(Math.abs(sourceGapPoint.x - points[0].x), Math.abs(targetGapPoint.x - points[0].x));
      const maxYDistance = Math.max(Math.abs(sourceGapPoint.y - points[0].y), Math.abs(targetGapPoint.y - points[0].y));

      // we want to place the label on the longest segment of the edge
      if (maxXDistance >= maxYDistance) {
        centerX = (sourceGapPoint.x + targetGapPoint.x) / 2;
        centerY = points[0].y;
      } else {
        centerX = points[0].x;
        centerY = (sourceGapPoint.y + targetGapPoint.y) / 2;
      }
    }

    const pathPoints = [
      source,
      new Vector3(sourceGapped.x + sourceGapOffset.x, sourceGapped.y + sourceGapOffset.y),
      ...points,
      new Vector3(targetGapped.x + targetGapOffset.x, targetGapped.y + targetGapOffset.y),
      target,
    ];

    return [pathPoints, centerX, centerY, defaultOffsetX, defaultOffsetY];
  }

  private calcBend(a: Vector3, b: Vector3, c: Vector3, size: number): string {
    const distance = (a: Vector3, b: Vector3) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

    const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size);
    const { x, y } = b;

    // no bend
    if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) {
      return `L${x} ${y}`;
    }

    // first segment is horizontal
    if (a.y === y) {
      const xDir = a.x < c.x ? -1 : 1;
      const yDir = a.y < c.y ? 1 : -1;
      return `L ${x + bendSize * xDir},${y}Q ${x},${y} ${x},${y + bendSize * yDir}`;
    }

    const xDir = a.x < c.x ? 1 : -1;
    const yDir = a.y < c.y ? -1 : 1;
    return `L ${x},${y + bendSize * yDir}Q ${x},${y} ${x + bendSize * xDir},${y}`;
  }



  getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition = 'bottom',
    targetX,
    targetY,
    targetPosition = 'top',
    borderRadius = 5,
    centerX,
    centerY,
    offset = 20,
  }: GetSmoothStepPathParams): [path: string, labelX: number, labelY: number, offsetX: number, offsetY: number] {
    const [points, labelX, labelY, offsetX, offsetY] = this.calcPoints({
      source: new Vector3(sourceX, sourceY),
      sourcePosition,
      target: new Vector3(targetX, targetY),
      targetPosition,
      center: { x: centerX, y: centerY },
      offset,
    });

    const path = points.reduce<string>((res, p, i) => {
      let segment = '';

      if (i > 0 && i < points.length - 1) {
        segment = this.calcBend(points[i - 1], p, points[i + 1], borderRadius);
      } else {
        segment = `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`;
      }

      res += segment;

      return res;
    }, '');

    return [path, labelX, labelY, offsetX, offsetY];
  }

  private getBezierEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourceControlX,
    sourceControlY,
    targetControlX,
    targetControlY,
  }: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourceControlX: number;
    sourceControlY: number;
    targetControlX: number;
    targetControlY: number;
  }): [number, number, number, number] {
    // cubic bezier t=0.5 mid point, not the actual mid point, but easy to calculate
    // https://stackoverflow.com/questions/67516101/how-to-find-distance-mid-point-of-bezier-curve
    const centerX = sourceX * 0.125 + sourceControlX * 0.375 + targetControlX * 0.375 + targetX * 0.125;
    const centerY = sourceY * 0.125 + sourceControlY * 0.375 + targetControlY * 0.375 + targetY * 0.125;
    const offsetX = Math.abs(centerX - sourceX);
    const offsetY = Math.abs(centerY - sourceY);

    return [centerX, centerY, offsetX, offsetY];
  }

  private calculateControlOffset(distance: number, curvature: number): number {
    if (distance >= 0) {
      return 0.5 * distance;
    }

    return curvature * 25 * Math.sqrt(-distance);
  }

  private getControlWithCurvature({ pos, x1, y1, x2, y2, c }: GetControlWithCurvatureParams): [number, number] {
    switch (pos) {
      case 'left':
        return [x1 - this.calculateControlOffset(x1 - x2, c), y1];
      case 'right':
        return [x1 + this.calculateControlOffset(x2 - x1, c), y1];
      case 'top':
        return [x1, y1 - this.calculateControlOffset(y1 - y2, c)];
      case 'bottom':
        return [x1, y1 + this.calculateControlOffset(y2 - y1, c)];
      case 'center':
      default:
        return [x1, y1]
    }
  }

  getBezierPath({
    sourceX,
    sourceY,
    sourcePosition = 'bottom',
    targetX,
    targetY,
    targetPosition = 'top',
    curvature = 0.25,
  }: GetBezierPathParams): [path: string, labelX: number, labelY: number, offsetX: number, offsetY: number] {
    const [sourceControlX, sourceControlY] = this.getControlWithCurvature({
      pos: sourcePosition,
      x1: sourceX,
      y1: sourceY,
      x2: targetX,
      y2: targetY,
      c: curvature,
    });
    const [targetControlX, targetControlY] = this.getControlWithCurvature({
      pos: targetPosition,
      x1: targetX,
      y1: targetY,
      x2: sourceX,
      y2: sourceY,
      c: curvature,
    });
    const [labelX, labelY, offsetX, offsetY] = this.getBezierEdgeCenter({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourceControlX,
      sourceControlY,
      targetControlX,
      targetControlY,
    });

    return [
      `M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`,
      labelX,
      labelY,
      offsetX,
      offsetY,
    ];
  }
}
