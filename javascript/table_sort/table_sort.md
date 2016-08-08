
# javascript 总结
## 引子
- 最近在学习 javascript, 我做了一个 demo 页面, 现在围绕着这个 demo 向大家分享一下学习情况.

  这是我目前的理解, 其中可能有不正确的地方, 请大家多多指教.


##  背景介绍
#### 1.javascript简史
  - javascript 出现之前: 浏览器只支持静态html, javascript 出现后, 网页的交互性的到了显著改善
  - javascript 的第一个版本: 出现在 Netscape Navigator 2浏览器中
  - 之后 Netscape 和 Sun 联合 ECMA 对 javascript 进行了标准化, 出现了 ECMAScript 语言, 这就是 javascript
  - javascript 是一种脚本语言, 通常只能通过 web 浏览器去执行而不能独立运行, 所以应用上没有 C++, Java 广泛

#### 2.DOM 简介
  - W3C对DOM的定义: 一个与系统平台和编程语言无关的接口, 程序和脚本可以通过这个接口动态的访问和修改文档的内容, 结构和样式"
  - 在 javascript 代码中可以使用 DOM 来操控 web文档 的内容, 结构, 样式

## table 示例简介
#### 1.功能简介
这是一个员工信息表, 包含以下功能

- 员工信息展示, 包含内容包括: Name, Age, Position, Income, Gender
- 排序功能: 目前只支持 name, age, income 排序(升序或降序)
- 导入文件: 可以从 json 文件导入员工信息, 预览 json 文件, 并显示到表格中
- 导出文件: 可以把当前员工信息表导出为一个 json 文件

此外, 在鼠标经过表头时会有一些特效

- 鼠标移到表头某一列时, 该列边缘会有高亮, 移出时高亮消失(但 'Position' 列无此功能)

#### 2.目录结构简介

分离 html, css, js 是一个优秀的编程实践, 具体可参考
  `<<Javascript DOM 编程艺术-中文版>>` 5,3, 5.4 节

- table_sort.html: 页面结构 html 文件
- lib 目录: 放置需要导入的 js 文件
- css 目录: 放置需要导入的 样式文件
- img 目录: 放置图片资源
- file 目录: 放置 json 文件

## 通过table 示例来学习 javascript
#### 1.如何在 html 中使用 javascript
- 方式一: 在 script 标签之间写 javascript 代码

  特点: 简单明了
``` javascript
<script type="text/javascript">
    var tableWidget_tableCounter = 0;
    //...
</script>
```
- 方式二: 通过 script 标签的 src 属性导入独立的 js 文件

  特点: 控制逻辑 和 web 文档分类, 结构清晰
``` javascript
<script type="text/javascript" src="./lib/table_sort_tool.js"> </script>
```

#### 2.如何添加注释
通过 demo 演示可以看到

- 方式一: 使用 //,   eg. `//全局变量`
- 方式二: 使用　/**/, eg. `/* 注册 window.onload 事件处理函数 */`

#### 3.如何定义变量

- 通过 var来定义变量:
  eg. `var tableWidget_tableCounter = 0;`
- 命名规则: 只能使用 数字, 字母, _, $, 且不能用数字开头

#### 4.如何定义函数

- 方式一: 普通函数
``` javascript
    function sortString(a, b) {
      if ( a.toUpperCase() < b.toUpperCase() ) return -1;
      if ( a.toUpperCase() > b.toUpperCase() ) return 1;
      return 0;
    }
````
- 方式二: 匿名函数
``` javascript
    /* 注册 window.onload 事件处理函数 */
    window.onload = function () {
        addLoadEvent(preparePreview());
        addLoadEvent(prepareReadJson());
        addLoadEvent(prepareSaveJson());
        addLoadEvent(initTableWidget('myTable',500,600,Array('S','N',false,'N','S')));
    };
````

#### 5.如何调试

- 通过打印信息调试:  eg.使用 alert(), console.log()
- 通过chrome 开发者工具调试

