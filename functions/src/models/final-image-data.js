const {Rule} = require("../rule-engine/rule-utils")

class FinalImageData {
  /**
   * @type{string}
   */
  imageKey

  /**
   * @type{LabelObject}
   */
  labelObject

  /**
   * @type{Text}
   */
  text

  /**
   * @type{Rule}
   */
  imageRules

  /**
   * @type{Metadata}
   */
  metadata

  /**
   * @type {Histogram}
   */
  histogram

  /**
   * @type{BodyDetection}
   */
  bodyDetection

  constructor(imageData) {
    this.imageKey = imageData.image_key;
    if (imageData.hasOwnProperty("object")) {
      this.labelObject = new LabelObject(imageData.object.label);
    }
    if (imageData.hasOwnProperty("text")) {
      this.text = new Text(imageData.text.TextDetections);
    }
    this.imageRules = imageData.image_rules;
    this.metadata = new Metadata(imageData.metadata);
    this.histogram = new Histogram(imageData.histogram);
    if (imageData.body_detection != null) {
      this.bodyDetection = new BodyDetection(imageData.body_detection);
    }
  }

  /**
   *
   * @returns {LabelObject}
   */
  getLabel() {
    return this.labelObject;
  }

  /**
   *
   * @returns {BodyDetection}
   */
  getBodyDetection() {
    return this.bodyDetection;
  }

  /**
   *
   * @returns {JSON}
   */
  getText() {
    return this.text;
  }

  /**
   *
   * @returns {Rule}
   */
  getImageRules() {
    return this.imageRules;
  }

  /**
   *
   * @returns {string}
   */
  getImageKey() {
    return this.imageKey;
  }

  /**
   *
   * @returns {Metadata}
   */
  getMetadata() {
    return this.metadata;
  }
}

class ModerationLabelsObject {

  /**
   * @type{ModerationLabels[]}
   */
  ModerationLabels = []

  constructor(moderationLabelsObject) {
    moderationLabelsObject.forEach(Label => {
      this.ModerationLabels.push(new ModerationLabels(Label));
    })
  }

  /**
   *
   * @returns {ModerationLabels[]}
   */
  getModerationLabelsObject() {
    return this.ModerationLabels;
  }
}

class ModerationLabels {

  /**
   * @type{number}
   */
  Confidence
  /**
   * @type{string}
   */
  Name
  /**
   * @type{string}
   */
  ParentName

  constructor(moderationLabels) {
    this.Confidence = moderationLabels.Confidence;
    this.Name = moderationLabels.Name;
    this.ParentName = moderationLabels.ParentName;
  }

  /**
   *
   * @returns {number}
   */
  getConfidence() {
    return this.Confidence;
  }

  /**
   *
   * @returns {string}
   */
  getName() {
    return this.Name;
  }

  /**
   *
   * @returns {string}
   */
  getParentName() {
    return this.ParentName;
  }

}


class BodyDetection {

  /**
   * @type{string}
   */
  image_name

  /**
   * @type{boolean}
   */
  face_visible

  /**
   * @type{boolean}
   */
  back_visible

  /**
   * @type{number}
   */
  shoulder_angle

  /**
   * @type{string}
   */
  pose

  /**
   * @type{Map<string,string>}
   */
  landmarks

  /**
   *
   * @param {S3.GetObjectOutput}jsonObject
   */
  constructor(jsonObject) {
    this.image_name = jsonObject.image_name;
    this.face_visible = jsonObject.face_visible;
    this.back_visible = jsonObject.back_visible;
    this.shoulder_angle = jsonObject.shoulder_angle;
    this.pose = jsonObject.pose;
    this.landmarks = jsonObject.landmarks;
  }

  /**
   *
   * @returns {boolean}
   */
  getBack_visible() {
    return this.back_visible;
  }


  /**
   *
   * @returns {Map<string, string>|null}
   */
  getLandmarks() {
    if (Object.entries(this.landmarks).length !== 0) {
      return this.landmarks;
    } else {
      return null;
    }
  }

