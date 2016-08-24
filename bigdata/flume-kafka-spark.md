# flume + kafka + spark 日志收集环境配置
## 0. 集群环境
- spark版本：1.6.1
- sacla版本：2.10
- 集群结构：
```
+--------------+   +--------------+   +--------------+   +--------------+
|   master1    |   |    slave1    |   |   master2    |   |    slave2    |
|    spark     |   |     spark    |   |    spark     |   |     spark    |
|  zookeeper   |   |  zookeeper   |   |  zookeeper   |   |  zookeeper   |
|    kafka     |   |     kafka    |   |    kafka     |   |     kafka    |
+--------------+   +--------------+   +--------------+   +--------------+
       |                |                    |                   |
       |                |                    |                   |
       |                |                    |                   |
+-----------------------------------------------------------------------+
|                                net                                    |
+-----------------------------------------------------------------------+
        |
        |
+--------------+
|  data source |
|    flume     |
|  application |
+--------------+
```

## 1. 在集群上安装配置kafka
- 下载对应版本的kafka。（spark1.6.1对应的kafka版本为：kafka_2.10-0.8.2.1.tgz）
- 解压到想要安装的目录。（测试环境解压到/opt/modules下）
- 配置zookeeper

```
file: config/zookeeper.properties
#在该目录下创建名为“myid”的文件，文件中写入一个各不相同的数字作为zookeeper id
dataDir=/root/zoo_keeper_data
# the port at which the clients will connect
clientPort=2181
initLimit=5
syncLimit=2
# disable the per-ip limit on the number of
# connections since this is a non-production config
maxClientCnxns=300
server.1=master1:2888:3888
server.2=slave1:2888:3888
server.3=master2:2888:3888
server.4=slave2:2888:3888
```

- 配置kafka service

```
file:config/server.properties
broker.id=0 #server id,每台设备均不能相同
port=9092
host.name=master1 #设备网络名
```

- 启动zookeeper: `./bin/zookeeper-server-start.sh config/zookeeper.properties`
- 启动kafka service: `./bin/kafka-server-start.sh config/server.properties`
- 创建topic: `./bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication 3 --partition 1 --topic test`
- 测试kafka:
 - 查看topic是否创建成功: `./bin/kafka-topics.sh --list --zookeeper localhost:2181`
 - 启动消费者: `./bin/kafka-console-consumer.sh --zookeeper localhost:2181 --topic test`
 - 启动生产者: `./bin/kafka-console-producer.sh --broker-list master1:9092 --topic test` ,在集群任意机器上的生产者终端随意输入字符，回车后在任意机器上的消费者终端输出同样的字符，则kafka集群配置成功
- 查看zookeeper log: zookeeper的log直接打开是乱码，需要使用下述命令查看: `java -classpath .:/opt/modules/kafka2100821/libs/slf4j-api-1.7.6.jar:/opt/modules/kafka2100821/libs/zookeeper-3.4.6.jar org.apache.zookeeper.server.LogFormatter ./log.100000001`

## 2. 在数据源上安装flume
- 下载apache-flume-1.6.0-bin.tar.gz apache-flume-1.6.0-src.tar.gz
- 解压两个压缩包，将apache-flume-1.6.0-src中的内容复制到apache-flume-1.6.0-bin中
- 配置flume:

```
agent1.sources=source1
agent1.channels=channel1
agent1.sinks=sink1
agent1.sources.source1.type=thrift     #数据源为thrift
agent1.sources.source1.bind=0.0.0.0    #在本机启动flume服务供thrift连接
agent1.sources.source1.port=41414      #thrift连接到flume端口号
agent1.sources.source1.channels=channel1
#最大线程数，控制flume source线程池大小，若不指定，
#则flume会不停的创建线程并将其加入到线程池中，会造成java线程耗尽，
#发生“unable to create new native thread”错误
agent1.sources.source1.threads=100
# channel模式为file模式,该模式在探针断电时能保护数据安全，但效率较差，
# 若程序是效率敏感切有措施保证探针不会轻易断电则应当选择memory模式，memory模式传输效率较高。
agent1.channels.channel1.type=file
agent1.channels.channel1.checkpointDir=/home/rd/test_tmp/123
agent1.channels.channel1.dataDirs=/home/rd/test_tmp
agent1.channels.channel1.maxFileSize=500000000
agent1.sinks.sink1.type=org.apache.flume.sink.kafka.KafkaSink
agent1.sinks.sink1.topic=test
agent1.sinks.sink1.channel=channel1
agent1.sinks.sink1.brokerList=master1:9092,slave1:9092,master2:9092
agent1.sinks.sink1.serializer.class=kafka.serializer.StringEncoder
agent1.sinks.sink1.zookeeperConnect=master1:2181,slave1:2182,master2:2182
agent1.sinks.sink1.groupid=spark-streaming-consumer
```

- 修改java虚拟机使用内存大小， 在文件conf/flume-env.sh中添加如下内容：

```
export JAVA_OPTS="-Xms4096m -Xmx4096m  -Xss256k -Xmn1g \
  -XX:+UseParNewGC -XX:+UseConcMarkSweepGC \
  -XX:-UseGCOverheadLimit -XX:PermSize=128M \
  -XX:MaxNewSize=256m -XX:MaxPermSize=256m \
  -Dcom.sun.management.jmxremote"
```

- 启动flume: `/opt/modules/flume/bin/flume-ng agent -n agent1 -c conf -f /opt/modules/flume/conf/thrifttokafka.conf`

