$.searchtabevent = {
  table : null,
  html : null,
  count : 0,
  
  add : function(){
    table.append(html);
    $.parser.parse(table.find("tr:last"));
    $.ajax({
      url : "http://localhost:8888/getcolumn",
      dataType : "json",
      success:function(data,status){
       //  var val = $.parseJSON(data);
         $.each(data["res"],function(n,valu){
           table.find("tr:last td:eq(1) select").append("<option value='"+valu['COLUMN_NAME']+"'>"+valu['COLUMN_NAME']+"</option>");
         });
       $.parser.parse(table.find("tr:last"));
       }
    } );
  },
  remove : function(){
     if(table.find("tr").length ===1)
         return;
     table.find("tr:last").remove();
  },
  search : function(){
    var query = "";
    table.find("tr").each(function(){
      if($(this).find("td select.connector").length>0)
        query+=$(this).find("td select.connector").combobox("getValue");
      if($(this).find("td select.key").length>0)
        query+=$(this).find("td select.key").combobox("getValue");
      if($(this).find("td select.operater").length>0)
        query+=$(this).find("td select.operater").combobox("getValue");
      if($(this).find("td input.inputbox").length>0)
        query+="'"+$(this).find("td input.inputbox").textbox("getValue")+"'";
     });
    alert(query);
    $("#dg").datagrid({
      url:"http://localhost:8888/test?condition="+query
    });
    $("#dg").datagrid('reload');
  },  
  init : function(tab,addbutton,removebutton,searchbutton){
    table = tab;
    html = "<tr>"
        +  "<td>"
        +  "<select id=\"connector\" name=\"connectorname\" class=\"easyui-combobox connector\">" 
        +  "<option value=' and '>AND</option>"
        +  "<option value=' or '>OR</option>"
        +  "</select>"
        +  "</td>"
        +  "<td>"
        +  "<select id=\"key\" name=\"keyname\" class=\"easyui-combobox key\">"
        +  "</select>"
        +  "</td>"
        +  "<td>"
        +  "<select id=\"operater\" name=\"operater\" class=\"easyui-combobox operater\">"
        +  "<option value='='>=</option>"
        +  "<option value='>'>></option>"
        +  "<option value='>='>>=</option>"
        +  "<option value='<'><</option>"
        +  "<option value='<='><=</option>"
        +  "</select>"
        +  "</td>"
        +  "<td>"
        +  "<input class='easyui-textbox inputbox' type='text'>"
        +  "</td>";
        +  "</tr>" 
    addbutton.click($.searchtabevent.add);
    removebutton.click($.searchtabevent.remove); 
    searchbutton.click($.searchtabevent.search);
    $.ajax({
      url : "http://localhost:8888/getcolumn",
      dataType : "json",
      success:function(data,status){
       //  var val = $.parseJSON(data);
         $.each(data["res"],function(n,valu){
           table.find("tr:first td:eq(1) select").append("<option value='"+valu['COLUMN_NAME']+"'>"+valu['COLUMN_NAME']+"</option>");
         });
       $.parser.parse(table.find("tr:last"));
       }
    } );

  },
}
