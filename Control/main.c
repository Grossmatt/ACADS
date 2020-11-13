//#include <i2cFeedbackController.h>
#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <string.h>
#include <stdio.h>
#include "inc/hw_i2c.h"
#include "inc/hw_memmap.h"
#include "inc/hw_types.h"
#include "inc/hw_gpio.h"
#include "inc/hw_ints.h"
#include "driverlib/i2c.h"
#include "driverlib/sysctl.h"
#include "driverlib/gpio.h"
#include "driverlib/pin_map.h"
#include "driverlib/interrupt.h"

//expansion board - tiva c
//GND 1C - GND
//S_Clock 2C - PB2
//S_Data 3C - PB3

//device = tiva c tm4c123gxl

#define SYSCTL_GPIOHBCTL_R      (*((volatile unsigned long *)0x400FE06C))
#define SYSCTL_RCGCGPIO_R       (*((volatile unsigned long *)0x400FE608))
#define GPIO_PORTA_DIR_R        (*((volatile unsigned long *)0x40004400))
#define GPIO_PORTA_DEN_R        (*((volatile unsigned long *)0x4000451C))
#define GPIO_PORTA_PUR_R        (*((volatile unsigned long *)0x40004510))

#define GPIO_PORTF_DIR_R        (*((volatile unsigned long *)0x40025400))
#define GPIO_PORTF_DR2R_R       (*((volatile unsigned long *)0x40025500))
#define GPIO_PORTF_DEN_R        (*((volatile unsigned long *)0x4002551C))

#define PUSH_BUTTON_0 (*((volatile uint32_t *)(0x42000000 + (0x400043FC-0x40000000)*32 + 2*4)))
#define BLUE_LED     (*((volatile uint32_t *)(0x42000000 + (0x400253FC-0x40000000)*32 + 2*4)))

#define PB0 4
#define BLUE_LED_MASK 4

#define avg_power 0
#define motor_1_update 120
#define motor_2_update 110
#define motor_1_update_neg 121
#define motor_2_update_neg 111



int8_t dataRead = 0;
bool update_stop_flag = false;
int8_t return_vals[4];
int8_t motor_position[2];
uint8_t avg_input_power = 0;
uint8_t power_generated = 0;
uint8_t motor_index = 5;
uint8_t loop_count = 0;

