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

import {drawKeypoints, drawSkeleton, isMobile, toggleLoadingUI} from './demo_util.js';
import {getPoseAngles, drawIdealPose, drawPartialSkeleton} from "./demo_util.js";
import {idealPoses} from "./poses.js"

const videoWidth = 600;
const videoHeight = 500;

const feedbackText = document.getElementById("feedback");
const poseSelector = document.getElementById("poseSelector");
const voices = window.speechSynthesis.getVoices();

let feedback = ["", 0];

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight,
    },
  });
  video.srcObject = stream;

  return new  ((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

let feedbackVoice = new SpeechSynthesisUtterance();
let frameCount = 0;

function detectPoseInRealTime(video, net) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  const flipPoseHorizontal = true;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame(net) {
    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;
    const pose = await net.estimatePoses(video, {
      flipHorizontal: flipPoseHorizontal,
      decodingMethod: 'single-person'
    });
    poses = poses.concat(pose);
    minPoseConfidence = 0.1;
    minPartConfidence = 0.5;

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();

    let poseSelected = poseSelector.options[poseSelector.selectedIndex].index;
    drawIdealPose(poseSelected, ctx, "chartreuse");
    poses.forEach(({
      score,
      keypoints
    }) => {
      if (score >= minPoseConfidence) {
        if (frameCount % 200 === 0) {
          feedback = getFeedBack(getPoseAngles(keypoints, minPoseConfidence), poseSelected, 20);
          console.log(keypoints);
          feedbackText.state.value = feedback[0];
          feedbackVoice.text = feedback[0];
          feedbackVoice.voice = voices[0];
          window.speechSynthesis.speak(feedbackVoice);
        }

        drawKeypoints(keypoints, minPartConfidence, ctx, "gold");

        if (idealPoses[poseSelected].symmetry) {
          drawPartialSkeleton(keypoints, minPartConfidence, ctx, "gold", feedback[1]);
        } else {
          drawSkeleton(keypoints, minPartConfidence, ctx, "gold", feedback[1]);
        }
      }
    });
    frameCount++;
    if (frameCount === 75) {
      frameCount = 0;
    }

    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}

function getFeedBack(y_, poseIndex, delta) {
  const y = idealPoses[poseIndex].angles;
  if (idealPoses[poseIndex].symmetry) {
    if (y_.length < 4)
      return ["Keep your whole body in the frame", 4];
    if (y[0] - y_[0] > delta)
      return ["Straighten your arms", 0];
    else if (y[0] - y_[0] < delta * -1)
      return ["Bend your arms more", 0];
    if (y[1] - y_[1] > delta)
      return ["Move your arms higher", 1];
    else if (y[1] - y_[1] < delta * -1)
      return ["Move your arms lower", 1];
    if (y[2] - y_[2] > delta)
      return ["Move your legs up", 2];
    else if (y[2] - y_[2] < delta * -1)
      return ["Move your legs down", 2];
    if (y[3] - y_[3] > delta)
      return ["Straighten your legs", 3];
    else if (y[3] - y_[3] < delta * -1)
      return ["Bend your ;egs more", 3];
    return ["Your pose is perfect!", 4];
  } else {
    if (y_.length < 8)
      return ["Keep your whole body in the frame", 8];
    if (y[0] - y_[0] > delta)
      return ["Straighten your right arm", 0];
    else if (y[0] - y_[0] < delta * -1)
      return ["Bend your right arm more", 0];
    if (y[1] - y_[1] > delta)
      return ["Straighten your left arm", 1];
    else if (y[1] - y_[1] < delta * -1)
      return ["Bend your left arm more", 1];
    if (y[2] - y_[2] > delta)
      return ["Move your right arm up", 2];
    else if (y[2] - y_[2] < delta * -1)
      return ["Move your right arm down", 2];
    if (y[3] - y_[3] > delta)
      return ["Move your left arm up", 3];
    else if (y[3] - y_[3] < delta * -1)
      return ["Move your left arm down", 3];
    if (y[4] - y_[4] > delta)
      return ["Spread your right leg more", 4];
    else if (y[4] - y_[4] < delta * -1)
      return ["Spread your right leg less", 4];
    if (y[5] - y_[5] > delta)
      return ["Spread your left leg more", 5];
    else if (y[5] - y_[5] < delta * -1)
      return ["Spread your left leg less", 5];
    if (y[6] - y_[6] > delta)
      return ["Straighten your right leg", 6];
    else if (y[6] - y_[6] < delta * -1)
      return ["Bend your right knee more", 6];
    if (y[7] - y_[7] > delta)
      return ["Straighten your left knee", 7];
    else if (y[7] - y_[7] < delta * -1)
      return ["Bend your left knee more", 7];
    return ["Your pose is perfect!", 8];
  }
}

export async function bindPage() {
  const net = await posenet.load({
    architecture: 'ResNet50',
    outputStride: 32,
    inputResolution: 250,
    multiplier: 1.0,
    quantBytes: 2
  });

  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture, or this device does not have a camera';
    info.style.display = 'block';
    throw e;
  }

  detectPoseInRealTime(video, net);
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
