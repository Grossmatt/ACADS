/*
 * i2c.h
 *
 *  Created on: Apr 29, 2020
 *      Author: Chase
 */

#ifndef I2CFEEDBACKCONTROLLER_H_
#define I2CFEEDBACKCONTROLLER_H_
#include <stdarg.h>
#include <stdint.h>

void InitI2C0(void);
void I2CSend(uint8_t slave_addr, uint8_t num_of_args, ...);
void I2CSendString(uint32_t slave_addr, char array[]);
uint32_t I2CReceive(uint32_t slave_addr, uint8_t reg);

#endif /* I2CFEEDBACKCONTROLLER_H_ */
