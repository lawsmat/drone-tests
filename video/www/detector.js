var video, canvas, context, imageData, detector, posit;
var renderer1, renderer2, renderer3;
var scene1, scene2, scene3, scene4;
var camera1, camera2, camera3, camera4;
var plane1, plane2, model, texture;
var step = 0.0;

var modelSize = 100.0; //millimeters

function onLoad(){
  video = document.getElementById("video-canvas");
  context = video.getContext("2d");
  canvas = document.querySelector("#aruco-canvas")
  
  detector = new AR.Detector();
  posit = new POS.Posit(modelSize, canvas.width);

  createRenderers();
  createScenes();

};

function tick(){
    canvas.width = video.width
    canvas.height = video.height
    renderer3.setSize(canvas.width, canvas.height);

    snapshot();

    var markers = detector.detect(imageData);
    drawCorners(markers);
    updateScenes(markers);

    render();
};

function snapshot(){
  context.drawImage(video, 0, 0, video.width, video.height);
  imageData = video.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
};

function drawCorners(markers){
  var corners, corner, i, j;

  context.lineWidth = 3;

  for (i = 0; i < markers.length; ++ i){
    corners = markers[i].corners;
    
    context.strokeStyle = "red";
    context.beginPath();
    
    for (j = 0; j < corners.length; ++ j){
      corner = corners[j];
      context.moveTo(corner.x, corner.y);
      corner = corners[(j + 1) % corners.length];
      context.lineTo(corner.x, corner.y);
    }

    context.stroke();
    context.closePath();
    
    context.strokeStyle = "green";
    context.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
  }
};

function createRenderers(){

  renderer3 = new THREE.WebGLRenderer({canvas});
  renderer3.setClearColor(0xffffff, 1);
  renderer3.setSize(canvas.width, canvas.height);
  
  scene3 = new THREE.Scene();
  camera3 = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
  scene3.add(camera3);
  
  scene4 = new THREE.Scene();
  camera4 = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 1, 1000);
  scene4.add(camera4);
};

function render(){

  renderer3.autoClear = false;
  renderer3.clear();
  renderer3.render(scene3, camera3);
  renderer3.render(scene4, camera4);
};

function createScenes(){
  texture = createTexture();
  scene3.add(texture);

  model = createModel();
  scene4.add(model);
};

function createPlane(){
  var object = new THREE.Object3D(),
      geometry = new THREE.PlaneGeometry(1.0, 1.0),
      material = new THREE.MeshNormalMaterial(),
      mesh = new THREE.Mesh(geometry, material);
  
  object.eulerOrder = 'YXZ';
  
  object.add(mesh);
  
  return object;
};

function createTexture(){
  var texture = new THREE.Texture(video),
      object = new THREE.Object3D(),
      geometry = new THREE.PlaneGeometry(1.0, 1.0),
      material = new THREE.MeshBasicMaterial( {map: texture, depthTest: false, depthWrite: false} ),
      mesh = new THREE.Mesh(geometry, material);    
  
  object.position.z = -1;
  
  object.add(mesh);
  
  return object;
};

function createModel(){
  var object = new THREE.Object3D(),
      geometry = new THREE.SphereGeometry(0.5, 15, 15, Math.PI),
      texture = THREE.ImageUtils.loadTexture("/earth.jpeg"),
      material = new THREE.MeshBasicMaterial( {map: texture} ),
      mesh = new THREE.Mesh(geometry, material);
  
  object.add(mesh);
  
  return object;
};

function updateScenes(markers){
  var corners, corner, pose, i;
  
  if (markers.length > 0){
    corners = markers[0].corners;
    
    for (i = 0; i < corners.length; ++ i){
      corner = corners[i];
      
      corner.x = corner.x - (canvas.width / 2);
      corner.y = (canvas.height / 2) - corner.y;
    }
    
    pose = posit.pose(corners);
    
    // updateObject(plane1, pose.bestRotation, pose.bestTranslation);
    // updateObject(plane2, pose.alternativeRotation, pose.alternativeTranslation);
    updateObject(model, pose.bestRotation, pose.bestTranslation);
    
    step += 0.025;
    
    // model.rotation.z -= step;
  }
  
  texture.children[0].material.map.needsUpdate = true;
};

function updateObject(object, rotation, translation){
  console.log(translation)
  object.scale.x = modelSize;
  object.scale.y = modelSize;
  object.scale.z = modelSize;
  
  object.rotation.x = -Math.asin(-rotation[1][2]);
  object.rotation.y = -Math.atan2(rotation[0][2], rotation[2][2]);
  object.rotation.z = Math.atan2(rotation[1][0], rotation[1][1]);

  object.position.x = translation[0];
  object.position.y = translation[1];
  object.position.z = -translation[2];
};

document.addEventListener("DOMContentLoaded",onLoad)