#include <stdio.h>
#include <stdlib.h>

#include <sys/types.h>
#include <sys/socket.h>

#include <netinet/in.h>
//#include <arpa/inet.h>
#include <unistd.h>
#define true 1
char server_message[256] = "exit";


int main() {
	int network_socket = socket(AF_INET, SOCK_STREAM, 0);
	
	struct sockaddr_in server_address;
	
	server_address.sin_family = AF_INET;
	server_address.sin_port = htons(1337);
	server_address.sin_addr.s_addr = INADDR_ANY; //inet_addr("192.168.6.55");
	char server_response[256];
	while(true)
	{
		printf("Enter command1: ");
		scanf("%s", server_message);
		network_socket = socket(AF_INET, SOCK_STREAM, 0);
		int connection_status = connect(network_socket, (struct sockaddr *) &server_address, sizeof(server_address));
		if(connection_status == -1){
			printf("There was an erorr making a connection to remote socket \n\n");
		}
		else{
			send(network_socket, &server_message, sizeof(server_message), 0);
			recv(network_socket, &server_response, sizeof(server_response), 0);
			printf("The server sent the data: %s\n", server_response);
		}
	}
	
	close(network_socket);
	
	return 0;

}