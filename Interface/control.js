var dev_mode = 1;
var Promise = require('bluebird');
if (!dev_mode) {
const i2c = require('i2c-bus');
}
const TIVA_ADDR = 0x1d;


var motor1P = 0;
var motor2P = 0;
var Avg_Power = 44;
var cycle = 1;
var iteration = 0;
var power_state = 0;

if (!dev_mode) {

const passToGlobalM1 = motor => {
	motor1P = motor;
	return;
};

const passToGlobalM2 = motor => {
	motor2P = motor;
	return;
};

const passToGlobalAP = motor => {
	Avg_Power = motor;
	return;
};



var promiseWhile = function(condition, action) {
    var resolver = Promise.defer();

    var loop = function() {
        if (!condition()) return resolver.resolve();
        return Promise.cast(action())
            .then(loop)
            .catch(resolver.reject);
    };

    process.nextTick(loop);

    return resolver.promise;
};


promiseWhile(function() {
    // Condition for stopping
   return 1;
}, function() {
    // The function to run, should return a promise
    return new Promise(function(resolve, reject) {
        // Arbitrary 250ms async method to simulate async process
        setTimeout(function() {
	    if (cycle == 1)
		{
			i2c.openPromisified(0).
				then(i2c1 => i2c1.readByte(TIVA_ADDR, cycle).
				then(motor => passToGlobalM1(motor)).
				then(_ => i2c1.close())).
				catch(console.log);
				console.log(iteration);
				console.log("at 1");
				console.log(motor1P);
				console.log("");
		}
	    else if (cycle == 2)
		{
			i2c.openPromisified(0).
				then(i2c1 => i2c1.readByte(TIVA_ADDR, cycle).
				then(motor => passToGlobalM2(motor)).
				then(_ => i2c1.close())).
				catch(console.log);
				console.log(iteration);
				console.log("at 2");
				console.log(motor2P);
				console.log("");
		}
	    else if (cycle == 3)
		{
			i2c.openPromisified(0).
				then(i2c1 => i2c1.readByte(TIVA_ADDR, cycle).
				then(motor => passToGlobalAP(motor)).
				then(_ => i2c1.close())).
				catch(console.log);
				console.log(iteration);
				console.log("at 3");
				console.log(Avg_Power);
				console.log("");
		}
	    if (cycle > 2)
		{
			cycle = 1;
	 	}
	    else
		{
			cycle = cycle + 1;
		}
		iteration = iteration + 1;
            resolve();

        }, 5000);
    });
}).then(function() {
    // Notice we can chain it because it's a Promise, this will run after completion of the promiseWhile Promise!
});

}


function SetJSONParms () {
	var obj = {};
	obj["pos_motor1"] = motor1P;
	obj["pos_motor2"] = motor2P;
	obj["quadrant_hallsensor1"] = 1;
	obj["quadrant_hallsensor2"] = 4;
	obj["power"] =  power_state;
	obj["status_encoder1"] =  1;
	obj["status_encoder2"] =  1;
	obj["status_hallsensor1"] =  1;
	obj["status_hallsensor2"] =  1;
	obj["status_motor1"] =  1;
	obj["status_motor2"] =  1;
	obj["status_powersupply1"] =  1;
	obj["status_powersupply2"] =  1;
	obj["status_powersupply3"] =  1;
	obj["status_megacap1"] =  1;
	obj["status_megacap2"] =  1;
	obj["status_braking_circuit1"] =  0;
	obj["status_braking_circuit2"] =  1;
	obj["status_microcontroller1"] =  1;
	obj["status_microcontroller2"] =  1;
	obj["voltage_input"] =  7.88;
	obj["voltage_input_5s"] =  6.53;
	obj["voltage__input_10s"] =  6.44;
	obj["voltage_Input_30s"] =  6.45;
	
	return obj;
}




function setGlobalVars(_motor1pos, _motor2pos,_power_state,_dev_mode) {
console.log("SetGlobalVars called:" + _motor1pos + " " + _motor2pos +" "+ _power_state);
motor1P = _motor1pos;
motor2P = _motor2pos;
power_state = _power_state;
dev_mode = _dev_mode;
}






module.exports =  { setGlobalVars, SetJSONParms };
