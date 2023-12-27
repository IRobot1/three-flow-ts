import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Vector3 } from "three";

//
// TypeScript version of https://github.com/hofk/THREEg.js/blob/master/THREEg.js#L3878
//

export interface TrackGeometryParameters {
  curvePoints: Array<number>,
  lengthSegments: number,
  trackDistances: Array<number>,
}
export class TrackGeometry extends BufferGeometry {

  constructor(parameters: TrackGeometryParameters) {
    super()

    // all parameters optional

    const sd = parameters.trackDistances !== undefined ? [[], parameters.trackDistances, [], []] : [[], [-0.5, 0.5], [], []];

    const wss = [0, sd[1].length, 0, 0];
    const ws = [0, sd[1].length - 1, 0, 0];

    const sides = [false, true, false, false];

    const ls = parameters.lengthSegments !== undefined ? parameters.lengthSegments : 500;
    const lss = ls + 1;

    let pts: Array<Vector3>
    if (parameters.curvePoints) {
      pts = []
      const cP = parameters.curvePoints
      for (var i = 0; i < cP.length; i += 3) {

        pts.push(new Vector3(cP[i], cP[i + 1], cP[i + 2]));
      }
    }
    else
      pts = [new Vector3(-10, 0, 5), new Vector3(0, 1, 0), new Vector3(10, 0, 5)];


    const curve = new CatmullRomCurve3(pts);

    const points = curve.getPoints(ls);
    const len = curve.getLength();
    const lenList = curve.getLengths(ls);

    const isWall = false;

    const faceCount = ls * (ws[0] + ws[1] + ws[2] + ws[3]) * 2;
    const vertexCount = lss * (wss[0] + wss[1] + wss[2] + wss[3]);

    const faceIndices = new Uint32Array(faceCount * 3);
    const vertices = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);

    this.setIndex(new BufferAttribute(faceIndices, 1));
    this.setAttribute('position', new BufferAttribute(vertices, 3));
    this.setAttribute('uv', new BufferAttribute(uvs, 2));

    var a, b1, c1, c2;
    var posIdxCount = 0;
    var offset = 0;
    var mmOffs = 0;

    for (var s = 0; s < 4; s++) {

      if (sides[s]) {

        for (var j = 0; j < ls; j++) {

          for (var i = 0; i < ws[s]; i++) {

            // 2 faces / segment,  3 vertex indices
            a = offset + wss[s] * j + i;
            b1 = offset + wss[s] * (j + 1) + i;		// right-bottom
            c1 = offset + wss[s] * (j + 1) + 1 + i;
            // b2 = c1							// left-top
            c2 = offset + wss[s] * j + 1 + i;

            faceIndices[posIdxCount] = a; // right-bottom
            faceIndices[posIdxCount + 1] = b1;
            faceIndices[posIdxCount + 2] = c1;

            faceIndices[posIdxCount + 3] = a; // left-top
            faceIndices[posIdxCount + 4] = c1; // = b2,
            faceIndices[posIdxCount + 5] = c2;

            this.addGroup(posIdxCount, 6, mmOffs + i); // write groups for multi material

            posIdxCount += 6;

          }

        }

        offset += lss * wss[s];
        mmOffs += ws[s];

      }

    }

    var uvIdxCount = 0;

    for (var s = 0; s < 4; s++) {

      if (sides[s]) {

        for (var j = 0; j < lss; j++) {

          for (var i = 0; i < wss[s]; i++) {

            uvs[uvIdxCount] = lenList[j] / len;
            uvs[uvIdxCount + 1] = i / ws[s];

            uvIdxCount += 2;

          }

        }

      }

    }

    var tangent;
    var normal = new Vector3(0, 0, 0);
    var binormal = new Vector3(0, 1, 0);

    const t = []; // tangents
    const n = []; // normals
    const b = []; // binormals

    let x: number, y: number, z: number
    let hd2: number, wd2: number
    let hd = 0, wd = 0
    let vIdx = 0; // vertex index
    let posIdx;   // position index	

    for (var j = 0; j < lss; j++) {  // length

      tangent = curve.getTangent(j / ls); //  .. / length segments
      t.push(tangent.clone());

      normal.crossVectors(tangent, binormal);

      normal.y = 0;

      normal.normalize();
      n.push(normal.clone());

      binormal.crossVectors(normal, tangent); // new binormal
      b.push(binormal.clone());

    }

    // set vertex position
    const xyzSet = () => {

      posIdx = vIdx * 3;

      vertices[posIdx] = x;
      vertices[posIdx + 1] = y;
      vertices[posIdx + 2] = z;

    }

    for (var s = 0; s < 4; s++) {

      if (sides[s]) {

        if (s === 1 || s === 3) {   //  1 top (road), 2 bottom

          if (isWall) {

            hd2 = (s === 1 ? 1 : -1) * hd / 2;

          } else {

            hd2 = 0;

          }

          for (var j = 0; j < lss; j++) {  // length

            for (var i = 0; i < wss[s]; i++) { // width

              x = points[j].x + sd[s][i] * n[j].x;
              y = points[j].y + hd2;
              z = points[j].z + sd[s][i] * n[j].z;

              xyzSet();

              vIdx++;

            }

          }

        }

        if (s === 0 || s === 2) { // wall side 0 left,  2 right 

          wd2 = (s === 0 ? -1 : 1) * wd / 2;

          for (var j = 0; j < lss; j++) {  // length

            for (var i = 0; i < wss[s]; i++) { // width	=> height

              x = points[j].x + wd2 * n[j].x;
              y = points[j].y + sd[s][i];
              z = points[j].z + wd2 * n[j].z;

              xyzSet();

              vIdx++;

            }

          }

        }

      }

    }

  }
}

