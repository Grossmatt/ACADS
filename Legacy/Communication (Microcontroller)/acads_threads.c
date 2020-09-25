#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <fcntl.h>
#include <time.h>

#include <sys/types.h>
#include <sys/socket.h>
#include <sys/ioctl.h>

#include <arpa/inet.h>

#include <linux/i2c-dev.h>

#include <netinet/in.h>
#include <unistd.h>
#include <pthread.h>
#include <semaphore.h>
#define true 1
#define MAX_PACKET_SIZE 256

sem_t s1, s2, s3;
int server_socket, client_socket, file, i2c_addr;
char buffer[MAX_PACKET_SIZE];
uint32_t dataBuffer[4];
char busName[25];
clock_t clock(void);

char serverMessage[256];

int initSocket()
{
        server_socket = socket(AF_INET, SOCK_STREAM, 0);

        struct sockaddr_in server_address;
        server_address.sin_family = AF_INET;
        server_address.sin_port = htons(5535);
        server_address.sin_addr.s_addr = inet_addr("10.0.0.1");
        bind(server_socket, (struct sockaddr*) &server_address, sizeof(server_address));
        listen(server_socket,5);

        client_socket = accept(server_socket, NULL, NULL);

        return server_socket;
}

void* EXT(void* arg)
{
        sem_wait(&s1);
        printf("Server Exit...\n");
        exit(0);
}

void* TEST(void* arg)
{
        while(true)
        {
                sem_wait(&s2);
                printf("TEST...\n");

                bzero(serverMessage, MAX_PACKET_SIZE);

                strcpy(serverMessage, "functionality,");

                serverMessage[14] = dataBuffer[0] + 48;

                send(client_socket, serverMessage, sizeof(serverMessage), 0);

                dataBuffer[0] = 0; //writes a zero to signal the next read request is not a functionality check

                if (write(file, dataBuffer, 1) != 1){
                        printf("I2C write fail\n");
                }

        }
}

void* READ(void* arg)
{
        while(true)
        {
                bzero(buffer, MAX_PACKET_SIZE);

                read(client_socket, buffer, sizeof(buffer));

                printf("New: %s\n",buffer);

                if (strncmp("powerOff", buffer, 8) == 0)
                {
                        dataBuffer[0] = 0x02;

                        if (write(file, dataBuffer, 1) != 1){
                                printf("I2C write fail\n");
                        }
                        sem_post(&s1);
                }
                else if(strncmp("functionalityTest", buffer, 17) == 0)
                {
                        dataBuffer[0] = 0x03;

                        if (write(file, dataBuffer, 1) != 1){
                                printf("I2C write fail\n");
                        }

                        if (read(file, dataBuffer, 1) != 1){
                                printf("I2C read fail\n");
                        }

                        sem_post(&s2);
                }
                else if(strncmp("updateMotor1", buffer, 12) == 0)
                {
                        dataBuffer[0] = 0x05;

                        if (write(file, dataBuffer, 1) != 1){
                                printf("I2C write fail\n");
                        }

                }
                else if(strncmp("updateMotor2", buffer, 12) == 0)
                {
                        dataBuffer[0] = 0x06;

                        if (write(file, dataBuffer, 1) != 1){
                                printf("I2C write fail\n");
                        }

                }
                else if(strncmp("profile", buffer, 7) == 0)
                {
                        dataBuffer[0] = 0x04;
                        if (write(file, dataBuffer, 1) != 1){
                                printf("I2C write fail\n");
                        }
                }
                else if(strncmp("powerOn", buffer, 7) == 0)
                {
                        dataBuffer[0] = 0x01;

                        if (write(file, dataBuffer, 1) != 1){
                                printf("I2C write fail\n");
                        }

                        sem_post(&s3);
                }
                else
                {
                        printf("Header not recognized\n");
                }
        }
}

void* WRITE(void* arg)
{
        sem_wait(&s3);
        while(true){ //Not using command after read has completed
                sleep(1);
                char feedbackBuffer[6];

                bzero(serverMessage,MAX_PACKET_SIZE);

                if(read(file, dataBuffer, 1) != 1){
                        printf("I2C read fail\n");
                }

                strcpy(serverMessage,"feedback, ");

                sprintf(feedbackBuffer, "%u", dataBuffer[0]);

                strcat(serverMessage,feedbackBuffer);

                strcat(serverMessage,", 22, 23, 3.1, 3.1, .2");

                send(client_socket, serverMessage, sizeof(serverMessage), 0);
        }
}


int main() {
        initSocket();
        sprintf(busName,"/dev/i2c-%d",0);
        i2c_addr = 0x1d;

        if ((file = open(busName,O_RDWR)) < 0){
                printf("I2C bus name not correct\n");
                exit(1);
        }

        if (ioctl(file,I2C_SLAVE,i2c_addr) < 0){
                printf("Cannot open Bus\n");
                exit(2);
        }

        sem_init(&s1, 1, 0);
        sem_init(&s2, 1, 0);
        sem_init(&s3, 1, 0);

        pthread_t t1, t2, t3, t4;

        pthread_create(&t1, NULL, READ, NULL);
        pthread_create(&t2, NULL, TEST, NULL);
        pthread_create(&t3, NULL, EXT, NULL);
        pthread_create(&t4, NULL, WRITE, NULL);

        pthread_join(t1,NULL);
        pthread_join(t2,NULL);
        pthread_join(t3,NULL);
        pthread_join(t4,NULL);

        sem_destroy(&s1);
        sem_destroy(&s2);
        sem_destroy(&s3);

        close(server_socket);

        return 0;

}