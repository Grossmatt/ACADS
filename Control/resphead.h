#ifndef PG_RESPHEAD_H
#define PG_RESPHEAD_H


#include "reqhead.h"         
int Output_HTTP_Headers(int conn, struct ReqInfo * reqinfo);


#endif
