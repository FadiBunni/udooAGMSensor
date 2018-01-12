window.onload = function(){
	var socket = io();
	var udooData;
	socket.on("udooData",function(data){
		udooData = data;
	});

	var canvas = document.getElementById("canvas");
	var engine = new BABYLON.Engine(canvas,true);

	var createScene = function(){
		var rotate = 0;
		var scene = new BABYLON.Scene(engine);
		scene.clearColor = new BABYLON.Color3(0.5,0.5,0.5);

		var camera = new BABYLON.ArcRotateCamera("camera1",0,0,0,new BABYLON.Vector3(0,0,0),scene);
		camera.setPosition(new BABYLON.Vector3(0, 0, 150));
		camera.attachControl(canvas, true);

		var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
  		light.intensity = 0.7;

  		var pl = new BABYLON.PointLight("pl", BABYLON.Vector3.Zero(), scene);
 		pl.diffuse = new BABYLON.Color3(1, 1, 1);
  		pl.specular = new BABYLON.Color3(1, 1, 1);
  		pl.intensity = 0.8;

  		var mat = new BABYLON.StandardMaterial("mat1", scene);
 		mat.alpha = 1.0;
  		mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);

  		var faceColors = new Array(6);
  		faceColors[0] = new BABYLON.Color4(0,1,0,1);
  		faceColors[1] = new BABYLON.Color4(0,1,0,1);
  		faceColors[2] = new BABYLON.Color4(0,1,0,1);
  		faceColors[3] = new BABYLON.Color4(0,1,0,1);
  		faceColors[4] = new BABYLON.Color4(0,0,1,1);
  		faceColors[5] = new BABYLON.Color4(1,0,0,1);

  		var options = {
    		width: 55,
    		height: 15,
    		depth: 95,
    		//faceUV: faceUV,
    		faceColors : faceColors
 		 };

		var box = BABYLON.MeshBuilder.CreateBox('box', options, scene);
		box.rotation = new BABYLON.Vector3(rotate,rotate,rotate);
		setInterval(function(){
	       if(!undefined && udooData){
	       	box.rotation = new BABYLON.Vector3(BABYLON.Tools.ToRadians(udooData[1])*(-1),0,BABYLON.Tools.ToRadians(udooData[0]));
	       }else {
	       	box.rotation = new BABYLON.Vector3(0,0,0);
	       };
		},10);

		scene.registerBeforeRender(function(){
  			pl.position = camera.position;
 		});

		return scene;
	}

	var scene = createScene();

	engine.runRenderLoop(function(){
		scene.render();
	});
};