#### 6.javascript 的执行过程
相信大家第一次在 html 中看到多个 `script` 标签时都会对它的执行顺序感到迷惑, 这么多`script `标签, 到底如何运行啊 !

- 按代码块块执行代码, 所谓代码块就是使用`script`标签分隔的代码段

- 浏览器在解析html文档流的时候, 如果遇到一个`script`标签, 则js会等到这个代码块都加载完之后再对代码进行预编译, 然后再执行.
  执行完毕后，浏览器会继续解析西门的html文档流，同时js也准备好处理下一个代码块

- 不同块都属于一个全局作用域, 所以块之间的变量和函数是可以共享的

- 为了安全起见, 一般在页面初始化完毕之后才允许js代码执行, 这样就可以避免一些网速对js执行的影响. 同时，也避开了html文档流对js执行的限制


#### 7.demo 的执行过程
上面提到 "页面初始化完毕之后才允许js代码执行", 本 demo 就采用这种做法

- 在 `<head>` 中导入 js文件: jquery-3.1.0.min.js, table\_sort\_tool.js, 其中 table\_sort\_tool.js 只是定义页面的控制函数, 并没有执行具体的 javascript 语句

- 在 `<body>` 结尾的 script 是整个 demo 的入口, 此处定义了
  - javascript 用到的全局变量
  - window.onload 事件处理函数注册

   　  onload 事件在页面完成加载时触发, 在此处执行 javascript 的初始化流程再好不过 !
- 初始化流程中注册了相应的处理函数, 这是 demo 的核心功能


## 基本知识点

#### 1.数据类型

- number, 字符串, bool, 字符串, 比较简单, 一带而过

- 数组
``` javascript
//写法一 使用　new Array
var tableWidget_arraySort = new Array();
var mycars=new Array("Saab","Volvo","BMW");
//写法二 用 '[...]' 表示
var t_name = ["Name", "Age", "Position", "Income", "Gender"];
```
- 对象:
  由若干键值对组成, 键都是字符串类型，值可以是任意数据类型
``` javascript
//表示方式: '{}'
var e_info = {};
var xiaoming = {
    name: '小明',
    birth: 1990,
    middle-school: 'No.1 Middle School',
    height: 1.70,
    weight: 65,
    score: null
};
//访问方式
xiaoming.name
xiaoming['name'];
xiaoming['middle-school'];

//动态添加, 删除属性
xiaoming.age = 18; delete xiaoming.age;

```

#### 2.控制结构

- 条件判断: if else　语句, 具体请参考 [廖雪峰javascript课程-条件判断]

- 循环, 具体请参考 [廖雪峰javascript课程-循环]
  - for: 通过初始条件、结束条件和递增条件来循环执行语句块, 应用: 遍历数组
  - for ... in: 应用: 遍历数组, 对象
  - for...of: 应用: 遍历 iterable类型, 请参考[廖雪峰javascript课程-iterable类型]
  - while,　do...while

#### 3.事件处理

页面初始化时注册事件处理函数, 待初始化完成后, 后续操作依靠事件驱动机制来和用户进行交互,

现列出 _table示例_ 中用到的事件:

- onload: 页面结束加载之后触发, eg. html 中 `body` 结尾前的 script 代码块
- onmousedown: 当元素上按下鼠标按钮时触发, eg. 函数 `initTableWidget()` 事件注册代码注册
- onmouseup: 当在元素上释放鼠标按钮时触发, eg. 同上
- onmouseover: 当鼠标指针移动到元素上时触发, eg. 同上
- onmouseout: 当鼠标指针移出元素时触发, eg. 同上
- onclick: 元素上发生鼠标点击时触发, eg. 函数 `prepareReadJson(), prepareSaveJson()`
- onchange: 在元素值被改变时运行的脚本, eg. 函数 `preparePreview()`

具体可以参考: [HTML 事件属性], [全局事件函数]

