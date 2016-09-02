// 在Ubuntu 16.04系统中，如果用system执行的命令中含有‘&>'会导致命令进入后台执行
// 在Mac OSX EI Capitan系统中，不会发生这样的问题
//
// 事情的起因是用system执行`rm /path/to/*.txt &> /dev/null`
// 日志显示该命令立即返回，即使目录中存在较多文件，终端执行都需要几秒钟。
// 所以从‘&’符合入手，在不同的系统上进行测试
//
// g++ -std=c++11 system.cpp

#include <stdlib.h>
#include <time.h>
#include <unistd.h>
#include <iostream>
#include <string>

std::string Time() {
  time_t t = time(nullptr);
  return std::to_string(t);
}

int main(int argc, const char *argv[]) {
  if (argc == 1) {
    std::string command = argv[0];
    // ubuntu上并不会重定向到temp.txt文件
    command += " dummy &> temp.txt";
    std::cout << Time() << " begin call system\n";
    int ret = system(command.c_str());
    std::cout << "system return " << ret << "\n";
    std::cout << Time() << "end call system\n";
  } else {
    int i = 0;
    std::cout << Time() << " entering system\n";
    while (i++ < 3) sleep(1);
    std::cout << Time() << " leaving system\n";
  }
  return 0;
}
