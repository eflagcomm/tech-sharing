
    /************************* 工具函数 开始 ****************************/
    //数值排序
    function sortNumeric(a,b){
        a = a.replace(/,/,'.');
        b = b.replace(/,/,'.');
        a = a.replace(/[^\d\-\.\/]/g,'');
        b = b.replace(/[^\d\-\.\/]/g,'');
        if(a.indexOf('/')>=0)a = eval(a);
        if(b.indexOf('/')>=0)b = eval(b);
        return a/1 - b/1;
    }

    //字符串排序
    function sortString(a, b) {             // 数据类型: 字符串
      //条件判断 a, b 大小
      if (a.toUpperCase() < b.toUpperCase()) return -1;
      if (a.toUpperCase() > b.toUpperCase()) return 1;
      return 0;
    }

    //以下载的形式保存文件
    function doSave(value, type, name) {
        var blob;
        if (typeof window.Blob == "function") { // typeof: 数据类型判断
            blob = new Blob([value], {type: type});
        } else {
            var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
            var bb = new BlobBuilder();
            bb.append(value);
            blob = bb.getBlob(type);
        }
        var URL = window.URL || window.webkitURL;
        var bloburl = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        if ('download' in anchor) {
            anchor.style.visibility = "hidden";
            anchor.href = bloburl;
            anchor.download = name;
            document.body.appendChild(anchor);
            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", true, true);
            anchor.dispatchEvent(evt);
            document.body.removeChild(anchor);
        } else if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, name);
        } else {
            location.href = bloburl;
        }
    }
    /************************* 工具函数 结束 ****************************/

    /************************* 事件处理函数 开始 ****************************/
    //表头高亮
    function highlightTableHeader()
    {
        this.className='tableWigdet_headerCellOver';
    }

    //表头停止高亮
    function deHighlightTableHeader()
    {
        this.className='tableWidget_headerCell';
    }

    //表头鼠标按下
    function mousedownTableHeader()
    {
        this.className='tableWigdet_headerCellDown';
    }

    //取消table事件
    function cancelTableWidgetEvent()
    {
        return false;
    }

    //行高亮
    function highlightDataRow()
    {
        // if(navigator.userAgent.indexOf('Opera')>=0)return;
        this.className='tableWidget_dataRollOver';
    }

    //行停止高亮
    function deHighlightDataRow()
    {
        // if(navigator.userAgent.indexOf('Opera')>=0)return;
        this.className=null;
    }
     /************************* 事件处理函数 结束 ****************************/

     /************************* 主体功能函数 开始****************************/
    //增加 onload 事件函数
    function addLoadEvent(func)
     {
        var oldOnload = window.onload;
        if (typeof window.onload != 'function') {
            window.onload = func;
        } else {
            window.onload = function() {
                oldOnload();
                func();
            }
        }
     }

     //读  json 文件到预览窗口, 没使用 jQuery
     function preparePreview()
     {
        var fileInput = document.getElementById("json_file");
        var preview = document.getElementsByTagName("textarea");
        fileInput.onchange = function () {
            var file = fileInput.files[0];
            var rel = /[0-9a-zA-Z].\.json$/;
            if (!rel.test(file.name)) {
                alert("不是json文件");
                return;
            }
            var reader = new FileReader();
            reader.onload = function(e) {
                    preview[0].defaultValue = e.target.result;
                };
            reader.readAsText(file);
        };
     }

    //从预览窗口读取 json 并追加到 table 中: 使用 jQuery
     function prepareReadJson()
     {
        var trig_json= $('#btn_json');
        trig_json.on('click', function () {
            //把 json 字符串 -> 对象
            var info = JSON.parse($('[name=json_area]').val());
            //生成所有表行, 通过 for...of 循环变量对象
            for (var item of info.engineer_info) {
                var line = "<tr>";
                for (var key in item) {
                    line += "<td ";
                    if (key == "Age" || key == "Income") {
                        line += 'style="text-align: right;"';
                    }
                    line += ">";
                    line += item[key];
                    line += "</td>";
                }
                line += "</tr>";
                $('.scrollingContent').append(line);
            }
        });
     }

     //保存table行到 json 文件: 使用 jQuery
     function prepareSaveJson()
     {
          var t_name = ["Name", "Age", "Position", "Income", "Gender"];
          var trig_save_json= $('#btn_save');

          trig_save_json.on('click', function () {
               //遍历 table 构建JSON对象
               var e_info = {};
               e_info.engineer_info = [];
               for (var row of $('.scrollingContent>tr')) {
                    var small_obj = {};
                    for (var i =0; i<row.children.length; i++) {
                        var cell = row.children[i];
                         var value = cell.firstChild.nodeValue;
                         small_obj[t_name[i]] = value;
                    }
                    e_info.engineer_info.push(small_obj);
               }
               //序列化JSON对象
               var str = JSON.stringify(e_info, null, ' ');
               //保存文件
               var name_save = $("[name=save_name]").val();
               doSave(str,  "text/latex",  name_save);
        });
     }

    //表排序
    function sortTable()
    {
        if(!tableWidget_okToSort)return;
        tableWidget_okToSort = false;
        /* Getting index of current column */
        var obj = this;
        var indexThis = 0;
        while(obj.previousSibling){
            obj = obj.previousSibling;
            if(obj.tagName=='TD')indexThis++;
        }
        var images = this.getElementsByTagName('IMG');

        if(this.getAttribute('direction') || this.direction){
            direction = this.getAttribute('direction');
            if(navigator.userAgent.indexOf('Opera')>=0)direction = this.direction;
            if(direction=='ascending'){
                direction = 'descending';
                this.setAttribute('direction','descending');
                this.direction = 'descending';
            }else{
                direction = 'ascending';
                this.setAttribute('direction','ascending');
                this.direction = 'ascending';
            }
        }else{
            direction = 'ascending';
            this.setAttribute('direction','ascending');
            this.direction = 'ascending';
        }

        //切换图片显示
        if(direction=='descending'){
            images[0].style.display='inline';
            images[0].style.visibility='visible';
            images[1].style.display='none';
        }else{
            images[1].style.display='inline';
            images[1].style.visibility='visible';
            images[0].style.display='none';
        }

        //TODO, 获取一个东西搞这么麻烦, 真是服了
        var tableObj = this.parentNode.parentNode.parentNode;
        var tBody = tableObj.getElementsByTagName('TBODY')[0];

        //YYR, 第几个 table, table 只有一个, 可以精简
        var widgetIndex = tableObj.id.replace(/[^\d]/g,'');
        //YYR, 第几个 sort array
        var sortMethod = tableWidget_arraySort[widgetIndex][indexThis]; // N = numeric, S = String
        //
        if(activeColumn[widgetIndex] && activeColumn[widgetIndex]!=this){
            var images = activeColumn[widgetIndex].getElementsByTagName('IMG');
            images[0].style.display='none';
            images[1].style.display='inline';
            images[1].style.visibility = 'hidden';
            if(activeColumn[widgetIndex])activeColumn[widgetIndex].removeAttribute('direction');
        }

        //YYR, 第 widgetINdex 的 table 哪个列是激活的
        activeColumn[widgetIndex] = this;

        var cellArray = new Array();
        var cellObjArray = new Array();

        for(var no=1; no<tableObj.rows.length; no++){
            var content= tableObj.rows[no].cells[indexThis].innerHTML+'';
            cellArray.push(content);
            cellObjArray.push(tableObj.rows[no].cells[indexThis]);
        }

        //开始排序
        if(sortMethod=='N'){
            cellArray = cellArray.sort(sortNumeric);
        }else{
            cellArray = cellArray.sort(sortString);
        }

        //根据排序结果移动 表格行
        if(direction=='descending'){
            for(var no=cellArray.length;no>=0;no--){
                for(var no2=0;no2<cellObjArray.length;no2++){
                    if(cellObjArray[no2].innerHTML == cellArray[no] && !cellObjArray[no2].getAttribute('allreadySorted')){
                        cellObjArray[no2].setAttribute('allreadySorted','1');
                        tBody.appendChild(cellObjArray[no2].parentNode);
                    }
                }
            }
        }else{
            for(var no=0;no<cellArray.length;no++){
                for(var no2=0;no2<cellObjArray.length;no2++){
                    if(cellObjArray[no2].innerHTML == cellArray[no] && !cellObjArray[no2].getAttribute('allreadySorted')){
                        cellObjArray[no2].setAttribute('allreadySorted','1');
                        tBody.appendChild(cellObjArray[no2].parentNode);
                    }
                }
            }
        }

        for(var no2=0;no2<cellObjArray.length;no2++){
            cellObjArray[no2].removeAttribute('allreadySorted');
        }

        tableWidget_okToSort = true;
    }

    //初始化table
    function initTableWidget(objId,width,height,sortArray)
    {
        width = width + '';
        height = height + '';
        var obj = document.getElementById(objId);
        obj.parentNode.className='widget_tableDiv';
        tableWidget_arraySort[tableWidget_tableCounter] = sortArray;

        if(width.indexOf('%')>=0){
            obj.style.width = width;
            obj.parentNode.style.width = width;
        }else{
            obj.style.width = width + 'px';
            obj.parentNode.style.width = width + 'px';
        }

        if(height.indexOf('%')>=0){
            //obj.style.height = height;
            obj.parentNode.style.height = height;
        }else{
            //obj.style.height = height + 'px';
            obj.parentNode.style.height = height + 'px';
        }


        obj.id = 'tableWidget' + tableWidget_tableCounter;  //table id 变更: myTable -> tableWidget0

        obj.cellSpacing = 0;
        obj.cellPadding = 0;
        obj.className='tableWidget';

        //表头处理
        var tHead = obj.getElementsByTagName('THEAD')[0];
        var cells = tHead.getElementsByTagName('TD');
        var arrowImagePath = "img/";
        for(var no=0;no<cells.length;no++){
            cells[no].className = 'tableWidget_headerCell';
            cells[no].onselectstart = cancelTableWidgetEvent;
            if(no==cells.length-1){
                cells[no].style.borderRight = '0px';
            }
            //给表头的每个单元格设置 事件处理函数
            if(sortArray[no]){
                cells[no].onmouseover = highlightTableHeader;
                cells[no].onmouseout = deHighlightTableHeader;
                cells[no].onmousedown = mousedownTableHeader;
                cells[no].onmouseup = highlightTableHeader;
                cells[no].onclick = sortTable;

                var img = document.createElement('IMG');
                img.src = arrowImagePath + 'arrow_up.gif';
                cells[no].appendChild(img);
                img.style.visibility = 'hidden';

                var img = document.createElement('IMG');
                img.src = arrowImagePath + 'arrow_down.gif';
                cells[no].appendChild(img);
                img.style.display = 'none';
            }else{
                cells[no].style.cursor = 'default';
            }
        }

        //body 处理
        var tBody = obj.getElementsByTagName('TBODY')[0];
        {
            tBody.className='scrollingContent';
            if(tBody.offsetHeight>(tBody.parentNode.parentNode.offsetHeight - 50)) {
                tBody.style.height = (obj.parentNode.clientHeight-tHead.offsetHeight) + 'px';
            }else{
                tBody.style.overflow='hidden';
            }
        }

        for(var no=1;no<obj.rows.length;no++){
            //安装事件处理器
            obj.rows[no].onmouseover = highlightDataRow;
            obj.rows[no].onmouseout = deHighlightDataRow;

            for(var no2=0;no2<sortArray.length;no2++){
                if(sortArray[no2] && sortArray[no2]=='N') {
                 obj.rows[no].cells[no2].style.textAlign='right';
             }
            }
        }
        for(var no2=0;no2<sortArray.length;no2++){  /* Right align numeric cells */
            if(sortArray[no2] && sortArray[no2]=='N') {
                obj.rows[0].cells[no2].style.textAlign='right';
            }
        }

        tableWidget_tableCounter++;
    }
     /*************************  主体功能函数 结束 ****************************/