#### 4.DOM 操作
- HTML 使用标记标签来描述网页
- 理解[HTML DOM]
- 当网页被加载时，浏览器会创建页面的DOM
  ![DOM树](img/dom_tree.gif)
- 通过DOM JavaScript 获得了足够的能力来创建动态的 HTML
  - 查找节点: getElementById, getElementsByTagName, getElementsByClassName, eg. 函数 `preparePreview`
  - 修改节点: elementNode.innerText = '...'
  - 增加节点: createElement, appendChild
  - 删除节点: removeChild
  - 其他: 属性操作等

``` javascript
// 返回ID为'test'的节点：
var test = document.getElementById('test');


```

#### 5.json 的使用
json 在前后台交互过程中用的非常广泛, 现做一个基本的介绍

- 全称: JavaScript Object Notation, 它是一种数据交换格式
- json 和 js对象可以相互转换
- js对象序列化为 json:
 `JSON.stringify(obj,null,' ')
- json反序列化为js对象:
 `JSON.parse('JSONstring')`

###　6.jQuery 库的使用
#### 1.基本介绍
jQuery 是JavaScript世界中使用最广泛的一个库, 简名: $,  它的主要特点

- 消除浏览器差异
- 简洁, 链式操作
- 轻松实现动画、修改CSS等各种操作

#### 2.选择器简介
DOM操作中我们经常使用繁琐的代码来获取我们想要的 node, 而选择器就是帮助我们快速定位到一个或多个DOM节点, 非常的短小精悍 !

1. 基本选择器

  id: $('#abc')

  tag: $('p')

  class:  $('.class')

  attr: $('[x=y]')

  组合选择: 连续写查找条件, 中间不用空格(否则成了层级选择)
    eg. var emailInput = $('input[name=email]');

  多项选择: 中间用 , eg. $('p.red,p.green');

2. 层级选择器 只要是层级关系就可以, 不一定非得是父子关系
  中间有空格, 表示层级关系: eg. $('ancestor descendant')

3. 子选择器 必须是父子关系
  中间有>, 表示父子关系: eg. $('parent>child')

4. 过滤器
  通常附加在选择器上，帮助我们更精确地定位元素
  ``` javascript
  $('ul.lang li'); // 选出JavaScript、Python和Lua 3个节点
  $('ul.lang li:first-child'); // 仅选出JavaScript
  ```
  过滤条件:first-child, last-child, nth-child, nth-child(even/odd)


#### 3.其他部分请参考
- [廖雪峰javascript课程-jQuery]
- [从零开始学习jQuery]






## 总结
如何快速的理解页面功能

- 先找到页面初始化代码, 理解程序初始化部分;
- 再充分利用chrome开发者工具, 快速定位 web 页中每一块元素涉及到的事件处理函数, 从而理解模块功能


## 参考资料
- [Javascript DOM 编程艺术-英文版]

- [廖雪峰 javascript 教程]

- [w3school在线教程]

[Javascript DOM 编程艺术-英文版]: https://domscripting.com/book/contents/
[w3school在线教程]: http://www.w3school.com.cn/js/
[廖雪峰 javascript 教程]: http://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000
[廖雪峰javascript课程-条件判断]: http://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000/0014345005693811782d9e338994ec19aa1c5325824bc15000
[廖雪峰javascript课程-循环]: http://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000/001434500620831b2aeb535f5e245c788493e9f4ff416c0000
[廖雪峰javascript课程-iterable类型]: http://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000/00143450082788640f82a480be8481a8ce8272951a40970000
[廖雪峰javascript课程-jQuery]:http://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000/001434499993118b8173572625b4afe93a8b19dd707ea1d000
[全局事件函数]: http://devdocs.io/dom-globaleventhandlers/
[HTML 事件属性]: http://www.w3school.com.cn/tags/html_ref_eventattributes.asp
[从零开始学习jQuery]: http://www.cnblogs.com/zhangziqiu/archive/2009/04/30/jQuery-Learn-1.html

[HTML DOM]: http://www.w3school.com.cn/js/js_htmldom.asp