var http = require("http");
var url = require("url");
var objectAssign = require("object-assign");
var query = require("querystring");
function start(route,handler) {
  function onRequest(request,response)
  {
    console.log("Request received");
    var pathname = url.parse(request.url).pathname;
    if(request.method=="GET")
    {
      var param = [];
      param = url.parse(request.url,true).query;
      route(handler,pathname,response,param);     
      
    } 
    else
    {
      var postdata = "";
      request.addListener("data",function(postchunk){
        postdata += postchunk;
      });
      request.addListener("end",function(){
        var param = [];
        param = objectAssign(url.parse(request.url,true).query,query.parse(postdata)); 
        route(handler,pathname,response,param);     
      });
    }

    /*if(typeof(content) != "object")
      return;
    console.log(content["result"]);
    console.log(content["header"]);
    response.writeHead(200,content["header"]);
    response.write(content["result"]+""); 
    response.end();*/
  }
  http.createServer(onRequest).listen(8888);
  console.log("server has started");
}
exports.start = start;