  /**
   *
   * @param key
   * @returns {string|null}
   */
  getLandmarkByKey(key) {

    let landmark = this.getLandmarks();
    let LandmarkByKey = landmark != null ? landmark[key] : null
    return LandmarkByKey

  }

  /**
   *
   * @param {string}key
   * @param {number} confidence
   * @returns {string|null}
   */
  getLandmarkByKeyAndConfidence(key, confidence) {

    let landmarks = this.getLandmarks();
    let landmarkByKey = landmarks != null ? landmarks[key] : null
    if(landmarkByKey != null && ((landmarkByKey["confidence"] * 100) > confidence) ) {
      return landmarkByKey;
    } else {
      return null;
    }
  }

  /**
   *
   * @param {string}key
   * @param {string}coordinate
   * @param {number} confidenceLevel
   */
  getLandmarkCoordinatesIfConfidence(key, coordinate, confidenceLevel) {
    let landmarkValues = this.getLandmarkByKeyAndConfidence(key, confidenceLevel);
    let coordinates = landmarkValues != null ? landmarkValues[coordinate] : null
    return coordinates
  }

  /**
   *
   * @param {string} key
   * @param {number} confidenceLevel
   * @returns {boolean} result
   */
  isBodyPartPresent(key, confidenceLevel) {
    let result = true;
    let bodyPartXAxis = this.getLandmarkCoordinatesIfConfidence(key, "x", confidenceLevel);
    let bodyPartYAxis = this.getLandmarkCoordinatesIfConfidence(key, "y", confidenceLevel);

    if (bodyPartXAxis != null && bodyPartYAxis != null) {
      result = (0 < bodyPartXAxis && bodyPartXAxis < 1) && (0 < bodyPartYAxis && bodyPartYAxis < 1);
    } else if (key === "left_foot_index" || key == "right_foot_index" || key === "left_index" || key == "right_index") {
      result = false;
    }
    return result;
  }

  /**
   *
   * @param value
   */
  setLandmarks(value) {
    this.landmarks = value;
  }
}

class LabelObject {

  /**
   * @type{Label[]}
   */
  label = []


  constructor(labelObject) {
    labelObject.forEach(label => {
      this.label.push(new Label(label));
    });
  }

  /**
   *
   * @returns {Label[]}
   */
  getLabelObject() {
    return this.label;
  }

  /**
   * 
   * @param name{string}
   * @returns {boolean}
   */
  isLabelPresent(name) {
    let present = false;
    this.label.forEach(label => {
      present = (label.getLabelName() === name) ? !present : present;
    })
    return present;
  }

}

class Label {

  /**
   * @type{string}
   */
  Name

  /**
   * @type{number}
   */
  Confidence

  /**
   * @type{Instances[]}
   */
  Instances = []


  constructor(label) {
    this.Name = label.Name;
    this.Confidence = label.Confidence;
    if (label.Instances.length !== 0) {
      label.Instances.forEach(instance => {
        this.Instances.push(new Instances(instance));
      });
    }
  }

  /**
   *
   * @returns {string}
   */
  getLabelName() {
    return this.Name;
  }

  /**
   *
   * @returns {number}
   */
  getConfidence() {
    return this.Confidence;
  }

  /**
   *
   * @returns {Instances[]}
   */
  getInstance() {
    return this.Instances
  }

  /**
   *
   * @returns {number}
   */
  getInstanceLength() {
    return this.getInstance().length
  }

  /**
   *
   * @param index
   * @returns {Instances}
   */
  getInstanceAtIndex(index) {
    return this.Instances.at(index);
  }
}

class Instances {

  /**
   * @type{number}
   */
  Confidence

  /**
   *  @type{Bounding}
   */
  BoundingBox

  constructor(instance) {
    this.Confidence = instance.Confidence;
    this.BoundingBox = new Bounding(instance.BoundingBox);
  }

  /**
   *
   * @returns {number}
   */
  getInstanceConfidence() {
    return this.Confidence;
  }

  /**
   *
   * @returns {Bounding}
   */
  getBounding() {
    return this.BoundingBox;
  }

}

class Bounding {

  /**
   * @type{number}
   */
  Width

