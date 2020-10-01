const i2c = require('i2c-bus');
 
const MCP9808_ADDR = 0x1d;
const TEMP_REG = 0x03;
 
const toCelsius = rawData => {
  rawData = (rawData >> 8) + ((rawData & 0xff) << 8);
  let celsius = (rawData & 0x0fff) / 16;
  if (rawData & 0x1000) {
    celsius -= 256;
  }
  return celsius;
};
 
const i2c1 = i2c.openSync(0);
const rawData = i2c1.readWordSync(MCP9808_ADDR, TEMP_REG);
console.log(rawData);
i2c1.closeSync();
