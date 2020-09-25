#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <stdio.h>
#include "resource.h"
#include "reqhead.h"
#include "helper.h"


             

static char server_root[1000] = "/opt/acads/Control/html";



int Return_Resource(int conn, int resource, struct ReqInfo * reqinfo) {

    char c;
    int  i;

    while ( (i = read(resource, &c, 1)) ) {
	if ( i < 0 )
	    Error_Quit("Error reading from file.");
	if ( write(conn, &c, 1) < 1 )
	    Error_Quit("Error sending file.");
    }

    return 0;
}



int Check_Resource(struct ReqInfo * reqinfo) {



    CleanURL(reqinfo->resource);



    strcat(server_root, reqinfo->resource);
    return open(server_root, O_RDONLY);
}



int Return_Error_Msg(int conn, struct ReqInfo * reqinfo) {
    
    char buffer[100];

    sprintf(buffer, "<HTML>\n<HEAD>\n<TITLE>Server Error %d</TITLE>\n"
	            "</HEAD>\n\n", reqinfo->status);
    Writeline(conn, buffer, strlen(buffer));

    sprintf(buffer, "<BODY>\n<H1>Server Error %d</H1>\n", reqinfo->status);
    Writeline(conn, buffer, strlen(buffer));

    sprintf(buffer, "<P>The request could not be completed.</P>\n"
	            "</BODY>\n</HTML>\n");
    Writeline(conn, buffer, strlen(buffer));

    return 0;

}
