#Windows下Nodejs中引入oracledb模块前的准备工作和环境配置

###1. 安装python

   + 到python官网下载python2.7版本，下载完成后按照默认安装步骤进行安装。

###2. 安装oracle instant client

   + 到http://www.oracle.com/technetwork/topics/winx64soft-089540.html 下载instantclient_basic-windows.x64-12.1.0.2.0.zip和instantclient_sdk-windows.x64-12.1.0.2.0.zip，下载好后新建一个空目录，将两个压缩包的内容的内容都解压到该文件夹，假定C:\oracle\instantclient，将C:\oracle\instantclient添加到环境变量中的Path中，另外再在系统环境变量中添加两个变量：OCI_LIB_DIR=C:\oracle\instantclient\sdk\lib\msvc，OCI_INC_DIR=C:\oracle\instantclient\sdk\include。

###3. 安装Microsoft Visual Studio 2015 community

   + 在Microsoft官网下载vs2015 community版本，点击安装，注意在安装过程中选择安装项的时候只选择visual c++相关项，其他的一概不选。下载好后找到vs根目录中的vc目录，假定为C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC，将C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC\bin目录添加到环境变量的Path中，另外再添加两个系统环境变量：INCLUDE=C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC\include,LIB=C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC\lib。

###4. 安装Nodejs

   + 在Nodejs官网中下载Nodejs最新版并安装。

###5. 引入oracledb依赖

   + 打开终端，cd进入到项目目录下，输入npm install oracledb，并运行，运行完成后oracledb模块就成功的添加到项目中。