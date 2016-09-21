var url = 'empty';
function newUser()
{
  $('#dlg').dialog('open').dialog('setTitle','New User');
  $('#fm').form('clear');
  url='http://localhost:8888/newuser';
}
function editUser()
{
  var row = $('#dg').datagrid('getSelected');
  if(row){
    $('#dlg').dialog('open').dialog('setTitle','Edit User');
    $('#fm').form('load',row);
    url = 'http://localhost:8888/edituser?id='+row.id;
  }
}
function destroyUser()
{
  var row = $('#dg').datagrid('getSelected');
  if(row){
    $.messager.confirm('Confirm','Are you sure you want to destroy this user?',function(r){
      if(r){
        $.post('http://localhost:8888/destroyuser',{id:row.id},function(result){
          if(result.success){
            $('#dg').datagrid({
              url:"http://localhost:8888/test"
            });
            $('#dg').datagrid('reload');
          }else{
            $.messager.show({
              title:'Error',
              msg:result.errorMsg
            });
          }
        },'json');
      }
    });
  }
}
function saveUser(){
  $('#fm').form('submit',{
    url:url,
    onSubmit:function(){
      return $(this).form('validate');
    },
    success:function(result){
      if(result.errorMsg){
        $.messager.show({
          title:'Error',
          msg:result.errorMsg
        });
      }else{
        $('#dlg').dialog('close');
        $('#dg').datagrid({
          url:"http://localhost:8888/test"
        });
        $('#dg').datagrid('reload');
      }
    },
  });
}
