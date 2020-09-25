#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <sys/types.h>
#include <sys/socket.h>

#include <arpa/inet.h>

#include <netinet/in.h>
#include <unistd.h>
#include <pthread.h>
#include <semaphore.h>
#define true 1

sem_t s1, s2;
int server_socket, client_socket;
char buffer[256];
char server_message[256] = "you have reached server";

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
                send(client_socket, server_message, sizeof(server_message), 0);
        }
}

void* SOCKET(void* arg)
{
        while(true)
        {

                read(client_socket, buffer, sizeof(buffer));

                printf("New: %s\n",buffer);

                if (strncmp("exit", buffer, 4) == 0)
                {
                        sem_post(&s1);
                }
                else if(strncmp("functionalityTest", buffer, 17) == 0)
                {
                        sem_post(&s2);
                }
                else if(strncmp("updateMotor1", buffer, 12) == 0)
                {

                }
                else if(strncmp("updateMotor2", buffer, 12) == 0)
                {

                }
                else if(strncmp("profile", buffer, 7) == 0)
                {
					
                }
                else if(strncmp("powerOn", buffer, 7) == 0)
                {

                }
                else
                {
                        printf("Header not recognized\n");
                }
        }
}


int main() {
        initSocket();
        sem_init(&s1, 1, 0);
        sem_init(&s2, 1, 0);
        pthread_t t1, t2, t3;
        pthread_create(&t1, NULL, SOCKET, NULL);
        pthread_create(&t2, NULL, TEST, NULL);
        pthread_create(&t3, NULL, EXT, NULL);
        pthread_join(t1,NULL);
        pthread_join(t2,NULL);
        pthread_join(t3,NULL);
        sem_destroy(&s1);
        sem_destroy(&s2);

        close(server_socket);

        return 0;

}