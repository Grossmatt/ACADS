#include <sys/time.h>            

#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#include "reqhead.h"
#include "servreq.h"
#include "helper.h"




int Parse_HTTP_Header(char * buffer, struct ReqInfo * reqinfo) {

    static int first_header = 1;
    char      *temp;
    char      *endptr;
    int        len;


    if ( first_header == 1 ) {

                          

	if ( !strncmp(buffer, "GET ", 4) ) {
	    reqinfo->method = GET;
	    buffer += 4;
	}
	else if ( !strncmp(buffer, "HEAD ", 5) ) {
	    reqinfo->method = HEAD;
	    buffer += 5;
	}
	else {
	    reqinfo->method = UNSUPPORTED;
	    reqinfo->status = 501;
	    return -1;
	}



	while ( *buffer && isspace(*buffer) )
	    buffer++;



	endptr = strchr(buffer, ' ');
	if ( endptr == NULL )
	    len = strlen(buffer);
	else
	    len = endptr - buffer;
	if ( len == 0 ) {
	    reqinfo->status = 400;
	    return -1;
	}



	reqinfo->resource = calloc(len + 1, sizeof(char));
	strncpy(reqinfo->resource, buffer, len);
                       

	if ( strstr(buffer, "HTTP/") )
	    reqinfo->type = FULL;
	else
	    reqinfo->type = SIMPLE;

	first_header = 0;
	return 0;
    }

         

    endptr = strchr(buffer, ':');
    if ( endptr == NULL ) {
	reqinfo->status = 400;
	return -1;
    }

    temp = calloc( (endptr - buffer) + 1, sizeof(char) );
    strncpy(temp, buffer, (endptr - buffer));
    StrUpper(temp);

                

    buffer = endptr + 1;
    while ( *buffer && isspace(*buffer) )
	++buffer;
    if ( *buffer == '\0' )
     	return 0;


\

    if ( !strcmp(temp, "USER-AGENT") ) {
	    reqinfo->useragent = malloc( strlen(buffer) + 1 );
	    strcpy(reqinfo->useragent, buffer);
    }
    else if ( !strcmp(temp, "REFERER") ) {
	    reqinfo->referer = malloc( strlen(buffer) + 1 );
	    strcpy(reqinfo->referer, buffer);
    }

    free(temp);
    return 0;
}

            

int Get_Request(int conn, struct ReqInfo * reqinfo) {

    char   buffer[MAX_REQ_LINE] = {0};
    int    rval;
    fd_set fds;
    struct timeval tv;




    tv.tv_sec  = 5;
    tv.tv_usec = 0;

               

    do {



	FD_ZERO(&fds);
	FD_SET (conn, &fds);



	rval = select(conn + 1, &fds, NULL, NULL, &tv);




	if ( rval < 0 ) {
	    Error_Quit("Error calling select() in get_request()");
	}
	else if ( rval == 0 ) {



	    return -1;

	}
	else {


	    Readline(conn, buffer, MAX_REQ_LINE - 1);
	    Trim(buffer);

	    if ( buffer[0] == '\0' )
		break;

	    if ( Parse_HTTP_Header(buffer, reqinfo) )
		break;
	}
    } while ( reqinfo->type != SIMPLE );

    return 0;
}



void InitReqInfo(struct ReqInfo * reqinfo) {
    reqinfo->useragent = NULL;
    reqinfo->referer   = NULL;
    reqinfo->resource  = NULL;
    reqinfo->method    = UNSUPPORTED;
    reqinfo->status    = 200;          
}



void FreeReqInfo(struct ReqInfo * reqinfo) {
    if ( reqinfo->useragent )
	free(reqinfo->useragent);
    if ( reqinfo->referer )
	free(reqinfo->referer);
    if ( reqinfo->resource )
	free(reqinfo->resource);
}
