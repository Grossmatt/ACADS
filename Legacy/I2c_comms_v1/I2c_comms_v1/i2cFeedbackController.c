#include <i2cFeedbackController.h>
#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>
#include "inc/hw_i2c.h"
#include "inc/hw_memmap.h"
#include "inc/hw_types.h"
#include "inc/hw_gpio.h"
#include "driverlib/i2c.h"
#include "driverlib/sysctl.h"
#include "driverlib/gpio.h"
#include "driverlib/pin_map.h"

#define powerOn           0x01
#define powerOff          0x02
#define functionalityTest 0x03
#define positionList      0x04
#define updateMotor1      0x05
#define updateMotor2      0x06

uint32_t dataRead = 0;
uint32_t positionValue;
uint32_t i = 1;

//initialize I2C module 0
//Slightly modified version of TI's example code
void InitI2C0(void)
{
    //enable I2C module 0
    SysCtlPeripheralEnable(SYSCTL_PERIPH_I2C0);

    //reset module
    SysCtlPeripheralReset(SYSCTL_PERIPH_I2C0);

    //enable GPIO peripheral that contains I2C 0
    SysCtlPeripheralEnable(SYSCTL_PERIPH_GPIOB);

    // Configure the pin muxing for I2C0 functions on port B2 and B3.
    GPIOPinConfigure(GPIO_PB2_I2C0SCL);
    GPIOPinConfigure(GPIO_PB3_I2C0SDA);

    // Select the I2C function for these pins.
    GPIOPinTypeI2CSCL(GPIO_PORTB_BASE, GPIO_PIN_2);
    GPIOPinTypeI2C(GPIO_PORTB_BASE, GPIO_PIN_3);

    // Enable and initialize the I2C0 master module.  Use the system clock for
    // the I2C0 module.  The last parameter sets the I2C data transfer rate.
    // If false the data rate is set to 100kbps and if true the data rate will
    // be set to 400kbps.
//    I2CMasterInitExpClk(I2C0_BASE, SysCtlClockGet(), false);

    //clear I2C FIFOs
//    HWREG(I2C0_BASE + I2C_O_FIFOCTL) = 80008000;
}

// The interrupt handler for the for I2C0 data slave interrupt.
void I2C0SlaveIntHandler(void)
{
    //Tivaware i2c library reference
    //https://www.ti.com/lit/ug/spmu298d/spmu298d.pdf?ts=1588793931897#page=335&zoom=100,84,700

    // Clear the I2C0 interrupt flag.
    I2CSlaveIntClear(I2C0_BASE);

    uint32_t status = I2CSlaveStatus(I2C0_BASE);

    switch(status){

    case I2C_SLAVE_ACT_NONE:        break;

    case I2C_SLAVE_ACT_RREQ:          if (dataRead == updateMotor1 || dataRead == updateMotor2){
                                          positionValue = I2CSlaveDataGet(I2C0_BASE);
                                        if (dataRead == updateMotor1){
                                            //set position of motor 1 variable in control code
                                        }
                                        else if (dataRead == updateMotor2){
                                            //set position of motor 2 variable in control code
                                        }
                                      }
                                      else if (dataRead == positionList){
                                           //read position list data
                                      }
                                      else{
                                          //unsupported
                                      }
                                    break;

    case I2C_SLAVE_ACT_TREQ:        if(dataRead == functionalityTest)
                                        //some logic to test pins and make sure the motor system is connected powered and functioning
                                        I2CSlaveDataPut(I2C0_BASE,1); //1 if the motor is functioning 0 if it is not
                                    else{
                                        //logic to send back feedback, in form (time,motor position 1, motor position 2, supply voltage motor 1, supply voltage motor 2, braking voltage generated)
                                        //this just sends i value after each sleep for 1 second in carrier code
                                        //should implement timer onboard
                                        I2CSlaveDataPut(I2C0_BASE,i);
                                        i += 1;
                                    }
                                    break;

    case I2C_SLAVE_ACT_RREQ_FBR:    dataRead = I2CSlaveDataGet(I2C0_BASE);
                                        switch(dataRead){
                                            case powerOn:           break;
                                            case powerOff:          break;
                                            case functionalityTest: break;
                                            case positionList:      break;
                                            case updateMotor1:      break;
                                            case updateMotor2:      break;
                                            default:                //unsupported command
                                                                    break;
                                        }
                                    break;

    case I2C_SLAVE_ACT_OWN2SEL:     break;
    case I2C_SLAVE_ACT_QCMD:        break;
    case I2C_SLAVE_ACT_QCMD_DATA:   break;

    default: //unsupported case
                                    break;
    }


}


