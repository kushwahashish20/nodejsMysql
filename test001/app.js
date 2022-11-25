
const http = require('http');
const server = http.createServer((request,response)=>{
    if(request.url=="/"){

        response.write("writable in nodejs")
      }
        if(request.url == "/about-us"){
            response.end("index.html")
        }
        else{
            response.end("home")
        }
    
   
})
server.listen(3002);