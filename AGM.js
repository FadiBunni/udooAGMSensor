const REGS = require('./regs.js');
const i2c  = require('i2c-bus');
const time = require('system-sleep');


function AGM(){
	var i2c1 = i2c.openSync(3);
	var calibrate = false;
	var accScale = 

	this.init = function(){

	};

	this.initAm = function(){

	};

	this.initG = function(){

	};

	this.toStandby = function(this,sensor){

	};
	
	this.toActive = function(this,sensor){

	};

	//enable/disable system drivers
	this.killDriver = function(this,x){

	};

	//Sensor calibrate
	this.calibrateSens = function(this,samples){

	};

	this.setSensConf = function(this,sensor,reg,hexVal){

	};

	this.readAData = function(this,uM){

	};

	this.readMData = function(this,uM){

	};

	this.readGData = function(this,uM){

	};

	this.readTData = function(this,uM){

	};

	this.comFilter = function(this,DT,axisOffset){

	};

	this.kalmanFilter = function(this,DT,axis,axisOffset){

	};

	this.madgwickQuaternionFilter = function(aCompArray,gCompArray,mCompArray){

	};

	this.getCurrentConf = function(this,sensor,screen){

	};



}

module.exports = AGM;