## 通过 Thrift JDBC/ODBC 使用 Spark SQL
通过 Thrift JDBC/ODBC 提供的服务, 我们可以像访问 MySQL 一样操作 Spark SQL 提供的数据分析能力.

1. 启动服务前的准备工作, 在 HDFS 上创建数据仓库目录.

    ```
    hdfs dfs -mkdir -p /user/hive/warehouse  # hive可以替换为其它用户名
    hdfs dfs -chmod a+w /user/hive/warehouse
    ```

1. 启动服务, 在我们的案例中, 是运行在 Yarn 集群上, 并且以 client 模式部署(*TODO 为什么只能以这种方式*). 当前只能在 nna 上启动服务, 可以保证一切正常, 在其它服务器上有待验证.

    ```
    sbin/start-thriftserver.sh
        --master yarn
        --conf="spark.sql.warehouse.dir=hdfs://[clustername]:[port]/user/hive/warehouse"
        --files /path/to/log4j-spark.properties
        --drivers-cores 2 --driver-memory 2G
        --conf="spark.driver.extraJavaOptions=-Dlog4j-spark.properties --XX:+UseG1GC"
        --executor-cores 3 --executor-memory 10G --num-executors 7
        --conf="spark.executor.extraJavaOptions=-Dlog4j-spark.properties --XX:+UseG1GC"
    ```
    同样的参数运用到 `bin/spark-sql`, 可以启动 Spark SQL 的交互式命令行界面.

1. 先启用 Spark 安装目录下的 bin/beeline, 在交互式命令提示符下执行下列操作验证服务可用性.

    ```
    !connect jdbc:hive2://[host]:10000      # host 为启动服务的主机, 默认端口为 10000
    !set                                    # 查看服务参数, !set -v 参考更多参数配置
    use default;                            # 使用默认数据库 default
    create database testdb;                 # 创建新数据库, 使用 use 切换数据库
    create table test(id int, name string)  # 创建表示例
        row format delimited
        fields terminated by ','            # 文本文件字段是以逗号分隔
        stored as textfile;
    # 把 HDFS 上的数据导入到数据表
    load data inpath 'hdfs://[clustername]:[port]/user/hive/[rawdata.csv] into table test;
    select * from test;                     # 查询数据库
    # 直接查询 parquet 文件中的数据
    select * from parquet.`hdfs://[clustername]:[port]/path/to/xxx.parquet`;
    ``` 

1. 以上操作完成后, 可以使用相关的 JDBC/ODBC 驱动操作 Spark SQL.  

## 参考链接
- https://home.apache.org/~pwendell/spark-nightly/spark-branch-2.0-docs/latest/sql-programming-guide.html#running-the-thrift-jdbcodbc-server
- http://lxw1234.com/archives/2015/06/265.htm
- http://10901776.blog.51cto.com/10891776/1875371
- http://www.cnblogs.com/chenfool/p/4502212.html
