var socket;
let detector;
let classifier;
let emotiondect;
let x;
let y;
let wid;
let hei;
let video; 
//load all the model before detection started
let detectorLoaded = false;
let classifierLoaded = false;
let emotiondectLoaded = false;
let allModelsLoaded = false;
let lastDetectionTime = 0; // 保存上次检测的时间
const detectionInterval = 3000; // 设置检测间隔为3000毫秒（3秒）
//store the results of detection
let detections = []; // 存储物体检测结果
let classifications = []; // 存储图像分类结果
let emotions = []; // 存储情绪检测结果
// Declare an array to store the emotion data
let emotionData = [];
let aix;
let aiy;
let aiwid;
let aihei;
let currentPrompt = ''; // 当前prompt变量
let isGeneratingImage = false; // 是否正在生成图片
let generatedImages = []; // 用来存储生成的图片URL
let updatedPrompt;
let lastResults = null;
let detectionPending = false;
let imgElement;
updatedPrompt = "close up portrait of a pretty boy/girl,"+ currentPrompt + "retrofuturism, printmaking, cinematography, finely detailed features, perfect art, painted by Ayami Kojima, 80s scifi art, 80s art style, 4k, retrofuturism, y2k, retrofuturism, retrofuturism, makoto shinkai takashi takeuchi, Yoshiyuki Sadamoto Noah, japanese manga, printmaking, flat color";

const faceOptions = {
  withLandmarks: true,
  withExpressions: true,
  withDescriptors: false,
};
async function setup() {
  socket=io.connect('http://localhost:3000');
  createCanvas(400, 400);
  frameRate(24);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // 隐藏内嵌的视频播放器
  detector = await ml5.objectDetector('cocossd', {},modelLoaded);
  classifier = await ml5.imageClassifier('MobileNet', video, modelLoaded1);
  emotiondect = await ml5.faceApi(video, faceOptions, modelLoaded2);
  console.log("All models loaded!");
}

function detectObjects() {
  detector.detect(video, gotdect);
}

function classifyImage() {
  classifier.classify(gotdect1);
}

function detectEmotions() {
  emotiondect.detect(video, gotdect2);
}

function modelLoaded() {
  console.log("objectDetector Model Loaded!");
  detectorLoaded = true;
  checkAllModelsLoaded();
 
}
function modelLoaded1() {
  console.log("classifier Model Loaded!");
  classifierLoaded = true;
  checkAllModelsLoaded();
  
}
function modelLoaded2() {
  console.log("emotion Model Loaded!");
  emotiondectLoaded = true;
  checkAllModelsLoaded();
  
}
function checkAllModelsLoaded() {
    if (detectorLoaded && classifierLoaded && emotiondectLoaded) {
      startDetecting();
    }
  }
function startDetecting() {
    // 设置一个新的布尔变量，以确保在draw函数中检测只在模型加载后开始
    allModelsLoaded = true;
  }

