var dev_mode = 0;
var Promise = require('bluebird');

const i2c = require('i2c-bus');

const TIVA_ADDR = 0x1d;


var motor1P = 0; // motorxP is the data from the user for each "x" motor
var temp_motor1 = 0; // temp_motorx is the holding var to test again for each "x" motor.
var motor_1_copy = 0; // motor_x_copy is a var holding a positive copy of motorxP. Needed for transmition of negative values.

var motor2P = 0;
var temp_motor2 = 0;
var motor_2_copy = 0;

var Avg_Power = 0;
var power_state = 0;
var temp_power_state = 0;

var func_Test_Result = 0;
var req_func_test = 0;

var idleactive = 1;

var write_flag = 0; // Flag that stops updates of values during i2c transmitions.

//******************************************************************
//
// NOTE: i2c-bus does NOT allow for negative values in the functions
// 	 used. Thus some manipulation was used below so that a
//       negative value could be sent across i2c.
//
//******************************************************************


const passToGlobalAP = power => // Function to pass the avg_power read from i2c into a global var
{
	Avg_Power = power;
	return;
}

const passToGlobalFuncTest = functest => // Function to pass the Func_Test_Result read from i2c into a global var
{
	func_Test_Result = functest;
	return;
}




var promiseWhile = function(condition, action) { // Needed for asynchronous loop
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


promiseWhile(function() { // Infinite loop that reads and writes values to i2c bus

   return 1; // Condition for stopping

}, function() {
    // The function to run, should return a promise
    return new Promise(function(resolve, reject) {
        
        setTimeout(function() {
		if ((temp_power_state != power_state) & (power_state == 1))
		{
			temp_power_state = power_state;

			write_flag = 1;

			i2c.openPromisified(1). // Writing to RedBoard a value of 130 to perform functionality test on power on.
				then(i2c1 => i2c1.readByte(TIVA_ADDR, 130).
				then(functest => passToGlobalFuncTest(functest)).
				then(_ => i2c1.close())).
				catch(console.log);

			write_flag = 0;

		}

		if (idleactive == 0)
		{
			write_flag = 1;
			is_idle = 1;

			i2c.openPromisified(1).
				then(i2c1 => i2c1.sendByte(TIVA_ADDR, 140). // 140 used to set motors idle.
				then(_ => i2c1.close())).
				catch(console.log);

			write_flag = 0;
				
		}
		if (req_func_test == 1)
		{
			write_flag = 1;

			i2c.openPromisified(1). // Writing to RedBoard a value of 130 to perform functionality test.
				then(i2c1 => i2c1.readByte(TIVA_ADDR, 130).
				then(functest => passToGlobalFuncTest(functest)).
				then(_ => i2c1.close())).
				catch(console.log);
			
			write_flag = 0;

		}

		if (motor1P < 0) // These if/else keep a positive copy of motorxP and updates at the begining of every loop.
		{
			motor_1_copy = motor1P * -1;
		}
		else
		{
			motor_1_copy = motor1P;
		}

		if (motor2P < 0)
		{
			motor_2_copy = motor2P * -1;
		}
		else
		{
			motor_2_copy = motor2P;
		}

	   	if ((motor_1_copy != temp_motor1) & (motor1P > 0)) // I2c write for a positive motor1 change.
		{
			write_flag = 1; // Prevents writes to motor1 vals while entering i2c functions.

			temp_motor1 = motor_1_copy;
			
			i2c.openPromisified(1).
				then(i2c1 => i2c1.sendByte(TIVA_ADDR, 120). // Writes 120 to redboard. Tells it that a positive motor 1 update is next.
				then(_ => i2c1.close())).
				catch(console.log);
			console.log("MOTOR 1 CHANGE in progress.");

			i2c.openPromisified(1).
				then(i2c1 => i2c1.sendByte(TIVA_ADDR, temp_motor1). // Writing the actual value of the motor update.
				then(_ => i2c1.close())).
				catch(console.log);
			console.log("Motor successfully changed.");
			
			write_flag = 0; // Release the mutex.

		}

	   	if ((motor_2_copy != temp_motor2) && (motor2P > 0)) // Same comments as above except for motor2. 110 is used for motor2 positive opcode.
		{
			write_flag = 1;
			temp_motor2 = motor_2_copy;
			
			i2c.openPromisified(1).
				then(i2c1 => i2c1.sendByte(TIVA_ADDR, 110).
				then(_ => i2c1.close())).
				catch(console.log);
			console.log("MOTOR 2 CHANGE in progress.");

			i2c.openPromisified(1).
				then(i2c1 => i2c1.sendByte(TIVA_ADDR, temp_motor2).
				then(_ => i2c1.close())).
				catch(console.log);
			console.log("Motor successfully changed.");
			
			write_flag = 0;

		}

		if ((motor_1_copy != temp_motor1) && (motor1P < 0)) // I2c write for a negative motor 1 change.
		{
			write_flag = 1;
			temp_motor1 = motor_1_copy;
			
			i2c.openPromisified(1).
				then(i2c1 => i2c1.sendByte(TIVA_ADDR, 121). // 121 used for a negative motor 1 opcode.
				then(_ => i2c1.close())).
				catch(console.log);
			console.log("MOTOR 1 CHANGE in progress (NEGATIVE).");

			i2c.openPromisified(1).
				then(i2c1 => i2c1.sendByte(TIVA_ADDR, temp_motor1). // Writing the actual value to the redboard.
				then(_ => i2c1.close())).
				catch(console.log);
			console.log("Motor 1 successfully changed.");
			
			
			write_flag = 0;

		}

		if ((motor_2_copy != temp_motor2) & (motor2P < 0)) // Same as above function except for motor 2
		{
			write_flag = 1;
			temp_motor2 = motor_2_copy;
			
			i2c.openPromisified(1).
				then(i2c1 => i2c1.sendByte(TIVA_ADDR, 111). // 111 used for motor 2 negative opcode.
				then(_ => i2c1.close())).
				catch(console.log);
			console.log("MOTOR 2 CHANGE in progress (NEGATIVE).");

			i2c.openPromisified(1).
				then(i2c1 => i2c1.sendByte(TIVA_ADDR, temp_motor2).
				then(_ => i2c1.close())).
				catch(console.log);
			console.log("Motor 2 successfully changed.");
			
			
			write_flag = 0;

		}

		i2c.openPromisified(1). // This function simply reads the data of the average input power and pass it to the global var for displaying later.
			then(i2c1 => i2c1.readByte(TIVA_ADDR, 0).
			then(power => passToGlobalAP(power)).
			then(_ => i2c1.close())).
			catch(console.log);

            resolve();

        }, 1000); // Rate of asynchronous updates in ms
    });
}).then(function() {
    // Notice we can chain it because it's a Promise, this will run after completion of the promiseWhile Promise!
});




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
	obj["idleactive"] = idleactive; //0 - Idle, 1 = Active
	obj["power_input"] =  7.88;
	obj["power_input_5s"] =  6.53;
	obj["power_input_10s"] =  6.44;
	obj["power_input_30s"] =  6.45;
	obj["braking_voltage"] =  7.88;
	obj["braking_voltage_5s"] =  6.53;
	obj["braking_voltage_10s"] =  6.44;
	obj["braking_voltage_30s"] =  6.45;
	obj["functionality_test_result"] = 1;
	return obj;
}




function setGlobalVars(_motor1pos, _motor2pos, _power_state, _functionality_test, _idleactive, _dev_mode) { // This function is called in app.js and passes the user updated values to control.js


	if (write_flag != 1)
	{
		motor1P = _motor1pos;
		motor2P = _motor2pos;
		power_state = _power_state;
		dev_mode = _dev_mode;
		idleactive = _idleactive;
		req_func_test = _functionality_test;
	}

}






module.exports =  { setGlobalVars, SetJSONParms };