//initialize I2C module 0
//Slightly modified version of TI's example code
void InitI2C0()
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

    case I2C_SLAVE_ACT_NONE:
        break;

    case I2C_SLAVE_ACT_RREQ:
        dataRead = dataRead;
        break;

    case I2C_SLAVE_ACT_TREQ:
        if (loop_count == 1) // Loops through and returns to the server the states and values of the system.
        {
            I2CSlaveDataPut(I2C0_BASE, return_vals[0]);
        }
        if (loop_count == 2)
        {
            I2CSlaveDataPut(I2C0_BASE, return_vals[1]);
        }
        if (loop_count == 3)
        {
            I2CSlaveDataPut(I2C0_BASE, return_vals[2]);
        }
        if (loop_count == 4)
        {
            I2CSlaveDataPut(I2C0_BASE, return_vals[3]);
            loop_count = 0;
            update_stop_flag = false;
        }
        break;

    case I2C_SLAVE_ACT_RREQ_FBR:
        dataRead = I2CSlaveDataGet(I2C0_BASE);

        if ((motor_index == 5) & (dataRead < 10)) // This is the default routine. If no user changes occur then the system will send the return_vals array in order.
        {
            update_stop_flag = true;
            loop_count = loop_count + 1;
        }

        if ((dataRead == motor_1_update) & (motor_index == 5)) // This statement determines if motor 1 needs to be written to, if its POSITIVE, and prepares for the next write.
        {
            update_stop_flag = true; // Stops updating values of the system
            motor_index = 0; // Sets the motor which it wants to update. motor 1 being the 0th index.
            break;
        }

        if ((dataRead == motor_2_update) & (motor_index == 5)) // Same as above except motor 2 POSITIVE.
        {
            update_stop_flag = true;
            motor_index = 1; // Motor 2 is at index 1 of the array.
            break;
        }

        if ((dataRead == motor_1_update_neg) & (motor_index == 5)) // This statement determine if motor 1 needs to be written to, if its NEGATIVE, and prepares for the next write.
        {
            update_stop_flag = true;
            motor_index = 2; // Sets the motor which will be updated. Will be subtracted by 2 later.
            break;
        }

        if ((dataRead == motor_2_update_neg) & (motor_index == 5)) // Same as above except for motor 2 NEGATIVE.
        {
            update_stop_flag = true;
            motor_index = 3;
            break;
        }

        if ((motor_index == 0) & (dataRead < 41))
        {
            motor_position[motor_index] = dataRead; // Writing the new angle to the appropriate registers for motor 1 POSITIVE.
            motor_index = 5; // Reset motor_index.
            update_stop_flag = false; // Reset the update flag.
        }

        if ((motor_index == 2) & (dataRead < 41))
        {
            dataRead = dataRead * -1;
            motor_position[motor_index - 2] = dataRead; // Writing the new angle to the appropriate registers for motor 1 NEGATIVE.
            motor_index = 5; // Reset motor_index.
            update_stop_flag = false; // Reset the update flag.
        }

        if ((motor_index == 1) & (dataRead < 41))
        {
            motor_position[motor_index] = dataRead; // Writing the new angle to the appropriate registers for motor 2 POSITIVE.
            motor_index = 5; // Reset motor_index
            update_stop_flag = false; // Reset the update flag
        }

        if ((motor_index == 3) & (dataRead < 41))
        {
            dataRead = dataRead * -1;
            motor_position[motor_index - 2] = dataRead; // Writing the new angle to the appropriate registers for motor 2 NEGATIVE.
            motor_index = 5; // Reset motor_index
            update_stop_flag = false; // Reset the update flag
        }

        break;

    case I2C_SLAVE_ACT_OWN2SEL:     break;
    case I2C_SLAVE_ACT_QCMD:        break;
    case I2C_SLAVE_ACT_QCMD_DATA:   break;

    default: //unsupported case
                                    break;
    }


}



int main(void)
{
    SysCtlClockSet(SYSCTL_SYSDIV_1 | SYSCTL_USE_PLL | SYSCTL_OSC_INT | SYSCTL_XTAL_16MHZ);


    SYSCTL_GPIOHBCTL_R = 0;
    SYSCTL_RCGCGPIO_R |= 0x1 | 0x20;
    _delay_cycles(3);

    GPIO_PORTF_DIR_R |= BLUE_LED_MASK;   // bit 2 as output, other pins are inputs
    GPIO_PORTF_DR2R_R |= BLUE_LED_MASK;   // set drive strength to 2mA (not needed since default configuration -- for clarity)
    GPIO_PORTF_DEN_R |= BLUE_LED_MASK;   // enable LED

    GPIO_PORTA_DIR_R &= ~(PB0);
    GPIO_PORTA_DEN_R |= PB0;

    GPIO_PORTA_PUR_R |= PB0;

    InitI2C0();

    IntEnable(INT_I2C0);
    I2CSlaveIntEnableEx(I2C0_BASE, I2C_SLAVE_INT_DATA);

    I2CSlaveEnable(I2C0_BASE);

    I2CSlaveInit(I2C0_BASE, 0x1d);

    IntMasterEnable();



   while (1)
   {
       if(update_stop_flag == false)
       {
           return_vals[0] = motor_position[0]; // Registers that have motor 1 position
           return_vals[1] = motor_position[1]; // Registers that have motor 2 position
           return_vals[2] = avg_input_power; // Register holding avg_input_power
           return_vals[3] = power_generated; // Register holding breaking circuit power
       }

   }
}
