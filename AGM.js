const REGS = require('./regs.js');
const i2c  = require('i2c-bus');
const exec = require('child_process').exec;
const time = require('system-sleep');


function AGM(gScaleRange,fsDouble,aScaleRange,noise){
	var i2c1 = i2c.openSync(3);
	var calibrate = false;
	var accScale = null;
	var gyrScale = null;
	var gyrDouble = null;

	// Complementary Filter Attributes
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

	// Accelerometer and magnetometer initialization
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
			this.setSensConf('a',REGS.A_INT_SOURCE.A_XYZ_DATA_CFG,0x00); //Set range to +/- 2g
		}else if(scaleRange == 4){
			this.setSensConf('a',REGS.A_INT_SOURCE.A_XYZ_DATA_CFG,0x01); //Set range to +/- 2g
		}else if(scaleRange == 8){
			this.setSensConf('a',REGS.A_INT_SOURCE.A_XYZ_DATA_CFG,0x02); //Set range to +/- 2g
		}else if(scaleRange == null){
			i2c1.writeByteSync(REGS.I2C_AM_ADDRESS,REGS.A_CTRL_REG1,0x01); // Set active mode
			time.sleep(300);
		}else {
			console.log("Error: Incorrect aScaleRange value, read the documentation for the correct config");
			process.exit(1);
		}

		accScale = scaleRange;
		i2c1.writeByteSync(REGS.I2C_AM_ADDRESS,REGS.A_CTRL_REG1,0x01 | regNoise); // Set active mode

		time.sleep(300);

		i2c1.writeByteSync(REGS.I2C_AM_ADDRESS,REGS.M_CTRL_REG1,0x03); // Enable both accelerometer and magnetometer sensors

	};

	// Gyroscope initialization
	this.initG = function(scaleRange, fsDouble){
		this.toStandby('g');

		if(fsDouble == 1){
			gyrDouble = 2;
			this.setSensConf('g',REGS.COMPLETE_REGS_DICT.G_CTRL_REG3,0x01);
		}else if(fsDouble == 0){
			gyrDouble = 1;
			this.setSensConf('g',REGS.COMPLETE_REGS_DICT.G_CTRL_REG3,0x00);
		}else {
			gyrDouble = 1;
			this.setSensConf('g',REGS.COMPLETE_REGS_DICT.G_CTRL_REG3,0x00);
		}

		if(scaleRange == 2000){
			this.setSensConf('g',REGS.COMPLETE_REGS_DICT.G_CTRL_REG0,0x00); // set range to +/- 2000dps (4000dps if CTRL_REG3 is set to double)
		}else if(scaleRange == 1000){
			this.setSensConf('g',REGS.COMPLETE_REGS_DICT.G_CTRL_REG0,0x01); // set range to +/- 1000dps (2000dps if CTRL_REG3 is set to double)
		}else if(scaleRange == 500){
			this.setSensConf('g',REGS.COMPLETE_REGS_DICT.G_CTRL_REG0,0x02); // set range to +/- 500dps (1000dps if CTRL_REG3 is set to double)
		}else if(scaleRange == 250){
			this.setSensConf('g',REGS.COMPLETE_REGS_DICT.G_CTRL_REG0,0x03); // set range to +/- 250dps (500dps if CTRL_REG3 is set to double)
		}else if(scaleRange == null){
			i2c1.writeByteSync(REGS.I2C_G_ADDRESS,REGS.A_CTRL_REG1,0x016);  // set to active mode
			time.sleep(300);
		}else {
			console.log("Error: incorrect gScaleRange value, read the documentation for the correct config");
			process.exit(1);
		}
		gyrScale = scaleRange;

		i2c1.writeByteSync(REGS.I2C_G_ADDRESS,A_CTRL_REG1,0x016); // set to active mode
		time.sleep(300);
	};

	this.toStandby = function(sensor){
		var currReg;
		if(sensor == 'a' || sensor == 'm'){
			currReg = i2c1.readByteSync(REGS.I2C_AM_ADDRESS,REGS.A_CTRL_REG1); // get current configuration
			if(currReg % 2 == 1){
				i2c1.writeByteSync(REGS.I2C_AM_ADDRESS,REGS.A_CTRL_REG1, currReg - 1); // set to standby_mod
			}
		}

		if(sensor == 'g'){
			currReg = i2c1.readByteSync(REGS.I2C_G_ADDRESS,REGS.G_CTRL_REG1); // get old configuration
			currReg = currReg >> 2;
			currReg = currReg << 2;
			i2c1.writeByteSync(REGS.I2C_G_ADDRESS,REGS.G_CTRL_REG1,currReg); // set to standby_mod
		}
		time.sleep(300);
	};

	this.toActive = function(sensor){
		var currReg;
		if(sensor == 'a' || sensor == 'm'){
			currReg = i2c1.readByteSync(REGS.I2C_AM_ADDRESS,REGS.A_CTRL_REG1); // get current configuration
			i2c1.writeByteSync(REGS.I2C_AM_ADDRESS,REGS.A_CTRL_REG1,currReg); // set to active_mode
		}

		if(sensor == 'g'){
			currReg = i2c1.readByteSync(REGS.I2C_G_ADDRESS,REGS.G_CTRL_REG1) // get old configuration
			currReg = currReg >> 2;
			currReg = currReg << 2;
			currReg = currReg + 2;

			i2c1.writeByteSync(REGS.I2C_G_ADDRESS,REGS.G_CTRL_REG1,currReg) // set to active_mode
		}
		time.sleep(300);
	};

	//enable/disable system drivers
	this.killDriver = function(x){
		if(x == 1){
			exec("sudo rmmod fxas2100x");
			exec("sudo rmmod fxos8700");
		}else if(x == 0){
			exec("sudo modprobe fxas2100x");
			exec("sudo modprobe fxos8700");
		}
		console.log("Error: wrong killDrivers(x) parameter. killDrivers(0): enable drivers killDrivers(1): disable drivers.");
		process.exit(1);
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