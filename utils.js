const REGS = require('./regs.js');

const utils = {
	//example list of registers
	regExample: function(sensor) {
		if(sensor == 'a'){
			console.log("Error: wrong register supplied to setSensConf(sensor,reg,hexVAL). Use one from the list instead:");
			for(var list in REGS.A_CREGS_LIST){
				var l = REGS.A_CREGS_LIST[list];
				console.log(l);
			}
			process.exit(1);
		}

		if(sensor == 'm'){
			console.log("Error: wrong register supplied to setSensConf(sensor,reg,hexVAL). Use one from the list instead:");
			for(var list in REGS.M_CREG_LIST){
				var l = REGS.M_CREG_LIST[list];
				console.log(l);
			}
			process.exit(1);
		}

		if(sensor == 'g'){
			console.log("Error: wrong register supplied to setSensConf(sensor,reg,hexVAL). Use one from the list instead:");
			for(var list in REGS.G_CREG_LIST){
				var l = REGS.G_CREG_LIST[list];
				console.log(l);
			}
			process.exit(1);
		}
	},
 	//get correct value scale
	dataConvertion: function(object,sensor,axisList,uM){
		var uM = (uM !== undefined) ? uM : null;
		var currScale;
		var x,y,z;
		if(sensor == 'a'){
			currScale = object.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_XYZ_DATA_CFG);
			if(currScale % 4 == 0){
				//sensitivity = 4096
				factor = 1;
			}else if (currScale % 2 != 0 && (currScale+1) % 4 != 0){ //last two bits are setted to 0b01 (4g mode)
				//senitivity = 2048
				factor = 2;
			}else if (currScale % 2 != 0 && (currScale+1) % 4 == 0) { //last two bits are setted to 0b11 (reserved)
				console.log("Error: this bit configuration is reserved to the sensor");
				process.exit(1);
			}else{
				//sensitivity = 1024
				factor = 4;
			}

			if(axisList[0] >= 32768)
				axisList[0] -= 65536;
			if(axisList[1] >= 32768)
				axisList[1] -= 65536;
			if(axisList[2] >= 32768)
				axisList[2] -= 65536;

			x = ((axisList[0] / 4) * 0.244 * factor);
			y = ((axisList[1] / 4) * 0.244 * factor);
			z = ((axisList[2] / 4) * 0.244 * factor);

			//raw values
			if(uM == null || uM == 'raw'){
				return axisList;
			//g components
			}else if(uM == 'gcomp'){
				axisList[0] = x / 1000;
				axisList[1] = y / 1000;
				axisList[2] = z / 1000;
				return axisList;
			//degrees
			}else if(uM == 'deg'){
				x2 = x * x;
				y2 = y * y;
				z2 = z * z;

				axisList[0] = Math.atan(x / Math.sqrt(y2 + z2)) * (180 / Math.PI);
				axisList[1] = Math.atan(y / Math.sqrt(x2 + z2)) * (180 / Math.PI) * (-1);
				axisList[2] = Math.atan(z / Math.sqrt(x2 + y2)) * (180 / Math.PI) * (-1);

				return axisList;
			//radians
			}else if(uM == 'rad'){
				x2 = x * x;
				y2 = y * y;
				z2 = z * z;

				axisList[0] = Math.atan(x / Math.sqrt(y2 + z2));
				axisList[1] = Math.atan(y / Math.sqrt(x2 + z2)) * (-1);
				axisList[2] = Math.atan(z / Math.sqrt(x2 + y2)) * (-1);

				return axisList;
			}else {
				console.log("Error: invalid measure unit given to method dataConvertion(object,axisList,uM) for accelerometer");
				process.exit(1);
			}
		}

		if(sensor == 'm'){
			var sensitivity = 0.1;
			if(axisList[0] >= 32768)
				axisList[0] -= 65536;
			if(axisList[1] >= 32768)
				axisList[1] -= 65536;
			if(axisList[2] >= 32768)
				axisList[2] -= 65536;

			if(uM == null || uM == 'raw'){
				return axisList;
			}else if(uM == 'ut'){
				axisList[0] = ((axisList[0]) * sensitivity);
				axisList[1] = ((axisList[0]) * sensitivity);
				axisList[2] = ((axisList[0]) * sensitivity);
				return axisList;
			}
		}

		if(sensor == 'g'){
			currScale = object.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_CTRL_REG0);
			currRange = object.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_G_ADDRESS,REGS.COMPLETE_REGS_DICT.G_CTRL_REG3);
			if(currRange % 2 == 1){
				ctrlDouble = 2;
			}else{
				ctrlDouble = 1;
			}

			if(axisList[0] >= 32769)
				axisList[0] = axisList[0] - 65535;
			if(axisList[1] >= 32769)
				axisList[1] = axisList[1] - 65535;
			if(axisList[2] >= 32769)
				axisList[2] = axisList[2] - 65535;

			if(uM == null || uM == 'raw'){
				return axisList;
			//deg or degs?????
			}else if(uM == 'deg' || uM == 'rad'){
				if(currScale % 4 == 0){
					sensitivity = 62.5 * ctrlDouble / 1000;
				}else if(currScale % 2 != 0 && (currScale+1) % 4 == 0){
					sensitivity = 31.25 * ctrlDouble / 1000;
				}else if(currScale % 2 != 0 && (currScale+1) % 4 != 0){
					sensitivity = 7.8125 * ctrlDouble / 1000;
				}else {
					sensitivity = 15.625 * ctrlDouble / 1000;
				}

				axisList[0] = -(axisList[0] * sensitivity);
				axisList[1] = -(axisList[1] * sensitivity);
				axisList[2] = -(axisList[2] * sensitivity);

				if(uM == 'rad'){
					axisList[0] = Math.radians(axisList[0]);
					axisList[1] = Math.radians(axisList[1]);
					axisList[2] = Math.radians(axisList[2]);
				}
				return axisList;
			}else{
				console.log("Error: Invalid measure unit given to method dataConvertion(object,sensor,axisList,uM) for gyroscope");
			}

		}else{
			console.log("Error: Incorrect parameters supplied to method dataConvertion(object,sensor,axisList,uM)");
			process.exit(1);
		}
	},

};

module.exports = utils;





