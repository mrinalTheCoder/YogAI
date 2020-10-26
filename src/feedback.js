import {idealPoses} from "./poses.js";

const symSentences = [
  ["Straighten your arms", "Bend your arms more"],
  ["Move your arms higher", "Move your arms lower"],
  ["Move your legs up", "Move your legs down"],
  ["Straighten your legs", "Bend your legs more"]
];

const sentences = [
  ["Straighten your right arm", "Bend your right arm more"],
  ["Straighten your left arm", "Bend your left arm more"],
  ["Move your right arm up", "Move your right arm down"],
  ["Move your left arm up", "Move your left arm down"],
  ["Spread your right leg more", "Spread your right leg less"],
  ["Spread your left leg more", "Spread your left leg less"],
  ["Straighten your right leg", "Bend your right knee more"],
  ["Straighten your left leg", "Bend your left knee more"]
];

export function getFeedBack(y_, poseIndex, delta) {
  if (y_.length<4 && idealPoses[poseIndex].symmetry)
    return ["Keep your whole body in the frame", 4];
  else if (y_.length<8 && !(idealPoses[poseIndex].symmetry))
    return ["Keep your whole body in the frame", 8];

  const y = idealPoses[poseIndex].angles;
  let deltaMap = new Map();
  let isPositive = [];
  for (var i=0; i<y.length; i++) {
    deltaMap.set(i, Math.abs(y[i] - y_[i]));
    isPositive.push(y[i] - y_[i] > 0);
  }
  const keyValPair = [...deltaMap.entries()].reduce((a, e) => e[1] > a[1] ? e : a);

  if (idealPoses[poseIndex].symmetry) {
    if (keyValPair[1] > delta) {
      return isPositive[keyValPair[0]] ? [symSentences[keyValPair[0]][0], keyValPair[0]] : [symSentences[keyValPair[0]][1], keyValPair[0]];
    }
    return ["Your pose is perfect!", 4];
  } else {
    if (keyValPair[1] > delta) {
      return isPositive[keyValPair[0]] ? [sentences[keyValPair[0]][0], keyValPair[0]] : [sentences[keyValPair[0]][1], keyValPair[0]];
    }
    return ["Your pose is perfect!", 8];
  }
}
