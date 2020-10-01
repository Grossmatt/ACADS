const i2c = require('i2c-bus');

const TIVA_ADDR = 0x1d;
const TEMP_REG = 0x03;

const wbuf = Buffer.from([TEMP_REG]);
const rbuf = Buffer.alloc(2);
 
i2c.openPromisified(0).
then(i2c1 => i2c1.i2cWrite(TIVA_ADDR, wbuf.length, wbuf).
  then(_ => i2c1.i2cRead(TIVA_ADDR, rbuf.length, rbuf)).
  then(data => console.log(data)).
  then(_ => i2c1.close())
).catch(console.log);