function gotdect(error, results) {
  if (error) {
    console.error(error);
  } else {
    console.log(results);
    detections = results;//store the detections json data
    for (let i = 0; i < results.length; i++) {
      let object = results[i];
      console.log(object);

    }
  }
}
function toPercentage(num) {
  return (num * 100).toFixed(2) + '%'; // 保留两位小数
}
function gotdect1(error, results) {
  if (error) {
    console.error(error);
  } else {
    console.log(results);
    classifications = results;//store the classification json data
    if (classifications.length > 0) {
            // 当检测到分类时，更新 prompt 并请求生成图片
            currentPrompt = "also looks like " + classifications[0].label + " with " + toPercentage(classifications[0].confidence) + " probability " + classifications[1].label + " with " + toPercentage(classifications[1].confidence) + " probability " + classifications[2].label + " with " + toPercentage(classifications[2].confidence) + " probability"; // 添加更多描述来丰富 prompt
            updatedPrompt = "close up portrait of a pretty boy/girl," + currentPrompt + "retrofuturism, printmaking, cinematography, finely detailed features, perfect art, painted by Ayami Kojima, 80s scifi art, 80s art style, 4k, retrofuturism, y2k, retrofuturism, retrofuturism, makoto shinkai takashi takeuchi, Yoshiyuki Sadamoto Noah, japanese manga, printmaking, flat color"; // 更新 prompt
            console.log(currentPrompt);
            console.log(updatedPrompt);
      if (!isGeneratingImage) { // 如果当前没有生成图片，则开始新的生成
        isGeneratingImage = true; // 设置生成图片的标志
        requestAPI();
      }
    }
    for (let i = 0; i < results.length; i++) {
      let object = results[i];
      console.log(object);

    }
  }
}
function requestAPI() {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  

  var raw = JSON.stringify({
    "key": "Wv4rQxME8kIgpVfYy1gBhyDutXJcZSYN9DEEhznYD46O79iQjs5zLC6JxtDL",
    "prompt": updatedPrompt,
    "negative_prompt": null,
    "width": "512",
    "height": "512",
    "samples": "1",
    "num_inference_steps": "20",
    "seed": null,
    "guidance_scale": 7.5,
    "safety_checker": "yes",
    "multi_lingual": "no",
    "panorama": "no",
    "self_attention": "no",
    "upscale": "no",
    "embeddings_model": null,
    "webhook": null,
    "track_id": null
  });
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("https://stablediffusionapi.com/api/v3/text2img", requestOptions)
    .then(response => response.json())
    .then(result => {
      isGeneratingImage = false; // 重置生成图片的标志
      console.log(result);
      if (result.status === 'success') {
          const imageUrl = result.output[0];
          generatedImages.push(imageUrl);
          // 如果 imgElement 不存在，创建新的图像对象
          if (!imgElement) {
            imgElement = createImg(imageUrl);
            imgElement.hide();  // 隐藏 HTML 图像元素，只在 canvas 中显示
          } else {
            // 如果 imgElement 已存在，更新它的 src 属性
            imgElement.attribute('src', imageUrl);
          }
      } else {
          console.error('Error generating image:', result);
      }
    })
    .catch(error =>{
      isGeneratingImage = false; // 重置生成图片的标志
      console.log('error', error)
    });
}
function gotdect2(error, results) {
  if (error) {
    console.error(error);
  } else {
    console.log(results);
    // Clear the previous emotion data
    if (results.length > 0) { // 检测到新的情绪数据
      // 清除旧的情绪数据
      emotionData = [];
    emotions = results;//store the emotion json data
    for (let i = 0; i < results.length; i++) {
      // Store the rectangles and points for each detected emotion
      let object = results[i];
      emotionData.push({
        box: {
          x: object.alignedRect._box._x,
          y: object.alignedRect._box._y,
          width: object.alignedRect._box._width,
          height: object.alignedRect._box._height
        },
        points: object.landmarks.positions.map(p => ({ x: p._x, y: p._y })),
        label: object.label,
        confidence: object.confidence
      });
    }
    }
    }
  }
  async function performDetection() {
    detectionPending = true;  // 标记开始检测
    await detectObjects();
    await classifyImage();
    await detectEmotions();
    detectionPending = false; // 标记检测完成
  }
function draw() {
  background(255);
  image(video, 0, 0, 400, 400);
  // 获取当前时间
  // 如果有检测结果，则渲染它们
  if (lastResults) {
    drawDetections(lastResults.detections);
    drawClassifications(lastResults.classifications);
    drawEmotions(lastResults.emotions);
  }

  // 更新画面上的生成的图像
  drawGeneratedImages();

  let currentTime = millis();
  if (allModelsLoaded && !detectionPending && currentTime - lastDetectionTime > detectionInterval) {
    lastDetectionTime = currentTime;
    performDetection().then(() => {
      // 一旦检测完成，保存检测结果供下一次绘制时使用
      lastResults = {
        detections: detections, // 假设这是存储检测结果的变量
        classifications: classifications, // 存储分类结果的变量
        emotions: emotions // 存储情绪检测结果的变量
      };
    });
  }
}
function drawGeneratedImages() {
  for (let i = 0; i < generatedImages.length; i++) {
    let img = createImg(generatedImages[i]);
    img.position(20, i * 150); // 根据需要调整位置
    img.size(100, 100); // 根据需要调整大小
    img.show();
  }
}
function drawDetections() {
  for (let i = 0; i < detections.length; i++) {
    let object = detections[i];
      console.log(object);
      stroke("yellow");
      strokeWeight(1);
      noFill();
    x=object.x;
    y=object.y;
    wid=map(object.width,0,1000,0,width);
    hei=map(object.height,0,1000,0,height);
      rect(x+50, y+50, wid+50, hei+50);
      console.log(object.x);
      fill(255);
      textSize(12);
      text(object.label, x + 54, y + 64);
      text("Believability:", x + 54, y + 78);
      text(object.confidence, x + 54, y + 92);
  }
}
function drawClassifications() {
  for (let i = 0; i < classifications.length; i++) {
    let object = classifications[i];
    console.log(object);
    stroke("yellow");
    strokeWeight(0.5);
    fill(255);
    textSize(8);
    text(object.label, x+54, y+14+80+hei+i*10);
    text("Confidence:"+object.confidence.toFixed(3), x+4+85+50,y+14+80+hei+i*10);
  }
}
function drawEmotions() {
  for (let i = 0; i < emotionData.length; i++) {
    let data = emotionData[i];
    aix=data.box.x;
    aiy=data.box.y;
    aiwid=data.box.width;
    aihei=data.box.height;
    if (imgElement) {  // 确保 imgElement 已创建
      image(imgElement, data.box.x, data.box.y, data.box.width, data.box.height);
    }
    stroke("yellow");
    strokeWeight(1);
    noFill();
    rect(data.box.x, data.box.y, data.box.width, data.box.height);
    for (let j = 0; j < data.points.length; j++) {
      strokeWeight(3);
      point(data.points[j].x, data.points[j].y);
    }
  }
}

