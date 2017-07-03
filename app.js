const agm = require('./agm.js');
const utils = require('./utils.js');
const fs = require('fs');

sensors = new agm.AGM(2000,0,8,0);

//sensors.calibrateSens(1000);

setInterval(function () {
	axis = sensors.readGData('deg');
	console.log(axis[0] + ',' + axis[1] + ',' + axis[2]);
},200);
	



//setInterval(readMotionSensors, 150);

// var zero = {
// 	modulus: 0,
// 	axis: [0,0,0]
// };

// var acc = zero,
// 	 gyro = zero,
// 	 magn = zero;

// function readMotionSensors() {
// 	fs.readFile('/sys/class/misc/FreescaleAccelerometer/data','utf8',function(err,data){
// 		if(err){
// 			acc = zero;
// 			return;
// 		}
// 		var axis = data.split(",");
// 		axis = [parseInt(axis[0]),parseInt(axis[1]),parseInt(axis[2])];
// 		var modulus = Math.sqrt(axis[0]*axis[0]+axis[1]*axis[1]+axis[2]*axis[2]);

// 		acc = {
// 			modulus: modulus,
// 			axis: axis
// 		};
// 	});

// 	fs.readFile('/sys/class/misc/FreescaleGyroscope/data','utf8',function(err,data){
// 		if(err){
// 			acc = zero;
// 			return;
// 		}
// 		var axis = data.split(",");
// 		axis = [parseInt(axis[0]),parseInt(axis[1]),parseInt(axis[2])];
// 		var modulus = Math.sqrt(axis[0]*axis[0]+axis[1]*axis[1]+axis[2]*axis[2]);

// 		gyro = {
// 			modulus: modulus,
// 			axis: axis
// 		};
// 	});

// 	fs.readFile('/sys/class/misc/FreescaleMagnetometer/data','utf8',function(err,data){
// 		if(err){
// 			acc = zero;
// 			return;
// 		}
// 		var axis = data.split(",");
// 		axis = [parseInt(axis[0]),parseInt(axis[1]),parseInt(axis[2])];
// 		var modulus = Math.sqrt(axis[0]*axis[0]+axis[1]*axis[1]+axis[2]*axis[2]);

// 		magn = {
// 			modulus: modulus,
// 			axis: axis
// 		};
// 	});
// 	//console.log(acc);
// 	//console.log(gyro);
// 	console.log(magn);
// }



