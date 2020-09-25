

#ifndef PG_HELPER_H
#define PG_HELPER_H


#include <unistd.h>          

void    Error_Quit(char const * msg);
int     Trim      (char * buffer);
int     StrUpper  (char * buffer);
void    CleanURL  (char * buffer);
ssize_t Readline  (int sockd, void *vptr, size_t maxlen);
ssize_t Writeline (int sockd, const void *vptr, size_t n);



#define LISTENQ          (1024)


#endif  
