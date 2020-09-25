#include <sys/socket.h>      
#include <sys/types.h>       
#include <sys/wait.h>         
#include <arpa/inet.h>        
#include <unistd.h>           

#include <stdio.h>
#include <stdlib.h>

#include "helper.h"
#include "servreq.h"

#define SERVER_PORT            (10000)




int main(int argc, char *argv[]) {

    int    listener, conn;
    pid_t  pid;
    struct sockaddr_in servaddr;
    

    

    if ( (listener = socket(AF_INET, SOCK_STREAM, 0)) < 0 )
	Error_Quit("Couldn't create listening socket.");


    

    memset(&servaddr, 0, sizeof(servaddr));
    servaddr.sin_family      = AF_INET;
    servaddr.sin_addr.s_addr = htonl(INADDR_ANY);
    servaddr.sin_port        = htons(SERVER_PORT);


     

    if ( bind(listener, (struct sockaddr *) &servaddr, sizeof(servaddr)) < 0 )
	Error_Quit("Couldn't bind listening socket.");


    

    if ( listen(listener, LISTENQ) < 0 )
	Error_Quit("Call to listen failed.");


    

    while ( 1 ) {

	

	if ( (conn = accept(listener, NULL, NULL)) < 0 )
	    Error_Quit("Error calling accept()");


	

	if ( (pid = fork()) == 0 ) {



	    if ( close(listener) < 0 )
		Error_Quit("Error closing listening socket in child.");
	    
	    Service_Request(conn);


	    

	    if ( close(conn) < 0 )
		Error_Quit("Error closing connection socket.");
	    exit(EXIT_SUCCESS);
	}



	if ( close(conn) < 0 )
	    Error_Quit("Error closing connection socket in parent.");

	waitpid(-1, NULL, WNOHANG);
    }

    return EXIT_FAILURE;    
}
