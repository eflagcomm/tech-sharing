var mysql = require("mysql");
function index(response,param)
{
  console.log("index has been called");
  response.writeHead(200,{ContentType:"application/json","Access-Control-Allow-Origin":"*"});
  var sql = "select * from student";
  if(param.condition)
    sql += " where "+param.condition;
  var sqlconnection = mysql.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password : 'root',
    port : '3306',
    database : 'test'
  });
  sqlconnection.connect(function(err){
    if(err){
      console.log("connect failed");
      return;
    }  
    console.log("connect succeed!");
  });
  console.log(sql);
  sqlconnection.query(sql,function(err,rows,fields){
    if(err){
      console.log("select failed");
    }
    var retjson = {
      rows:rows,
      total:10
    };
    response.write(JSON.stringify(retjson));
    response.end();
    //returnobj["result"] = rows;
    console.log(retjson);
  });
  
 // return returnobj; 
}
function edituser(response,param){
  response.writeHead(200,{ContentType:"application/json","Access-Control-Allow-Origin":"*"});
  var sqlconnection = mysql.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password : 'root',
    port : '3306',
    database : 'test'
  });
  var result = {};
  sqlconnection.connect(function(err){
    if(err){
      console.log("connect failed:"+err);
      result.errorMsg="connect failed";
      response.write(JSON.stringify(result));
      response.end();
      return;
    }
    console.log("connect succeed!");
  });
  sqlconnection.query("update student set name = ?,age = ? where id = ?",[param.name,param.age,param.id],function(err){
    if(err){
      console.log("update failed");
      result.errorMsg="update failed";
      response.write(JSON.stringify(result));
      response.end();
      return;
    }
    console.log("update succeed!");
    result.success=true;
    response.write(JSON.stringify(result));
    response.end();
  }); 
}
function newuser(response,param){
  response.writeHead(200,{ContentType:"application/json","Access-Control-Allow-Origin":"*"});
  var sqlconnection = mysql.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password : 'root',
    port : '3306',
    database : 'test'
  });
  var result = {};
  sqlconnection.connect(function(err){
    if(err){
      console.log("connect failed:"+err);
      result.errorMsg="connect failed";
      response.write(JSON.stringify(result)); 
      response.end();
      return;
    }
    console.log("connect succeed!");
  });
  sqlconnection.query("insert into student(name,age) values(?,?)",[param.name,param.age],function(err){
    if(err){
      console.log("insert failed");
      result.errorMsg="insert failed";
      response.write(JSON.stringify(result));
      response.end();
      return;
    }
    console.log("insert succeed!"+JSON.stringify(param));
    result.success=true;
    response.write(JSON.stringify(result));
    response.end();
  });
}
function destroyuser(response,param){ 
  response.writeHead(200,{ContentType:"application/json","Access-Control-Allow-Origin":"*"});
  var sqlconnection = mysql.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password : 'root',
    port : '3306',
    database : 'test'
  });
  var result = {};
  sqlconnection.connect(function(err){
    if(err){
      console.log("connect failed:"+err);
      result.errorMsg="connect failed";
      response.write(JSON.stringify(result));
      response.end(); 
      return;
    }
    console.log("connect succeed!");
  });
  sqlconnection.query("delete from student where id = ?",[param.id],function(err){
    if(err){
      console.log("delete failed");
      return;
    }
    console.log("delete succeed!");
    result.success=true;
    response.write(JSON.stringify(result));
    response.end();
  });
}
function getColumn(response,param){
  response.writeHead(200,{ContentType:"application/json","Access-Control-Allow-Origin":"*"});
  var sqlconnection = mysql.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password : 'root',
    port : '3306',
    database : 'information_schema'
  });
  var result = {};
  sqlconnection.connect(function(err){
    if(err){
      console.log("connect failed:"+err);
      result.errorMsg="connect failed";
      response.write(JSON.stringify(result));
      response.end(); 
      return;
    }
    console.log("connect succeed!");
  });
  sqlconnection.query("select COLUMN_NAME from COLUMNS where table_name = 'student' and table_schema = 'test'",function(err,rows){
    if(err){
      console.log("getting columns failed");
      return;
    }
    result.res=rows;
    console.log("getting columns succeed "+JSON.stringify(result));
    response.write(JSON.stringify(result));
    response.end();

  });

}
exports.index = index;
exports.newuser = newuser;
exports.edituser = edituser;
exports.destroyuser = destroyuser;
exports.getcolumn = getColumn;
