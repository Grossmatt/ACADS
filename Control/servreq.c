#include <stdio.h>
#include <errno.h>

#include "helper.h"
#include "reqhead.h"
#include "resphead.h"
#include "resource.h"




int Service_Request(int conn) {

    struct ReqInfo  reqinfo;
    int             resource = 0;

    InitReqInfo(&reqinfo);

    
    

    if ( Get_Request(conn, &reqinfo) < 0 )
	return -1;


    if ( reqinfo.status == 200 )
	if ( (resource = Check_Resource(&reqinfo)) < 0 ) {
	    if ( errno == EACCES )
		reqinfo.status = 401;
	    else
		reqinfo.status = 404;
	}

    

    if ( reqinfo.type == FULL )
	Output_HTTP_Headers(conn, &reqinfo);


    

    if ( reqinfo.status == 200 ) {
	if ( Return_Resource(conn, resource, &reqinfo) )
	    Error_Quit("Something wrong returning resource.");
    }
    else
	Return_Error_Msg(conn, &reqinfo);

    if ( resource > 0 )
	if ( close(resource) < 0 )
	    Error_Quit("Error closing resource.");
    FreeReqInfo(&reqinfo);

    return 0;
}




