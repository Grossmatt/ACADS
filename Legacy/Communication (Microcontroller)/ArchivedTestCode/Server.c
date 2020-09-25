#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include <arpa/inet.h>

#include <sys/types.h>
#include <sys/socket.h>

#include <netinet/in.h>

#define MAX_PACKET_SIZE 256

int serverInit(int server_socket){
        char server_message[256] = "you have reached server\n";

        int client_socket;

        server_socket = socket(AF_INET, SOCK_STREAM, 0);

                if (server_socket == -1) {
                        printf("socket creation failed...\n");
                        exit(0);
                }
                else
                        printf("Socket successfully created..\n");

        struct sockaddr_in server_address;
        server_address.sin_family = AF_INET;
        server_address.sin_port = htons(5535);
        server_address.sin_addr.s_addr = inet_addr("10.0.0.1");

        bind(server_socket, (struct sockaddr*) &server_address, sizeof(server_address));

        listen(server_socket, 5);

        client_socket = accept(server_socket, NULL, NULL);

        send(client_socket, server_message, sizeof(server_message), 0);

        return(client_socket);
}

void communication(int client_socket){
        char buffer[MAX_PACKET_SIZE];
        int i;
        while(1){
                bzero(buffer, MAX_PACKET_SIZE); 

                read(client_socket, buffer, sizeof(buffer));

                printf("New: %s\n", buffer);

                if (strncmp("exit", buffer, 4) == 0){
                        printf("Server Exit...\n");
                        break;
                }
                else if(strncmp("test", buffer, 4) == 0){
                        char test[256] = "feedback, 22";
                        send(client_socket, test, sizeof(test), 0);
                }
        }
}

int main() {
        int client_socket, server_socket;

        client_socket = serverInit(server_socket);

        communication(client_socket);

        close(server_socket);

        return 0;
}