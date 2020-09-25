//-----------------------------------------------------------------------------
// Hardware Target
//-----------------------------------------------------------------------------

// Target Platform: EK-TM4C123GXL Evaluation Board
// Target uC:       TM4C123GH6PM
// System Clock:    40 MHz

// Hardware configuration:

// 16 PWM signals
/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

//-----------------------------------------------------------------------------
// Device includes, defines, and assembler directives
//-----------------------------------------------------------------------------

#include <stdint.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <stdio.h>
#include "tm4c123gh6pm.h"
#include <i2cFeedbackController.h>
#include "hw_i2c.h"
#include "hw_memmap.h"
#include "hw_types.h"
#include "hw_gpio.h"
#include "hw_ints.h"
#include "driverlib/i2c.h"
#include "driverlib/sysctl.h"
#include "driverlib/gpio.h"
#include "driverlib/pin_map.h"
#include "driverlib/interrupt.h"

//-----------------------------------------------------------------------------
// Subroutines
//-----------------------------------------------------------------------------

// Initialize Hardware
void initHw()
{
    // Configure HW to work with 16 MHz XTAL, PLL enabled, system clock of 40 MHz
    // PWM is system clock / 2
    SYSCTL_RCC_R = SYSCTL_RCC_XTAL_16MHZ | SYSCTL_RCC_OSCSRC_MAIN | SYSCTL_RCC_USESYSDIV | (4 << SYSCTL_RCC_SYSDIV_S)
                | SYSCTL_RCC_USEPWMDIV | SYSCTL_RCC_PWMDIV_2;

    //OTHERS
    SYSCTL_RCGCADC_R |= 1;                           // turn on ADC module 0 clocking
    SYSCTL_RCGCTIMER_R |= SYSCTL_RCGCTIMER_R1;       // turn-on timer

    // Enable GPIO ports A, B, C, D, E and F
    SYSCTL_RCGC2_R = SYSCTL_RCGC2_GPIOA | SYSCTL_RCGC2_GPIOB | SYSCTL_RCGC2_GPIOC | SYSCTL_RCGC2_GPIOD | SYSCTL_RCGC2_GPIOE |  SYSCTL_RCGC2_GPIOF;

    // turn-on PWM module
    SYSCTL_RCGC0_R |= SYSCTL_RCGC0_PWM0;

    //Configure PORT A
    GPIO_PORTA_DIR_R |= 0x20;   // make bit5 an output
    GPIO_PORTA_DR2R_R |= 0x20;  // set drive strength to 2mA
    GPIO_PORTA_DEN_R |= 0x20;   // enable bit5 for digital
    GPIO_PORTA_ODR_R |= 0x20;   // ensure lights turn off
    GPIO_PORTA_AFSEL_R |= 0x20; // select auxilary function for bit 5
    GPIO_PORTA_PCTL_R = GPIO_PCTL_PA6_M1PWM2 | GPIO_PCTL_PA7_M1PWM3;

    // Configure PORT B
    GPIO_PORTB_DIR_R |= 0x20;   // make bit5 an output
    GPIO_PORTB_DR2R_R |= 0x20;  // set drive strength to 2mA
    GPIO_PORTB_DEN_R |= 0x20;   // enable bit5 for digital
    GPIO_PORTB_ODR_R |= 0x20;   // ensure lights turn off
    GPIO_PORTB_AFSEL_R |= 0x20; // select auxilary function for bit 5
    GPIO_PORTB_PCTL_R = GPIO_PCTL_PB4_M0PWM2 | GPIO_PCTL_PB5_M0PWM3 | GPIO_PCTL_PB6_M0PWM0 | GPIO_PCTL_PB7_M0PWM1;

    // Configure PORT C
    GPIO_PORTC_DIR_R |= 0x20;   // make bit5 an output
    GPIO_PORTC_DR2R_R |= 0x20;  // set drive strength to 2mA
    GPIO_PORTC_DEN_R |= 0x20;   // enable bit5 for digital
    GPIO_PORTC_ODR_R |= 0x20;   // ensure lights turn off
    GPIO_PORTC_AFSEL_R |= 0x20; // select auxilary function for bit 5
    GPIO_PORTC_PCTL_R = GPIO_PCTL_PC4_M0PWM6 | GPIO_PCTL_PC5_M0PWM7;

    // Configure PORT D
    GPIO_PORTD_DIR_R |= 0x20;   // make bit5 an output
    GPIO_PORTD_DR2R_R |= 0x20;  // set drive strength to 2mA
    GPIO_PORTD_DEN_R |= 0x20;   // enable bit5 for digital
    GPIO_PORTD_ODR_R |= 0x20;   // ensure lights turn off
    GPIO_PORTD_AFSEL_R |= 0x20; // select auxilary function for bit 5
    GPIO_PORTD_PCTL_R = GPIO_PCTL_PD0_M1PWM0 | GPIO_PCTL_PD1_M1PWM1;

    //Configure PORT E
    GPIO_PORTE_DIR_R |= 0x30;   // make bits 4 and 5 outputs
    GPIO_PORTE_DR2R_R |= 0x30;  // set drive strength to 2mA
    GPIO_PORTE_DEN_R |= 0x30;   // enable bits 4 and 5 for digital
    GPIO_PORTE_ODR_R |= 0x30;
    GPIO_PORTE_AFSEL_R |= 0x30; // select auxilary function for bits 4 and 5
    GPIO_PORTE_PCTL_R = GPIO_PCTL_PE4_M0PWM4 | GPIO_PCTL_PE5_M0PWM5;

    // Configure PORT F
    GPIO_PORTF_DIR_R |= 0x20;   // make bit5 an output
    GPIO_PORTF_DR2R_R |= 0x20;  // set drive strength to 2mA
    GPIO_PORTF_DEN_R |= 0x20;   // enable bit5 for digital
    GPIO_PORTF_ODR_R |= 0x20;   //ensure lights turn off
    GPIO_PORTF_AFSEL_R |= 0x20; // select auxilary function for bit 5
    GPIO_PORTF_PCTL_R = GPIO_PCTL_PF0_M1PWM4 | GPIO_PCTL_PF1_M1PWM5 | GPIO_PCTL_PF2_M1PWM6 | GPIO_PCTL_PF3_M1PWM7;

    // Configure PWM module0 and module1
    // wait 3 clocks
    __asm(" NOP");
    __asm(" NOP");
    __asm(" NOP");

    //reset modules
    SYSCTL_SRPWM_R = SYSCTL_SRPWM_R0;       // reset PWM0 module
    SYSCTL_SRPWM_R = 0;                     // leave reset state
    SYSCTL_SRPWM_R = SYSCTL_SRPWM_R1;       // reset PWM1 module
    SYSCTL_SRPWM_R = 0;                     // leave reset state

    //turn off generators
    PWM0_0_CTL_R = 0;       // turn-off PWM0 generator 0
    PWM0_1_CTL_R = 0;       // turn-off PWM0 generator 1
    PWM0_2_CTL_R = 0;       // turn-off PWM0 generator 2
    PWM0_3_CTL_R = 0;       // turn-off PWM0 generator 3
    PWM1_0_CTL_R = 0;       // turn-off PWM1 generator 0
    PWM1_1_CTL_R = 0;       // turn-off PWM1 generator 1
    PWM1_2_CTL_R = 0;       // turn-off PWM1 generator 2
    PWM1_3_CTL_R = 0;       // turn-off PWM1 generator 3

    //set outputs on generators
    PWM0_0_GENA_R = PWM_0_GENA_ACTCMPBD_ZERO | PWM_0_GENA_ACTLOAD_ONE;          // output 1 on PWM0, gen 0a, cmpa
    PWM0_0_GENB_R = PWM_0_GENB_ACTCMPBD_ZERO | PWM_0_GENB_ACTLOAD_ONE;          // output 2 on PWM0, gen 0b, cmpb
    PWM0_1_GENA_R = PWM_0_GENA_ACTCMPBD_ZERO | PWM_0_GENA_ACTLOAD_ONE;          // output 3 on PWM0, gen 1a, cmpa
    PWM0_1_GENB_R = PWM_0_GENB_ACTCMPBD_ZERO | PWM_0_GENB_ACTLOAD_ONE;          // output 4 on PWM0, gen 1b, cmpb
    PWM0_2_GENA_R = PWM_0_GENA_ACTCMPBD_ZERO | PWM_0_GENA_ACTLOAD_ONE;          // output 5 on PWM0, gen 2a, cmpa
    PWM0_2_GENB_R = PWM_0_GENB_ACTCMPBD_ZERO | PWM_0_GENB_ACTLOAD_ONE;          // output 6 on PWM0, gen 2b, cmpb
    PWM0_3_GENA_R = PWM_0_GENA_ACTCMPBD_ZERO | PWM_0_GENA_ACTLOAD_ONE;          // output 7 on PWM0, gen 3a, cmpa
    PWM0_3_GENB_R = PWM_0_GENB_ACTCMPBD_ZERO | PWM_0_GENB_ACTLOAD_ONE;          // output 8 on PWM0, gen 3b, cmpb
    PWM0_0_GENA_R = PWM_1_GENA_ACTCMPBD_ZERO | PWM_1_GENA_ACTLOAD_ONE;          // output 1 on PWM1, gen 0a, cmpa
    PWM0_0_GENB_R = PWM_1_GENB_ACTCMPBD_ZERO | PWM_1_GENB_ACTLOAD_ONE;          // output 2 on PWM1, gen 0b, cmpb
    PWM0_1_GENA_R = PWM_1_GENA_ACTCMPBD_ZERO | PWM_1_GENA_ACTLOAD_ONE;          // output 3 on PWM1, gen 1a, cmpa
    PWM0_1_GENB_R = PWM_1_GENB_ACTCMPBD_ZERO | PWM_1_GENB_ACTLOAD_ONE;          // output 4 on PWM1, gen 1b, cmpb
    PWM0_2_GENA_R = PWM_1_GENA_ACTCMPBD_ZERO | PWM_1_GENA_ACTLOAD_ONE;          // output 5 on PWM1, gen 2a, cmpa
    PWM0_2_GENB_R = PWM_1_GENB_ACTCMPBD_ZERO | PWM_1_GENB_ACTLOAD_ONE;          // output 6 on PWM1, gen 2b, cmpb
    PWM0_3_GENA_R = PWM_1_GENA_ACTCMPBD_ZERO | PWM_1_GENA_ACTLOAD_ONE;          // output 7 on PWM1, gen 3a, cmpa
    PWM0_3_GENB_R = PWM_1_GENB_ACTCMPBD_ZERO | PWM_1_GENB_ACTLOAD_ONE;          // output 8 on PWM1, gen 3b, cmpb

    //set clocks for generators
    // set period to 40 MHz sys clock / 2 / 1024 = 19.53125 kHz
    PWM0_0_LOAD_R = 400;
    PWM0_1_LOAD_R = 400;
    PWM0_2_LOAD_R = 400;
    PWM0_3_LOAD_R = 400;
    PWM1_0_LOAD_R = 400;
    PWM1_1_LOAD_R = 400;
    PWM1_2_LOAD_R = 400;
    PWM1_3_LOAD_R = 400;

    //set the generator signals to off
    PWM0_0_CMPA_R = 0;           // Module 0 Generator 0 signal a
    PWM0_0_CMPB_R = 0;           // Module 0 Generator 0 signal b
    PWM0_1_CMPA_R = 0;           // Module 0 Generator 1 signal a
    PWM0_1_CMPB_R = 0;           // Module 0 Generator 1 signal b
    PWM0_2_CMPA_R = 0;           // Module 0 Generator 2 signal a
    PWM0_2_CMPB_R = 0;           // Module 0 Generator 2 signal b
    PWM0_3_CMPA_R = 0;           // Module 0 Generator 3 signal a
    PWM0_3_CMPB_R = 0;           // Module 0 Generator 3 signal b
    PWM1_0_CMPA_R = 0;           // Module 1 Generator 0 signal a
    PWM1_0_CMPB_R = 0;           // Module 1 Generator 0 signal b
    PWM1_1_CMPA_R = 0;           // Module 1 Generator 1 signal a
    PWM1_1_CMPB_R = 0;           // Module 1 Generator 1 signal b
    PWM1_2_CMPA_R = 0;           // Module 1 Generator 2 signal a
    PWM1_2_CMPB_R = 0;           // Module 1 Generator 2 signal b
    PWM1_3_CMPA_R = 0;           // Module 1 Generator 3 signal a
    PWM1_3_CMPB_R = 0;           // Module 1 Generator 3 signal b

    //turn on generators
    PWM0_0_CTL_R = PWM_0_CTL_ENABLE;        // turn-on PWM0 generator 0
    PWM0_1_CTL_R = PWM_0_CTL_ENABLE;        // turn-on PWM0 generator 1
    PWM0_2_CTL_R = PWM_0_CTL_ENABLE;        // turn-on PWM0 generator 2
    PWM0_3_CTL_R = PWM_0_CTL_ENABLE;        // turn-on PWM0 generator 3
    PWM1_0_CTL_R = PWM_0_CTL_ENABLE;        // turn-on PWM1 generator 0
    PWM1_1_CTL_R = PWM_0_CTL_ENABLE;        // turn-on PWM1 generator 1
    PWM1_2_CTL_R = PWM_0_CTL_ENABLE;        // turn-on PWM1 generator 2
    PWM1_3_CTL_R = PWM_0_CTL_ENABLE;        // turn-on PWM1 generator 3

    //enable signal outputs
    PWM0_ENABLE_R = PWM_ENABLE_PWM0EN | PWM_ENABLE_PWM1EN | PWM_ENABLE_PWM2EN | PWM_ENABLE_PWM3EN
            | PWM_ENABLE_PWM4EN | PWM_ENABLE_PWM5EN | PWM_ENABLE_PWM6EN | PWM_ENABLE_PWM7EN;
    PWM1_ENABLE_R = PWM_ENABLE_PWM0EN | PWM_ENABLE_PWM1EN | PWM_ENABLE_PWM2EN | PWM_ENABLE_PWM3EN
            | PWM_ENABLE_PWM4EN | PWM_ENABLE_PWM5EN | PWM_ENABLE_PWM6EN | PWM_ENABLE_PWM7EN;

    SysCtlClockSet(SYSCTL_SYSDIV_1 | SYSCTL_USE_PLL | SYSCTL_OSC_INT | SYSCTL_XTAL_16MHZ);
    InitI2C0();
    IntEnable(INT_I2C0);
    I2CSlaveIntEnableEx(I2C0_BASE, I2C_SLAVE_INT_DATA);
    I2CSlaveEnable(I2C0_BASE);
    I2CSlaveInit(I2C0_BASE, 0x1d);
    IntMasterEnable();

    // Configure AN0 as an analog input
    GPIO_PORTE_AFSEL_R |= 0x08;                      // select alternative functions for AN0 (PE3)
    GPIO_PORTE_DEN_R &= ~0x08;                       // turn off digital operation on pin PE3
    GPIO_PORTE_AMSEL_R |= 0x08;                      // turn on analog operation on pin PE3

    // Configure ADC
    ADC0_CC_R = ADC_CC_CS_SYSPLL;                    // select PLL as the time base (not needed, since default value)
    ADC0_ACTSS_R &= ~ADC_ACTSS_ASEN3;                // disable sample sequencer 3 (SS3) for programming
    ADC0_EMUX_R = ADC_EMUX_EM3_PROCESSOR;            // select SS3 bit in ADCPSSI as trigger
    ADC0_SSMUX3_R = 0;                               // set first sample to AN0
    ADC0_SSCTL3_R = ADC_SSCTL3_END0;                 // mark first sample as the end
    ADC0_ACTSS_R |= ADC_ACTSS_ASEN3;                 // enable SS3 for operation

}

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

int main(void)
{
    initHw();
    //return 0;
    while(1){}
}
