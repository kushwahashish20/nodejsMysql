const http = require('http');
const server = http.createServer((request,response)=>{
    if(request.url=="/"){

        response.write("writable in nodejs")
      }
        if(request.url == "/about-us"){
            response.end("aboyut us")
        }
        else{
            response.end("home")
        }
    
   
})
server.listen(3000);