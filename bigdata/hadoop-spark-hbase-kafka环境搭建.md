# hadoop-spark-hbase-kafka大数据环境搭建

## 0. 集群环境

- jdk版本:1.8.0

- sacla版本:2.10

- hadoop版本:2.7.2

- spark版本:2.0.0

- hbase版本:1.2.2

- kafka版本:2.11

- zookeeper版本:3.4.8

 集群结构：

```
+--------------+   +--------------+   +--------------+   +--------------+   +--------------+
|    nna       |   |    nns       |   |    zk125     |   |    zk126     |   |    zk127     |
|    Hadoop    |   |    Hadoop    |   |  zookeeper1  |   |  zookeeper2  |   |  zookeeper3  |
|    spark     |   |    spark     |   |              |   |              |   |              |
|    hbase     |   |    hbase     |   |              |   |              |   |              |
|    kafka     |   |    kafka     |   |              |   |              |   |              |
+--------------+   +--------------+   +--------------+   +--------------+   +--------------+
       |                  |                  |                   |                  |         
       |                  |                  |                   |                  |         
+------------------------------------------------------------------------------------------+
|                                             net                                          |
+------------------------------------------------------------------------------------------+
           |         |        |         |        |         |         |        |
           |         |        |         |        |         |         |        |
    +--------------+ | +--------------+ | +--------------+ | +--------------+ |
    |   dn21       | | |   dn108      | | |   dn121      | | |    dn122     | |
    |   Hadoop     | | |   Hadoop     | | |   Hadoop     | | |    Hadoop    | |
    |   spark      | | |   spark      | | |   spark      | | |    spark     | |
    |   hbase      | | |   hbase      | | |   hbase      | | |    hbase     | |
    |   kafka      | | |   kafka      | | |   kafka      | | |    kafka     | |
    +--------------+ | +--------------+ | +--------------+ | +--------------+ |
                     |                  |                  |                  |
              +--------------+   +--------------+   +--------------+   +--------------+
              |   dn123      |   |   dn124      |   |   dn203      |   |    dn205     |
              |   Hadoop     |   |   Hadoop     |   |   Hadoop     |   |    Hadoop    |
              |   spark      |   |   spark      |   |   spark      |   |    spark     |
              |   hbase      |   |   hbase      |   |   hbase      |   |    hbase     |
              |   kafka      |   |   kafka      |   |   kafka      |   |    kafka     |
              +--------------+   +--------------+   +--------------+   +--------------+
```

 在hosts文件中追加如下内容

 ```
10.0.0.20  nna namenodeactive
10.0.0.106 nns namenodestandby
10.0.0.21  dn21
10.0.0.108 dn108
10.0.0.121 dn121
10.0.0.122 dn122
10.0.0.123 dn123
10.0.0.124 dn124
10.0.0.203 dn203
10.0.0.205 dn205
10.0.0.125 zk125
10.0.0.126 zk126
10.0.0.127 zk127
 ```

## 1. 安装jdk与scala

- 使用sudo apt install openjdk 与 sudo apt install scala安装jdk与scala，根据系统支持的最新的jdk与scala版本确定其他组件的版本，对于ububtu系统来说，使用apt安装软件能获得更好的体验与支持。
- 在 `/opt`下创建软连接:

    ```
    ln -s /usr/lib/jvm/java-1.8.0-openjdk-amd64 jdk
    ln -s /usr/share/scala-2.11 scala
    ```

## 2. 安装zookeeper
- 下载合适版本的hadoop安装包。并将该压缩包复制到设备“zk125，zk126，zk127”上。
- 解压安装包至 `/home/cluster/package/`
- 在`/opt`下创建软连接 `ln -s /home/cluster/package/zookeeper-3.4.8 zk`
- 在/opt/zk/conf/zoo.cfg 中配置如下内容
    
    ```
    tickTime=2000
    initLimit=10
    syncLimit=5
    dataDir=/home/cluster/zookeeper/data
    dataLogDir=/home/cluster/zookeeper/logs
    clientPort=2181
    maxClientCnxns=60
    server.0=zk125:2888:3888
    server.1=zk126:2888:3888
    server.2=zk127:2888:3888
    ```
    
