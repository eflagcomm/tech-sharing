function route(handler,pathname,response,param)
{
  if(typeof handler[pathname] === "function")
  {
    console.log(pathname+"is about to be routed");
    handler[pathname](response,param);
  }
  else
  {
    console.log("No handler for "+pathname);
  }
}

exports.route = route;