## 3. flume thrift cpp接口
- 从flume-ng-sdk/src/main/thrift目录下找到flume.thrift文件，然后将其拷贝到你的工程目录下。
```
namespace java org.apache.flume.thrift
struct ThriftFlumeEvent {
  1: required map <string, string> headers,
  2: required binary body,
}
enum Status {
  OK,
  FAILED,
  ERROR,
  UNKNOWN
}
service ThriftSourceProtocol {
  Status append(1: ThriftFlumeEvent event),
  Status appendBatch(1: list<ThriftFlumeEvent> events),
}
```
- 使用命令：`thrift --gen cpp flume.thrift` 编译thrift文件
- 编写application，调用thrift接口（代码见附录），将字符串写入kafka集群。

## 4. 启动spark streaming
- 下载spark kafka插件: spark-streaming-kafka-assembly_2.10-1.6.1.jar,其中2.10为scala版本，1.6.1为spark版本
- 提交spark streaming任务:

```
bin/spark-submit --master yarn --deploy-mode cluster --num-executors 3 \
--driver-memory 4g --executor-memory 2g --executor-cores 4  \
--jars spark-streaming-kafka-0-8-assembly_2.11-2.0.0.jar \
examples/src/main/python/streaming/kafka_wordcount.py localhost:2181 test
```

- 注意:
 - 集群机器cpu需要有四个以上的逻辑核心才能正常输出结果。

启动编写好的的测试程序，在yarn上看到如下内容输出则表示flume + kafka + spark streaming环境配置成功。

## 5. 附录

### 测试程序代码
```cpp
#include <sys/time.h>
#include <thrift/protocol/TBinaryProtocol.h>
#include <thrift/protocol/TCompactProtocol.h>
#include <thrift/transport/TSocket.h>
#include <thrift/transport/TTransportUtils.h>
#include <vector>
#include "gen-cpp/ThriftSourceProtocol.h"
#include "gen-cpp/flume_constants.h"
#include "gen-cpp/flume_types.h"

using namespace std;
using namespace apache::thrift;
using namespace apache::thrift::protocol;
using namespace apache::thrift::transport;
#define LOOP 1024

int right_num = 0;
int error_num = 0;

class ThriftClient {
 public:
  /* Thrift protocol needings... */
  boost::shared_ptr<TTransport> socket;
  boost::shared_ptr<TTransport> transport;
  boost::shared_ptr<TProtocol> protocol;
  ThriftSourceProtocolClient* pClient;

 public:
  void sendEvent();
  ThriftClient();
};

ThriftClient::ThriftClient()
    : socket(new TSocket("0.0.0.0", 41414)),
      transport(new TFramedTransport(socket)),
      protocol(new TCompactProtocol(transport)) {
  pClient = new ThriftSourceProtocolClient(protocol);
}
void ThriftClient::sendEvent() {
  std::map<std::string, std::string> headers;
  headers.insert(std::make_pair("head", "head"));
  std::string sBody =
      "TableName:TEST_TABLE ConfigID:5555 ResponseIP:77522222 ProtoType:67 "
      "StartTime:3333 Interval:24544 AccessTimes:45 DomainLen:12\n";
  if (!transport->isOpen()) {
    transport->open();
  }
  ThriftFlumeEvent tfEvent;
  tfEvent.__set_headers(headers);
  tfEvent.__set_body(sBody);
  Status::type res;
  int i = 0;
  std::vector<ThriftFlumeEvent> eventbatch;
  eventbatch.clear();
  int j = 1;
  for (; j <= 3200; j++) eventbatch.push_back(tfEvent);
  for (; i < LOOP; i++) {
    res = pClient->appendBatch(eventbatch);
    if (i % 10 == 0) printf("---------%d / 100 \n", i / 10);
    if (res == Status::OK) {
      right_num++;
    } else {
      error_num++;
      printf("WARNING: send event via thrift failed, return code:%d\n", res);
    }
  }
}

int main(int argc, char* argv[]) {
  ThriftClient* client = new ThriftClient();
  struct timeval start, end;
  long sec = 0, usec = 0;
  gettimeofday(&start, NULL);
  try {
    client->sendEvent();
  } catch (apache::thrift::TApplicationException& e) {
    printf("ApplicationException:%s\n", e.what());
  } catch (apache::thrift::transport::TTransportException& e) {
    printf("TransportException:%s\n", e.what());
  }
  gettimeofday(&end, NULL);
  printf("RIGHT: success num:%d\n", right_num);
  printf("ERROR: failed num:%d\n", error_num);
  if (end.tv_usec < start.tv_usec) {
    sec = end.tv_sec - start.tv_sec - 1;
    usec = 1000000 + end.tv_usec - start.tv_usec;
  } else {
    sec = end.tv_sec - start.tv_sec;
    usec = end.tv_usec - start.tv_usec;
  }
  printf("use time:%ld:%ld\n", sec, usec);
  client->transport->close();
}
```

### makefile
```make
CXX = g++
CFLAGS= -g -m64
CURRENT_DIR = $(shell pwd)
THRIFT_INCLUDES=-I/usr/local/include/thrift
CPP_INCLUDES= $(THRIFT_INCLUDES) -I$(CURRENT_DIR)/gen-cpp
COMMON_LDFLAGS= -L/usr/lib64
CPP_LDFLAGS=-lthrift -lpthread -lboost_system
SOURCE=main.cpp gen-cpp/flume_types.cpp gen-cpp/flume_constants.cpp gen-cpp/ThriftSourceProtocol.cpp

all: test

test:$(SOURCE)
	$(CXX) $(SOURCE) $(CFLAGS) $(CPP_INCLUDES) -o $@ $(COMMON_LDFLAGS) $(CPP_LDFLAGS) -std=c++11
clean:
	rm -f *.o test
```