- 创建myid:在dataDir（/home/cluster/zookeeper/data）路径下创建myid文件，并在该文件中写入一个正整数作为本机的id，在zookeeper集群中，id不可重复。
- 启动zookeeper: 在设备“zk125，zk126，zk127”上的“/opt/zk/”路径下运行命令 `./bin/zkServer.sh start` 启动zookeeper
- 查看zookeeper状态: 在设备“zk125，zk126，zk127”上的“/opt/zk/”路径下运行命令 `./bin/zkServer.sh status`,其中，有两台机器输出“Mode: follower”，一台机器输出“Mode: leader”，则zookeeper配置成功
- 查看zookeeper log:zookeeper 的 log 直接打开是无法查看的，在logs文件夹下使用命令 `java -classpath /opt/zk/lib/slf4j-api-1.6.1.jar;/opt/zk/zookeeper-3.4.8.jar org.apache.zookeeper.server.LogFormatter ./log.100000001` 查看log。
- 更多zookeeper参考资料请查看[ZooKeeper Getting Started Guide](https://zookeeper.apache.org/doc/r3.3.3/zookeeperStarted.html)

## 3. 安装hadoop
- 下载合适版本的hadoop安装包。并将该压缩包复制到设备“nna，nns，dn21，dn108，dn121，dn122，dn123，dn124，dn203，dn205”上。
- 解压安装包至 `/home/cluster/package/`
- 在 `/opt`下创建软连接 `ln -s /home/cluster/package/hadoop-2.7.2 hadoop`
- 在/opt/hadoop/etc/hadoop/hadoop-env.sh中配置如下内容
    
    ```sh
    export JAVA_HOME=/opt/jdk
    export HADOOP_COMMON_LIB_NATIVE_DIR=/opt/hadoop/lib/native
    export HADOOP_OPTS="$HADOOP_OPTS -Djava.library.path=/opt/hadoop/lib/native"
    ```
    
- 在/opt/hadoop/etc/hadoop/core-site.xml中配置如下内容

    ```xml
    <configuration>
        <!-- 非高可用模式时，fs.defaultFS可以直接配置成master机器网络名+端口号，在高可用模式下需自定义hdfs的namespace，在所有需要使用hdfs的地方均需要直接使用namespace替代master机器网络名+端口号-->
        <property>
            <name>fs.defaultFS</name>
            <value>hdfs://eflagcluster</value>
            <!-- <value>hdfs://nna:9000</value> -->
        </property>
        <property>
            <name>hadoop.tmp.dir</name>
            <value>file:///opt/tmp</value>
        </property>
        <property>
            <name>ha.zookeeper.quorum</name>
            <value>zk125:2181,zk126:2181,zk127:2181</value>
        </property>
        <property>
            <name>ha.zookeeper.session-timeout.ms</name>
            <value>60000</value>
            <description>ms</description>
        </property>
        <property>
            <name>hadoop.native.lib</name>
            <value>true</value>
        </property>
        <!-- 高可用模式下DataNode通过JournalNode与两个NameNode里的信息进行同步，但是在使用start-dfs.sh启动hdfs集群时会先启动DataNode再启动JournalNode，因此需要将重试次数和间隔时间适当加长-->
        <property>
            <name>ipc.client.connect.max.retries</name>
            <value>20</value>
            <description>Indicates the number of retries a client will make to establish a server connection.</description>
        </property>
        <property>
            <name>ipc.client.connect.retry.interval</name>
            <value>1000</value>
            <description>Indicates the number of milliseconds a client will wait for before retrying to establish a server connection. </description>
        </property>
    </configuration>
    ```

- 在/opt/hadoop/etc/hadoop/hdfs-site.xml中配置如下内容

    ```xml
    <configuration>
        <property>
            <name>dfs.nameservices</name>
            <value>eflagcluster</value>
        </property>
        <property>
            <name>dfs.client.failover.proxy.provider.eflagcluster</name>
            <value>org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider</value>
        </property>
        <property>
            <name>dfs.ha.automatic-failover.enabled.eflagcluster</name>
            <value>true</value>
        </property>
        <property>
            <name>dfs.ha.namenodes.eflagcluster</name>
            <value>nna,nns</value>
        </property>
        <property>
            <name>dfs.ha.automatic-failover.enabled</name>
            <value>true</value>
        </property>
        <property>
            <name>dfs.namenode.rpc-address.eflagcluster.nna</name>
            <value>nna:8020</value>
        </property>
        <property>
            <name>dfs.namenode.rpc-address.eflagcluster.nns</name>
            <value>nns:8020</value>
        </property>
        <property>
            <name>dfs.namenode.servicerpc-address.eflagcluster.nna</name>
            <value>nna:53310</value>
        </property>
        <property>
            <name>dfs.namenode.servicerpc-address.eflagcluster.nns</name>
            <value>nns:53310</value>
        </property>
        <property>
            <name>dfs.namenode.http-address.eflagcluster.nna</name>
            <value>nna:50070</value>
        </property>
        <property>
            <name>dfs.namenode.http-address.eflagcluster.nns</name>
            <value>nns:50070</value>
        </property>
        <property>
            <name>dfs.namenode.shared.edits.dir</name>
            <value>qjournal://nna:8485;nns:8485;dn108:8485;dn121:8485;dn122:8485;dn123:8485;dn124:8485;dn203:8485;dn205:8485/eflag-cluster</value>
        </property>
        <property>
            <name>dfs.journalnode.edits.dir</name>
            <value>/opt/tmp/journal</value>
        </property>
        <property>
            <name>dfs.replication</name>
            <value>3</value>
        </property>
        <property>
            <name>dfs.namenode.name.dir</name>
            <value>file:///opt/tmp/dfs/name</value>
        </property>
        <property>
            <name>dfs.datanode.data.dir</name>
            <value>file:///opt/tmp/dfs/data</value>
        </property>
        <property>
            <name>dfs.blocksize</name>
            <value>67108864</value>
        </property>
        <property>
            <name>dfs.replication</name>
            <value>3</value>
        </property>
        <property>
            <name>dfs.webhdfs.enabled</name>
            <value>true</value>
        </property>
        <property>
            <name>dfs.journalnode.http-address</name>
            <value>0.0.0.0:8480</value>
        </property>
        <property>
            <name>ha.zookeeper.quorum</name>
            <value>zk125:2181,zk126:2181,zk127:2181</value>
        </property>
        <property>
            <name>dfs.ha.fencing.methods</name>
            <value>shell(/bin/true)</value>
        </property>
        <property>
            <name>dfs.ha.fencing.ssh.private-key-files</name>
            <value>/home/cluster/.ssh/id_rsa</value>
        </property>
    </configuration>
    ```

- /opt/hadoop/etc/hadoop/yarn-site.xml在namenode active上，namenode standby上（注意:namenode是active还是standby是由zookeeper选举决定的，本文当为了叙述方便，将20机器称为namenode active，将106机器称为namenode standby），以及datanode上有不同的配置
    1. 在namenode active上配置如下：

         ```xml
         <configuration>
             <property>
                 <name>yarn.resourcemanager.connect.retry-interval.ms</name>
                 <value>2000</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.ha.automatic-failover.enabled</name>
                  <value>true</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.ha.enabled</name>
                 <value>true</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.ha.rm-ids</name>
                 <value>rm1,rm2</value>
             </property>
             <!-- current resource manager id -->
             <property>
                 <name>yarn.resourcemanager.ha.id</name>
                 <value>rm1</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.hostname.rm1</name>
                 <value>nna</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.hostname.rm2</name>
                 <value>nns</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.recovery.enabled</name>
                 <value>true</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.zk-address</name>
                 <value>zk125:2181,zk126:2181,zk127:2181</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.store.class</name>
                 <value>org.apache.hadoop.yarn.server.resourcemanager.recovery.ZKRMStateStore</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.cluster-id</name>
                 <value>eflag-cluster-yarn</value>
             </property>
             <property>
                 <name>yarn.app.mapreduce.am.scheduler.connection.wait.interval-ms</name>
                 <value>5000</value>
             </property>
             <property>
                 <name>yarn.client.failover-proxy-provider</name>
                 <value>org.apache.hadoop.yarn.client.ConfiguredRMFailoverProxyProvider</value>
             </property>
             <property>
                 <name>yarn.log-aggregation-enable</name>
                 <value>true</value>
             </property>
             <property>
                 <name>yarn.log-aggregation.retain-check-interval-seconds</name>
                 <value>5</value>
             </property>
             <property>
                 <name>yarn.nodemanager.delete.debug-delay-sec</name>
                 <value>36000</value>
             </property>
             <property>
                 <name>yarn.log.server.url</name>
                 <value>http://nna:19888/jobhistory/logs</value>
             </property>
         </configuration>
         ```

    2. 在namenode standby上配置如下：

         ```xml
         <configuration>
             <property>
                 <name>yarn.resourcemanager.connect.retry-interval.ms</name>
                 <value>2000</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.ha.automatic-failover.enabled</name>
                  <value>true</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.ha.enabled</name>
                 <value>true</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.ha.rm-ids</name>
                 <value>rm1,rm2</value>
             </property>
             <!-- current resource manager id -->
             <property>
                 <name>yarn.resourcemanager.ha.id</name>
                 <value>rm2</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.hostname.rm1</name>
                 <value>nna</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.hostname.rm2</name>
                 <value>nns</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.recovery.enabled</name>
                 <value>true</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.zk-address</name>
                 <value>zk125:2181,zk126:2181,zk127:2181</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.store.class</name>
                 <value>org.apache.hadoop.yarn.server.resourcemanager.recovery.ZKRMStateStore</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.zk-address</name>
                 <value>zk125:2181,zk126:2181,zk127:2181</value>
             </property>
             <property>
                 <name>yarn.resourcemanager.cluster-id</name>
                 <value>eflag-cluster-yarn</value>
             </property>
             <property>
                 <name>yarn.app.mapreduce.am.scheduler.connection.wait.interval-ms</name>
                 <value>5000</value>
             </property>
             <property>
                 <name>yarn.client.failover-proxy-provider</name>
                 <value>org.apache.hadoop.yarn.client.ConfiguredRMFailoverProxyProvider</value>
             </property>
             <property>
                 <name>yarn.log-aggregation-enable</name>
                 <value>true</value>
             </property>
             <property>
                 <name>yarn.log-aggregation.retain-check-interval-seconds</name>
                 <value>5</value>
             </property>
             <property>
                 <name>yarn.nodemanager.delete.debug-delay-sec</name>
                 <value>36000</value>
             </property>
             <property>
                 <name>yarn.log.server.url</name>
                 <value>http://nna:19888/jobhistory/logs</value>
             </property>
         </configuration>
         ```

    3. 在datanode上配置如下：

        ```xml
        <configuration>
            <property>
                <name>yarn.resourcemanager.connect.retry-interval.ms</name>
                <value>2000</value>
            </property>
            <property>
                <name>yarn.resourcemanager.ha.automatic-failover.enabled</name>
                 <value>true</value>
            </property>
            <property>
                <name>yarn.resourcemanager.ha.enabled</name>
                <value>true</value>
            </property>
            <property>
                <name>yarn.resourcemanager.ha.rm-ids</name>
                <value>rm1,rm2</value>
            </property>
            <property>
                <name>yarn.resourcemanager.hostname.rm1</name>
                <value>nna</value>
            </property>
            <property>
                <name>yarn.resourcemanager.hostname.rm2</name>
                <value>nns</value>
            </property>
            <property>
                <name>yarn.resourcemanager.recovery.enabled</name>
                <value>true</value>
            </property>
            <property>
                <name>yarn.resourcemanager.zk-address</name>
                <value>zk125:2181,zk126:2181,zk127:2181</value>
            </property>
            <property>
                <name>yarn.resourcemanager.store.class</name>
                <value>org.apache.hadoop.yarn.server.resourcemanager.recovery.ZKRMStateStore</value>
            </property>
            <property>
                <name>yarn.resourcemanager.zk-address</name>
                <value>zk125:2181,zk126:2181,zk127:2181</value>
            </property>
            <property>
                <name>yarn.resourcemanager.cluster-id</name>
                <value>eflag-cluster-yarn</value>
            </property>
            <property>
                <name>yarn.app.mapreduce.am.scheduler.connection.wait.interval-ms</name>
                <value>5000</value>
            </property>
            <property>
                <name>yarn.client.failover-proxy-provider</name>
                <value>org.apache.hadoop.yarn.client.ConfiguredRMFailoverProxyProvider</value>
            </property>
            <property>
               <name>yarn.nodemanager.disk-health-checker.max-disk-utilization-per-disk-percentage</name>
               <value>98.5</value>
            </property>
            <property>
                <name>yarn.nodemanager.local-dirs</name>
                <value>/opt/tmp/yarn/local</value>
            </property>
            <property>
                <name>yarn.nodemanager.log-dirs</name>
                <value>/opt/tmp/yarn/logs</value>
            </property>
            <!-- cpu逻辑核心数，根据设备实际配置填写-->
            <property>
                <name>yarn.nodemanager.resource.cpu-vcores</name>
                <value>48</value>
            </property>
            <!-- 设备可使用内存，其值为设备内存减去系统保留内存和HBase保留内存，单位为MB，不同设备内存对应的保留内存参见附表-->
            <property>
                <name>yarn.nodemanager.resource.memory-mb</name>
                <value>49152</value>
            </property>
             <property>
                 <name>yarn.log-aggregation-enable</name>
                 <value>true</value>
             </property>
             <property>
                 <name>yarn.log-aggregation.retain-check-interval-seconds</name>
                 <value>5</value>
             </property>
             <property>
                 <name>yarn.nodemanager.delete.debug-delay-sec</name>
                 <value>36000</value>
             </property>
             <property>
                 <name>yarn.log.server.url</name>
                 <value>http://nna:19888/jobhistory/logs</value>
             </property>
        </configuration>
        ```

- 在/opt/hadoop/etc/hadoop/mapred-site.xml中配置如下内容

    ```xml
    <configuration>
        <property>
            <name>mapreduce.framework.name</name>
            <value>yarn</value>
        </property>
        <property>
            <name>mapreduce.jobhistory.address</name>
            <value>nna:10020</value>
        </property>
        <property>
            <name>mapreduce.jobhistory.webapp.address</name>
            <value>nna:19888</value>
        </property>
        <property>
            <name>mapred.job.tracker</name>
            <value>nna:9001</value>
        </property>
        <property>
            <name>mapred.local.dir</name>
            <value>/opt/tmp</value>
        </property>
        <property>
            <name>mapreduce.map.output.compress</name>
            <value>true</value>
        </property>
        <property>
            <name>mapreduce.map.output.compress.codec</name>
            <value>com.hadoop.compression.lzo.LzoCodec</value>
        </property>
        <property>
            <name>mapred.child.env</name>
            <value>LD_LIBRARY_PATH=/opt/hadoop/lib/native</value>
        </property>
        <property>
	        <name>mapred.remote.os</name>
	        <value>Linux</value>
        </property>
    </configuration>
    ```

- 在/opt/hadoop/etc/hadoop/slaves中配置如下内容

    ```
    dn21
    dn108
    dn121
    dn122
    dn123
    dn124
    dn203
    dn205
    ```

- 把配置文件调整好后, 还需要执行下面的步骤进行高可用配置的初始化操作:
    - 在 nna 上格式化 NameNode, `sbin/start-dfs.sh; bin/hdfs namenode -format eflagcluster`, 再启动 nna 上的 NameNode, `sbin/start-dfs.sh`.
    - 把 nna 上的 NameNode 的 metadata 目录拷贝到 nns 上, `scp -r /opt/tmp/dfs/name nns:/opt/tmp/dfs`. 再在未格式化的 nns 上执行 `bin/hdfs namenode -bootstrapStandby`, 在 nns 上启动 NameNode 服务, `sbin/start-dfs.sh`. 以后既可以在 nna 或 nns 上执行 `sbin/start-dfs.sh` 启动 NameNode 的主从服务了.
    - 如果是从非 HA 模式迁移到 QJM HA 模式, 还需要执行 `bin/hdfs namenode -initializeSharedEdits`.
- 启动hdfs和yarn: 在namenode active设备上运行如下命令`sbin/start-dfs.sh ; sbin/start-yarn.sh`
- 启动备用yarn节点:  在namenode standby `sbin/start-yarn.sh`
- 查看hdfs:在浏览器中输入如下url `http://nna:50070/` 查看hdfs状态。
- 查看yarn资源:在浏览器中输入如下url `http://nna:8088/` 点击查看yarn状态
- [HDFS Users Guide](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsUserGuide.html)

## 4. 安装spark
- 下载合适版本的 spark 安装包。并将该压缩包复制到设备 “nna，nns，dn21，dn108，dn121，dn122，dn123，dn124，dn203，dn205” 上。
- 解压安装包至 `/home/cluster/package/`
- 在 `/opt`下创建软连接 `ln -s /home/cluster/package/spark-2.0.0-bin-hadoop2.7 spark`
- 在/opt/spark/conf/spark-env.sh中配置如下内容

    ```sh
    export JAVA_HOME=/opt/jdk
    export SCALA_HOME=/opt/scala
    export SPARK_MASTER_IP=10.0.0.20
    export HADOOP_CONF_DIR=/opt/hadoop/etc/hadoop
    export SPARK_JAVA_OPTS
    ```

- 在/opt/spark/conf/spark-defaults.conf中配置如下内容

    ```
    spark.master                     spark://nna:7077
    spark.eventLog.enabled           true
    spark.eventLog.dir               hdfs://eflagcluster/sparkeventlog
    spark.history.fs.logDirectory    hdfs://eflagcluster/sparkeventlog  # 之后可以使用无参命令 start-history-server.sh 启动历史服务
    ```

- 在/opt/spark/conf/slaves中配置如下内容

    ```
    dn21
    dn108
    dn121
    dn122
    dn123
    dn124
    dn203
    dn205
    ```

- 启动spark: 在namenode active设备上运行如下命令 `sbin/start-all.sh`
- 查看spark状态:在浏览器中输入如下url “http://nna:8080/” 即可在网页上查看spark运行状态
- [quick-start](http://spark.apache.org/docs/2.0.0/quick-start.html)

## 5. 安装HBase
- 下载合适版本的 HBase 安装包。并将该压缩包复制到设备 “nna，nns，dn21，dn108，dn121，dn122，dn123，dn124，dn203，dn205” 上，HBase版本与jdk版本和hadoop版本对应关系见附录。其他关于HBase的注意事项请参考[Apache HBase Reference Guide](http://hbase.apache.org/book.html)
- 解压安装包至 `/home/cluster/package/`
- 在 `/opt`下创建软连接 `ln -s /home/cluster/package/hbase-1.2.2 hbase`
- 在 /opt/hbase/conf/hbase-env.sh 中配置如下内容

    ```sh
    export JAVA_HOME=/opt/jdk
    export HBASE_MANAGES_ZK=false
    ```

    若系统中的JDK为JDK7及其以下版本，只需设置JAVA_HOME与HBASE_MANAGES_ZK即可。而对于**JDK8及其以上的JDK版本**，需要进行如下修改：

    ```sh
    #Configure PermSize. Only needed in JDK7. You can safely remove it for JDK8+
    export HBASE_MASTER_OPTS="$HBASE_MASTER_OPTS -XX:PermSize=128m -XX:MaxPermSize=128m"
    export HBASE_REGIONSERVER_OPTS="$HBASE_REGIONSERVER_OPTS -XX:PermSize=128m -XX:MaxPermSize=128m"
    ```

    改为

    ```sh
    #Configure PermSize. Only needed in JDK7. You can safely remove it for JDK8+
    export HBASE_MASTER_OPTS="$HBASE_MASTER_OPTS"
    export HBASE_REGIONSERVER_OPTS="$HBASE_REGIONSERVER_OPTS"
    ```

- 在/opt/hbase/conf/hbase-site.xml中配置如下内容

    ```xml
    <configuration>
         <property>
             <name>hbase.rootdir</name>
             <value>hdfs://eflagcluster/hbase</value>
         </property>
         <property>
             <name>hbase.master.port</name>
             <value>16000</value>
         </property>
         <property>
             <name>hbase.zookeeper.property.dataDir</name>
             <value>/home/cluster/zookeeper</value>
         </property>
         <property>
             <name>hbase.cluster.distributed</name>
             <value>true</value>
         </property>
         <property>
             <name>hbase.zookeeper.property.clientPort</name>
             <value>2181</value>
         </property>
         <property>
             <name>hbase.zookeeper.quorum</name>
             <value>zk125,zk126,zk127</value>
         </property>
         <property>
             <name>hbase.master.maxclockskew</name>
             <value>180000</value>
         </property>
    </configuration>
    ```

- 在/opt/hbase/conf/regionservers中配置如下内容(该文件只在 master 及 backup master 上配置即可)

    ```
    dn21
    dn108
    dn121
    dn122
    dn123
    dn124
    dn203
    dn205
    ```

- 启动HBase:在master上的HBase目录下使用命令 `./bin/start-hbase.sh` 启动HBase。
- 启动高可用备用master节点:backup master 的HBase目录下使用命令`./bin/hbase-daemon.sh start master`启动备用master节点。
- 启动 hbase shell 在HBase目录下使用命令 `./bin/hbase shell` 启动hbase shell后即可使用HBase相关语句进行数据操作
- 使用浏览器访问路径 `http://nna:16010/` 即可使用web查看hbase状态

## 6. 安装kafka
- 下载合适版本的kafka（kafka主要用来相spark任务提供数据，因此主要考虑对spark的兼容性，spark user guide 中可以查询到其版本间的对应关系），并将该压缩包复制到设备 “nna，nns，dn21，dn108，dn121，dn122，dn123，dn124，dn203，dn205” 上。
- 解压安装包至 `/home/cluster/package/`
- 在 `/opt`下创建软连接 `ln -s /home/cluster/package/kafka_2.11-0.10.0.1 kafka`
- 在 /opt/kafka/config/server.properties 中配置如下内容

    ```
    broker.id=0 #server id,每台设备均不能相同
    listeners=PLAINTEXT://:9092
    port=9092
    host.name=nna #设备网络名
    advertised.port=9092
    advertised.host.name=nna #设备网络名
    zookeeper.connect=zk125:2181,zk126:2181,zk127:2181
    ```

- 启动kafka:在所有需要启动kafka的设备上的kafka目录下使用命令 `../bin/kafka-server-start.sh ./config/server.properties ` 启动kafka。
- 创建topic: `./bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication 3 --partition 1 --topic test`
- 测试kafka:
    - 查看topic是否创建成功: `./bin/kafka-topics.sh --list --zookeeper localhost:2181`
    - 启动消费者: `./bin/kafka-console-consumer.sh --zookeeper localhost:2181 --topic test`
    - 启动生产者: `./bin/kafka-console-producer.sh --broker-list zookeeper1:9092 --topic test` ,在集群任意机器上的生产者终端随意输入字符，回车后在任意机器上的消费者终端输出同样的字符，则kafka集群配置成功

## 7. 附录

### yarn 保留内存配置表

表格参考[YARN and MapReduce Memory Configuration Settings](http://docs.hortonworks.com/HDPDocuments/HDP2/HDP-2.1.1/bk_installing_manually_book/content/rpm-chap1-11.html)

|  机器内存  | 系统保留 | HBase保留 |
|-------|------|------|
| 4GB   | 1GB  | 1GB  |
| 8GB   | 2GB  | 2GB  |
| 16GB  | 2GB  | 2GB  |
| 24GB  | 4GB  | 4GB  |
| 48GB  | 6GB  | 6GB  |
| 64GB  | 8GB  | 8GB  |
| 72GB  | 8GB  | 8GB  |
| 96GB  | 12GB | 16GB |
| 128GB | 24GB | 24GB |
| 255GB | 32GB | 32GB |
| 512GB | 64GB | 64GB |

### HBase所需的JDK版本

| HBase Version |    JDK 6     | JDK 7 | JDK 8 |
|---------------|--------------|-------|-------|
| 1.3           |Not Supported | yes   |yes|
| 1.2           |Not Supported | yes   |yes|
| 1.1           |Not Supported | yes   |Running with JDK 8 will work but is not well tested.|
| 1.0           |Not Supported | yes   |Running with JDK 8 will work but is not well tested.|
| 0.98          |yes           | yes   |Running with JDK 8 works but is not well tested. Building with JDK 8 would require removal of the deprecated remove() method of the PoolMap class and is under consideration. See HBASE-7608 for more information about JDK 8 support.|
| 0.94          |yes           | yes   |N/A|

### HBase与Hadoop版本对应关系
* "S" = supported
* "X" = not supported
* "NT" = Not tested

|               | HBase-0.94.x | HBase-0.98.x (Support for Hadoop 1.1+ is deprecated.) | HBase-1.0.x (Hadoop 1.x is NOT supported) | HBase-1.1.x | HBase-1.2.x | HBase-1.3.x |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
|Hadoop-1.0.x       |X |X |X |X |X|X|
|Hadoop-1.1.x       |S |NT|X |X |X|X|
|Hadoop-0.23.x      |S |X |X |X |X|X|
|Hadoop-2.0.x-alpha |NT|X |X |X |X|X|
|Hadoop-2.1.0-beta  |NT|X |X |X |X|X|
|Hadoop-2.2.0       |NT|S |NT|NT|X|X|
|Hadoop-2.3.x       |NT|S |NT|NT|X|X|
|Hadoop-2.4.x       |NT|S |S |S |S|S|
|Hadoop-2.5.x       |NT|S |S |S |S|S|
|Hadoop-2.6.0       |X |X |X |X |X|X|
|Hadoop-2.6.1+      |NT|NT|NT|NT|S|S|
|Hadoop-2.7.0       |X |X |X |X |X|X|
|Hadoop-2.7.1+      |NT|NT|NT|NT|S|S|

对于0.92版本之后的HBase，使用版本高于3.4.0的zookeeper可以获得更好的功能支持。
