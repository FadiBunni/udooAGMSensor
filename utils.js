const REGS = require('./regs.js');

const utils = {
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

	dataConvertion: function(object,sensor,axisList,uM){
		var uM = (uM !== undefined) ? uM : false;
		var currScale;
		if(sensor == 'a'){
			currScale = object.readByteSync(REGS.COMPLETE_REGS_DICT.I2C_AM_ADDRESS,REGS.COMPLETE_REGS_DICT.A_XYZ_DATA_CFG);
		}

	},

};

module.exports = utils;





