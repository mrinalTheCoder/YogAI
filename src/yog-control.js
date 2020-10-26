import React from 'react';
import * as posenet from 'posenet';

import {drawKeypoints, drawSkeleton} from './demo_util.js';
import {getPoseAngles, drawIdealPose, drawPartialSkeleton} from "./demo_util.js";
import {idealPoses} from "./poses.js";
import {getFeedBack} from "./feedback.js";

const videoWidth = 750;
const videoHeight = 625;
const idealPoseColor = "chartreuse";
const poseColor = "gold";

let frameCount = 0;
const minPoseConfidence = 0.1;
const minPartConfidence = 0.5;

let feedback = ["", 0];
let feedbackVoice = new SpeechSynthesisUtterance();
const voices = window.speechSynthesis.getVoices();

class PoseForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.passPoseUp(event.target.value);
  }

  render() {
    return (
      <div className="select">
        <select name="slct" id="slct" style={{ width: "200px" }} onChange={this.handleChange}>
          <option value={0}>Virabhadrasana</option>
          <option value={1}>Vrikshasan</option>
          <option value={2}>Tadasan</option>
          <option value={3}>Natrajasana</option>
          <option value={4}>Vasisthasana</option>
          <option value={5}>Ustrasana</option>
          <option value={6}>Bhujangasana</option>
        </select>
      </div>
    );
  }
}

function Feedback(props) {
  return (
    <p
      className="feedback">
      {props.value}
    </p>
  );
}

class MainVideo extends React.Component {
  constructor(props) {
    super(props);
    this.handleVideoLoaded = this.handleVideoLoaded.bind(this);
  }
  handleVideoLoaded(video) {
    this.props.passVideoUp(video);
  }
  componentDidMount() {
    let constraints = { audio: false, video: { width: videoWidth, height: videoHeight } };
    let video;
    navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
      video = document.querySelector("video");
      video.height = videoHeight;
      video.width = videoWidth;

      video.srcObject = mediaStream;
      video.onloadedmetadata = (e) => {
        video.play();
        this.handleVideoLoaded(video);
      };
    });
  }

  render() {
    return (
      <video autoPlay={true} id="videoElement" style={{display:'none'}} playsInline></video>
    );
  }
}

class MainCanvas extends React.Component {
  componentDidMount() {
    const canvas = document.querySelector("canvas");
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    this.props.passCanvasUp(canvas);
  }

  render() {
    return (
        <canvas id="canvas"></canvas>
    );
  }
}

export class YogControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {feedback:"", poseSelected:0};
    this.video = null;
    this.canvas = null;
    this.getVideo = this.getVideo.bind(this);
    this.getCanvas = this.getCanvas.bind(this);
    this.getPoseSelected = this.getPoseSelected.bind(this);
    this.detectPoseInRealTime = this.detectPoseInRealTime.bind(this);
    this.startDetection = this.startDetection.bind(this);
  }

  getVideo(inpVideo) {
    this.video = inpVideo;
  }
  getCanvas(inpCanvas) {
    this.canvas = inpCanvas;
  }
  getPoseSelected(inpPose) {
    this.setState({poseSelected:inpPose});
  }

  async startDetection(e) {
    document.querySelector("button").remove();
    const net = await posenet.load({
      architecture: 'ResNet50',
      outputStride: 32,
      inputResolution: 250,
      multiplier: 1.0,
      quantBytes: 2
    });
    this.detectPoseInRealTime(this.video, net, this.canvas.getContext('2d'));
  }

  async detectPoseInRealTime(video, net, ctx) {
    let pose = await net.estimateSinglePose(video, {
      flipHorizontal: true,
      decodingMethod: 'single-person'
    });

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();

    drawIdealPose(this.state.poseSelected, ctx, idealPoseColor);

    if (pose.score >= minPoseConfidence) {
      if (frameCount % 200 === 0) {
        feedback = getFeedBack(
          getPoseAngles(pose.keypoints, minPoseConfidence),
          this.state.poseSelected,
          20
        );
        this.setState({ feedback:feedback[0] });
        feedbackVoice.text = feedback[0];
        feedbackVoice.voice = voices[0];
        window.speechSynthesis.speak(feedbackVoice);
      }

      drawKeypoints(pose.keypoints, minPartConfidence, ctx, poseColor);
      if (idealPoses[this.state.poseSelected].symmetry) {
        drawPartialSkeleton(pose.keypoints, minPartConfidence, ctx, poseColor, feedback[1]);
      } else {
        drawSkeleton(pose.keypoints, minPartConfidence, ctx, poseColor, feedback[1]);
      }
    }
    frameCount++;
    if (frameCount === 75) {
      frameCount = 0;
    }

    this.detectPoseInRealTime(video, net, ctx);
  }

  render() {
    return (
      <div>
        <MainVideo passVideoUp={this.getVideo} />
        <MainCanvas passCanvasUp={this.getCanvas} />
        <button className="btn striped-shadow dark" onClick={this.startDetection}><span>Start Posenet</span></button>
        <h1>Select Pose:</h1>
        <PoseForm passPoseUp={this.getPoseSelected}/>
        <Feedback value={this.state.feedback}/>
      </div>);
  }
}
