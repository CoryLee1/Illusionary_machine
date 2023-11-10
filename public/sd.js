let imgElement;
function setup() {
    // 其他设置代码
    setInterval(requestAPI, 5000);  // 每5秒请求一次API
  }

var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
function requestAPI() {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var updatedPrompt = `close up portrait of a pretty boy/girl retrofuturism, printmaking, cinematography, finely detailed features, perfect art, painted by Ayami Kojima, 80s scifi art, 80s art style, 4k, retrofuturism, y2k, retrofuturism, retrofuturism, makoto shinkai takashi takeuchi, Yoshiyuki Sadamoto Noah, japanese manga, printmaking, flat color`;

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
      console.log(result);
      if (result.status === 'success') {
          const imageUrl = result.output[0];
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
    .catch(error => console.log('error', error));
}
