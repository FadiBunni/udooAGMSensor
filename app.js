const utils = require('./utils.js');
const fs = require('fs');

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