  /**
   * @type{number}
   */
  Height

  /**
   * @type{number}
   */
  Left

  /**
   * @type{number}
   */
  Top

  constructor(bounding) {
    this.Width = bounding.Width;
    this.Height = bounding.Height;
    this.Left = bounding.Left;
    this.Top = bounding.Top;
  }

  /**
   *
   * @returns {number}
   */
  getWidth() {
    return this.Width;
  }

  /**
   *
   * @returns {number}
   */
  getHeight() {
    return this.Height;
  }

  /**
   *
   * @returns {number}
   */
  getLeft() {
    return this.Left;
  }

  /**
   *
   * @returns {number}
   */
  getTop() {
    return this.Top;
  }
}

class Metadata {
  /**
   * @type{string}
   */
  format

  /**
   * @type{number}
   */
  width

  /**
   * @type{number}
   */
  height

  /**
   * @type{string}
   */
  space

  /**
   *@type{number}
   */
  dpi

  /**
   *@type{number}
   */
  aspect_ratio

  constructor(metaData) {
    this.format = metaData.format;
    this.width = metaData.width;
    this.height = metaData.height;
    this.space = metaData.space;
    this.dpi = metaData.dpi
    this.aspect_ratio = metaData.aspect_ratio;
  }

  /**
   *
   * @returns {string}
   */
  getFormat() {
    return this.format;
  }

  /**
   *
   * @returns {number}
   */
  getWidth() {
    return this.width;
  }

  /**
   *
   * @returns {number}
   */
  getHeight() {
    return this.height;
  }

  /**
   *
   * @returns {string}
   */
  getSpace() {
    return this.space
  }

  /**
   *
   * @returns {number}
   */
  getDpi() {
    return this.dpi;
  }

  /**
   *
   * @returns {number}
   */
  getAspectRatio() {
    return this.aspect_ratio;
  }

}

class Histogram {
  /**
   * @type{Boolean}
   */
  is_white_background

  constructor(histogramObject) {
    this.is_white_background = histogramObject.is_white_background;
  }
}

class Text {

  /**
   * @type{TextDetection[]}
   */
  TextDetections = []


  constructor(textDetections) {
    textDetections.forEach(Detections => {
      this.TextDetections.push(new TextDetection(Detections));
    });
  }

  /**
   *
   * @returns {TextDetection[]}
   */
  getTextDetection() {
    return this.TextDetections;
  }

  /**
   *
   * @param name{set}
   * @returns {boolean}
   */
  isTextPresent(textSet) {
    let present = false;
    this.TextDetections.forEach(detectedText => {
     if(textSet.has(detectedText.getDetectedText().toLowerCase())){
       present = true;
     }
    })
    return present;
  }
}

class TextDetection {

  /**
   * @type{string}
   */
  DetectedText

  /**
   * @type{string}
   */
  Type

  /**
   * @type{number}
   */
  Confidence

  /**
   * @type{Geometry}
   */
  Geometry


  constructor(detection) {
    this.DetectedText = detection.DetectedText;
    this.Type = detection.Type
    this.Confidence = detection.Confidence;
    this.Geometry = new Geometry(detection.Geometry);

  }


  /**
   *
   * @returns {string}
   */
  getType() {
    return this.Type;
  }

  /**
   *
   * @returns {string}
   */
  getDetectedText() {
    return this.DetectedText;
  }

  /**
   *
   * @returns {number}
   */
  getConfidence() {
    return this.Confidence;
  }

  /**
   *
   * @returns {Geometry}
   */
  getGeometry() {
    return this.Geometry
  }

}

class Geometry {

  /**
   *  @type{Bounding}
   */
  BoundingBox

  constructor(geometry) {
    // if (geometry.hasProperty("BoundingBox")) {
    this.BoundingBox = new Bounding(geometry.BoundingBox);
    // }
  }

  /**
   *
   * @returns {Bounding}
   */
  getBounding() {
    return this.BoundingBox;
  }

}

module.exports = {FinalImageData, LabelObject, Label, Instances, Bounding, Text, ModerationLabelsObject, BodyDetection};