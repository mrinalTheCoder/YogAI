/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as posenet from 'posenet';
import {idealPoses} from "./poses.js";

const lineWidth = 2;

const angleJoints = [
  'rightElbow', 'leftElbow', 'rightShoulder', 'leftShoulder', 'rightHip',
  'leftHip', 'rightKnee', 'leftKnee'
];

export const tryResNetButtonName = 'tryResNetButton';
export const tryResNetButtonText = '[New] Try ResNet50';

function toTuple({y,x}) {
  return [y, x];
}

export function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function drawSkeleton(keypoints, minConfidence, ctx, color, badJoint, scale = 1) {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);

  adjacentKeyPoints.forEach((keypoints) => {
    if (badJoint === 8) {
      drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), color, scale, ctx);
    } else {
      if (keypoints[0].part === angleJoints[badJoint] || keypoints[1].part === angleJoints[badJoint]) {
        drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), "red", scale, ctx);
      } else {
        drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), color, scale, ctx);
      }
    }
  });
}

export function drawPartialSkeleton(keypoints, minConfidence, ctx, color, badJoint, scale = 1) {
  const symKeypoints = posenet.getSymKeypoints(keypoints, minConfidence);

  symKeypoints.forEach((keypoints) => {
    if (badJoint === 4) {
      drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), color, scale, ctx);
    } else {
      if (keypoints[0].part === angleJoints[badJoint] || keypoints[1].part === angleJoints[badJoint]) {
        drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), "red", scale, ctx);
      } else {
        drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), color, scale, ctx);
      }
    }
  });
}

export function drawIdealPose(poseIndex, ctx, color, scale = 1.25) {
  const keypoints = idealPoses[poseIndex].values;
  let keypointPairs = null;
  if (idealPoses[poseIndex].symmetry) {
    keypointPairs = posenet.getSymKeypoints(keypoints, 0);
  } else {
    keypointPairs = posenet.getAdjacentKeyPoints(keypoints, 0);
  }

  keypointPairs.forEach((keypoints) => {
    drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), color, scale, ctx);
  });
}

function getDistance(pointA, pointB) {
  return ((pointA[0] - pointB[0]) ** 2 + (pointA[1] - pointB[1]) ** 2) ** (1 / 2);
}

function getAngle(points) {
  const a = getDistance(points[1], points[2]);
  const b = getDistance(points[2], points[0]);
  const c = getDistance(points[0], points[1]);
  let angle = Math.acos((a ** 2 + c ** 2 - b ** 2) / (2 * a * c));
  return angle * 180 / Math.PI;
}

export function getPoseAngles(keypoints, minConfidence) {
  const angleTriples = posenet.getAngleKeyPoints(keypoints, minConfidence);
  let pointVals = [];
  angleTriples.forEach(elem => {
    pointVals.push([
      [elem[0].position.x, elem[0].position.y],
      [elem[1].position.x, elem[1].position.y],
      [elem[2].position.x, elem[2].position.y]
    ]);
  });
  let angles = [];
  pointVals.forEach(points => angles.push(getAngle(points)));
  return angles;
}

export function drawKeypoints(keypoints, minConfidence, ctx, color, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score >= minConfidence) {
      const {y, x} = keypoint.position;
      drawPoint(ctx, y * scale, x * scale, 3, color);
    }
  }
}

export async function renderToCanvas(a, ctx) {
  const [height, width] = a.shape;
  const imageData = new ImageData(width, height);

  const data = await a.data();

  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    const k = i * 3;

    imageData.data[j + 0] = data[k + 0];
    imageData.data[j + 1] = data[k + 1];
    imageData.data[j + 2] = data[k + 2];
    imageData.data[j + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

export function renderImageToCanvas(image, size, canvas) {
  canvas.width = size[0];
  canvas.height = size[1];
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);
}
