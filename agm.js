const REGS = require('./regs.js');
const utils = require('./utils.js');
const i2c  = require('i2c-bus');
const exec = require('child_process').exec;
const sleep = require('system-sleep');
const isHex = require('is-hex');
const child = require('child_process');


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
			regNoise = 0x0c;
		}else if(noise == 0 || noise == null){
			regNoise = 0x00;
		}else {
			console.log("Error: incorrect low noise vaule, it can assume 1 (enabled) or 0 (disabled)");
			process.exit(1);
		}
		
		if(scaleRange == 2){
			this.setSensConf('a','A_XYZ_DATA_CFG',0x00); //Set range to +/- 2g
		}else if(scaleRange == 4){
			this.setSensConf('a','A_XYZ_DATA_CFG',0x01); //Set range to +/- 4g
		}else if(scaleRange == 8){
			this.setSensConf('a','A_XYZ_DATA_CFG',0x02); //Set range to +/- 8g
		}else if(scaleRange == null){
			i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_CTRL_REG1,0x01); // Set active mode
			sleep(300);
		}else {
			console.log("Error: Incorrect aScaleRange value, read the documentation for the correct config");
			process.exit(1);
		}
		
		accScale = scaleRange;
		i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_CTRL_REG1,0x01 | regNoise); // Set active mode

		sleep(300);

		i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.M_CTRL_REG1,0x03); // Enable both accelerometer and magnetometer sensors

	};

	// Gyroscope initialization
	this.initG = function(scaleRange, fsDouble){
		this.toStandby('g');

		if(fsDouble == 1){
			gyrDouble = 2;
			this.setSensConf('g','G_CTRL_REG3',0x01);
		}else if(fsDouble == 0){
			gyrDouble = 1;
			this.setSensConf('g','G_CTRL_REG3',0x00);
		}else {
			gyrDouble = 1;
			this.setSensConf('g','G_CTRL_REG3',0x00);
		}

	if(scaleRange == 2000){
			this.setSensConf('g','G_CTRL_REG0',0x00); // set range to +/- 2000dps (4000dps if CTRL_REG3 is set to double)
		}else if(scaleRange == 1000){
			this.setSensConf('g','G_CTRL_REG0',0x01); // set range to +/- 1000dps (2000dps if CTRL_REG3 is set to double)
		}else if(scaleRange == 500){
			this.setSensConf('g','G_CTRL_REG0',0x02); // set range to +/- 500dps (1000dps if CTRL_REG3 is set to double)
		}else if(scaleRange == 250){
			this.setSensConf('g','G_CTRL_REG0',0x03); // set range to +/- 250dps (500dps if CTRL_REG3 is set to double)
		}else if(scaleRange == null){
			i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS.A_CTRL_REG1,0x016);  // set to active mode
			sleep(300);
		}else {
			console.log("Error: incorrect gScaleRange value, read the documentation for the correct config");
			process.exit(1);
		}
		gyrScale = scaleRange;

		i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.A_CTRL_REG1,0x016); // set to active mode
		sleep(300);
	};

	this.toStandby = function(sensor){
		var currReg;
		if(sensor == 'a' || sensor == 'm'){
			currReg = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_CTRL_REG1); // get current configuration
			if(currReg % 2 == 1){
				i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_CTRL_REG1, currReg - 1); // set to standby_mod
			}
		}

		if(sensor == 'g'){
			currReg = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_CTRL_REG1); // get old configuration
			currReg = currReg >> 2;
			currReg = currReg << 2;
			i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_CTRL_REG1,currReg); // set to standby_mod
		}
		sleep(300);
	};

	this.toActive = function(sensor){
		var currReg;
		if(sensor == 'a' || sensor == 'm'){
			currReg = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_CTRL_REG1); // get current configuration
			i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_CTRL_REG1,currReg); // set to active_mode
		}

		if(sensor == 'g'){
			currReg = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_CTRL_REG1) // get old configuration
			currReg = currReg >> 2;
			currReg = currReg << 2;
			currReg = currReg + 2;

			i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_CTRL_REG1,currReg) // set to active_mode
		}
		sleep(300);
	};

	//enable/disable system drivers
	this.killDriver = function(x){
		if(x == 1){
			exec("sudo rmmod fxas2100x");
			exec("sudo rmmod fxos8700");
		}else if(x == 0){
			exec("sudo modprobe fxas2100x");
			exec("sudo modprobe fxos8700");
		}else{
			console.log("Error: wrong killDrivers(x) parameter. killDrivers(0): enable drivers killDrivers(1): disable drivers.");
			process.exit(1);
		}
	};

	//Sensor calibrate
	this.calibrateSens = function(samples){
		var i = 0;
		var perc = -1;
		var acc_angle = [];
		var rate_gyr = [];

		var sumX = 0;
		var sumY = 0;
		var sumZ = 0;

		var gsumX = 0;
		var gsumY = 0;
		var gsumZ = 0;

		var tarXvect = [];
		var tarYvect = [];
		var tarZvect = [];

		var gtarXvect = [];
		var gtarYvect = [];
		var gtarZvect = [];

		var gyrXangle = 0.0;
		var gyrYangle = 0.0;
		var gyrZangle = 0.0;

		var accXangle = 0.0;
		var accYangle = 0.0;
		var accZangle = 0.0;

		var avgX = sumX / samples;
		var avgY = sumY / samples;
		var avgZ = sumZ / samples;

		var gavgX = gsumX / samples;
		var gavgY = gsumY / samples;
		var gavgZ = gsumZ / samples;

		var axisOffset = [];

		// This needs to be fixed so that it can be used in javascript....
		console.log("CAUTION! Sensors calibration.Set your udoo-neo in an horizontal position and press any key to continue");
		child.spawnSync("read _ ", {shell: true, stdio: [0, 1, 2]});

		while(i < samples){
		
			acc_angle = this.readAData();
			rate_gyr = this.readGData();

			factor = accScale / 2;

			if(acc_angle[0] >= 32768){
				tarXvect.push(acc_angle[0]-65536);
			}else{
				tarXvect.push(acc_angle[0]);
			}

			if(acc_angle[1] >= 32768){
				tarYvect.push(acc_angle[1]-65536);
			}else {
				tarYvect.push(acc_angle[1]);
			}

			if(acc_angle[2] >= 32768){
				tarZvect.push(acc_angle[2] - 65536 + 16384/factor);
			}else{
				tarZvect.push(acc_angle[2] + 16384/factor);
			}

			if(rate_gyr[0] >= 32768){
				gtarXvect.push(rate_gyr[0]-65536);
			}else{
				gtarXvect.push(rate_gyr[0]);
			}

			if(rate_gyr[1] >= 32768){
				gtarYvect.push(rate_gyr[1]-65536);
			}else{
				gtarYvect.push(rate_gyr[1]);
			}

			if(rate_gyr[2] >= 32768){
				gtarZvect.push(rate_gyr[2]-65536);
			}else{
				gtarZvect.push(rate_gyr[2]);
			}

			sumX += tarXvect[i];
			sumY += tarYvect[i];
			sumZ += tarZvect[i];

			gsumX += gtarXvect[i];
			gsumY += gtarYvect[i];
			gsumZ += gtarZvect[i];

			var loading = i*100/samples;
			if(loading != perc){
				console.log("Calibration percentage: " + loading + "%");
				perc = loading;
			}
			i++;
		}

		console.log("Calibration percentage: 100%");

		axisOffset.push(avgX);
		axisOffset.push(avgY);
		axisOffset.push(avgZ);
		axisOffset.push(gavgX);
		axisOffset.push(gavgY);
		axisOffset.push(gavgZ);

		calibrated = true;
		return axisOffset;
	};

	// set sensors configurations
	this.setSensConf = function(sensor,reg,hexVal){
		this.toStandby(sensor);
		//console.log(REGS.G_CREGS_LIST.indexOf(reg) != -1);
		
		if(sensor == 'a'){
			if(REGS.A_CREGS_LIST.indexOf(reg) != -1){
				i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT[reg],hexVal);
			}else{
				util.regExample('a');
			}
		}

		if(sensor == 'm'){
			if(REGS.M_CREGS_LIST.indexOf(reg) != -1){
				if(isHex(hexVal)){
					i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT[reg],hexVal);
				}
			}else{
				util.regExample('m');
			}
		}

		if(sensor == 'g'){
			if(REGS.G_CREGS_LIST.indexOf(reg) != -1){
				i2c1.writeByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT[reg],hexVal);
			}else{
				util.regExample('g');
			}
		}

		sleep(300);
		this.toActive(sensor);
	};

	// read accelerometer data
	this.readAData = function(uM){
		var uM = (uM !== undefined) ? uM : null;
		var axisList = [];

		// getting x,y,z coordinate shifting first 8bit and adding
		// (with the or operator) the others 8 bit to the address
		var xMsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_OUT_X_MSB);
		var xLsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_OUT_X_LSB);

		var xRaw = (xMsbRaw << 8 | xLsbRaw); // x axis

		var yMsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_OUT_Y_MSB);
		var yLsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_OUT_Y_LSB);

		var yRaw = (yMsbRaw << 8 | yLsbRaw) // y axis

		var zMsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_OUT_Z_MSB);
		var zLsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_OUT_Z_LSB);

		var zRaw = (zMsbRaw << 8 | zLsbRaw) // z axis

		axisList.push(xRaw);
		axisList.push(yRaw);
		axisList.push(zRaw);

		axisList = utils.dataConvertion(i2c1,"a",axisList,uM);

		return axisList;
	};

	this.readMData = function(uM){
		var uM = (uM !== undefined) ? uM : null;
		var axisList = [];

		// getting x,y,z coordinate shifting first 8bit and adding
		// (with the or operator) the others 8 bit to the address
		var xMsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.M_OUT_X_MSB);
		var xLsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.M_OUT_X_LSB);

		var xRaw = (xMsbRaw << 8 | xLsbRaw); // x axis

		var yMsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.M_OUT_Y_MSB);
		var yLsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.M_OUT_Y_LSB);

		var yRaw = (yMsbRaw << 8 | yLsbRaw) // y axis

		var zMsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.M_OUT_Z_MSB);
		var zLsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.M_OUT_Z_LSB);

		var zRaw = (zMsbRaw << 8 | zLsbRaw) // z axis

		axisList.push(xRaw);
		axisList.push(yRaw);
		axisList.push(zRaw);

		axisList = utils.dataConvertion(i2c1,"m",axisList,uM);

		return axisList;
	};

	this.readGData = function(uM){
		var uM = (uM !== undefined) ? uM : null;
		var axisList = [];
		
		// getting x,y,z coordinate shifting first 8bit and adding
		// (with the or operator) the others 8 bit to the address
		var xMsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_OUT_X_MSB);
		var xLsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_OUT_X_LSB);

		var xRaw = (xMsbRaw << 8 | xLsbRaw); // x axis

		var yMsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_OUT_Y_MSB);
		var yLsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_OUT_Y_LSB);

		var yRaw = (yMsbRaw << 8 | yLsbRaw) // y axis

		var zMsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_OUT_Z_MSB);
		var zLsbRaw = i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_OUT_Z_LSB);

		var zRaw = (zMsbRaw << 8 | zLsbRaw) // z axis

		axisList.push(xRaw);
		axisList.push(yRaw);
		axisList.push(zRaw);

		axisList = utils.dataConvertion(i2c1,"g",axisList,uM);

		return axisList;
	};

	this.readTData = function(uM){
		var uM = (uM !== undefined) ? uM : null;
		var tempCels;
		var tempRaw= i2c1.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_TEMP);

		if (tempRaw >= 128){
			tempCels = (tempRaw-256)*0.96;
		}else{
			tempCels = tempRaw*0.96;
		}

		if(uM == null || uM == 'raw')
			return tempRaw;
		if(uM == 'C')
			return tempCels;
		if(uM == 'K')
			var tempKelv= tempCels + 273.15;
			return tempKelv;
		if(uM == 'F')
			var tempFahr = (tempCels * 1.8)+32;
			return tempFahr;
	};

	// complementary filter algorithm
	this.comFilter = function(DT,axisOffset){

	};

	this.kalmanFilter = function(DT,axis,axisOffset){

	};

	this.madgwickQuaternionFilter = function(aCompArray,gCompArray,mCompArray){

	};

	this.getCurrentConf = function(sensor,screen){

	};
	this.init(gScaleRange,fsDouble,aScaleRange,noise);
};

module.exports = {AGM};