var Promise = require('bluebird');
const i2c = require('i2c-bus');
const TIVA_ADDR = 0x1d;
const TEMP_REG = 0x03;

const wbuf = Buffer.from([TEMP_REG]);
const rbuf = Buffer.alloc(2);

var motor1P = 11;
var motor2P = 22;
var Avg_Power = 44;
var cycle = 1;
var iteration = 0;

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
			i2c.openPromisified(1).
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
			i2c.openPromisified(1).
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
			i2c.openPromisified(1).
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
        }, 500);
    });
}).then(function() {
    // Notice we can chain it because it's a Promise, this will run after completion of the promiseWhile Promise!
});


function i2cobject() {
var obj = {
    power: 1,
    motor1: 15, 
    motor2: 3,
}

var jobj = JSON.stringify(obj);

return jobj;

}

function sendCommand () {


}




module.exports =  { i2cobject, sendCommand };