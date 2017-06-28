const REGS = require('./regs.js');
const i2c  = require('i2c-bus');
const time = require('system-sleep');


function AGM(){
	var i2c1 = i2c.openSync(3);
	var calibrate = false;
	var accScale = null;
	var gyrScale = null;
	var gyrDouble = null;

	//Complementary Filter Attributes
	var compAux = 0;
	var cFAngleX = 0;
	var cFAngleY = 0;
	var cFAngleZ = 0;

	this.init = function(gScaleRange,fsDouble,aScaleRange,noise){
		var gScaleRange = (gScaleRange !== undefined) ? gScaleRange : null;
		var fsDouble = (fsDouble !== undefined) ? fsDouble : null;
		var aScaleRange = (aScaleRange !== undefined) ? aScaleRange : null;
		var noise = (noise !== undefined) ? noise : null;
		this.killDriver(1);
		this.initAm(aScaleRange,noise);
		this.initG(gScaleRange,fsDouble);
	};

	this.initAm = function(scaleRange,noise){
		var regNoise;
		this.toStandby('a');
		if(noise == 1 && [2,4].indexOf(scaleRange) !== -1){
			regNoise = REGS.A_INT_SOURCE.A_INT_SOURCE;
		}else if(noise == 0 || noise == null){
			regNoise = REGS.A_INT_SOURCE.A_STATUS;
		}else {
			console.log("Error: incorrect low noise vaule, it can assume 1 (enabled) or 0 (disabled)");
			process.exit(1);
		}

		if(scaleRange == 2){
			this.setSensConf('a',REGS.A_INT_SOURCE.A_XYZ_DATA_CFG,0x00); //set range to +/- 2g
		}
	};

	this.initG = function(){

	};

	this.toStandby = function(sensor){

	};
	
	this.toActive = function(sensor){

	};

	//enable/disable system drivers
	this.killDriver = function(x){

	};

	//Sensor calibrate
	this.calibrateSens = function(samples){

	};

	this.setSensConf = function(sensor,reg,hexVal){

	};

	this.readAData = function(uM){

	};

	this.readMData = function(uM){

	};

	this.readGData = function(uM){

	};

	this.readTData = function(uM){

	};

	this.comFilter = function(DT,axisOffset){

	};

	this.kalmanFilter = function(DT,axis,axisOffset){

	};

	this.madgwickQuaternionFilter = function(aCompArray,gCompArray,mCompArray){

	};

	this.getCurrentConf = function(sensor,screen){

	};



}

module.exports = AGM;