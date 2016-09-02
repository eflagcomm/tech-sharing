// 测试通过远程连接(ssh)启动本程序，关闭终端，会导致子进程收到SIGHUP信号。
// 除非调用daemon脱离控制终端，关闭终端时，子进程才不受影响。
//
// g++ -std=c++11 -Wall sighup.com
//
#include <signal.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <fstream>
#include <iostream>
#include <string>
#include <thread>

//#define USE_DAEMON
using std::cout;

void HandleHup(int sig) {
  cout << "pid = " << getpid() << " receive signal " << strsignal(sig) << "\n";
}

void ForkProcess(const char* program, std::ofstream& log) {
  pid_t pid = fork();
  if (pid > 0) {
    log << "fork a child " << pid << "\n";
  } else if (pid < 0) {
    log << "can't fork a child\n";
  } else {
    // char prg[] = "/home/rock/a.out"; // 替换为当前程序的绝对路径
    char* prg = const_cast<char*>(program);
    char arg[] = "i_am_fork_child";
    char* const argv[3] = {prg, arg, nullptr};  // prg可以替换为nullptr
    char* const env[] = {nullptr};

    int ret = execve(prg, argv, env);
    std::ofstream log_pid;
    std::string log_file =
        std::string("pid-") + std::to_string(getpid()) + ".log";
    log_pid.open(log_file);
    if (ret != 0) {
      log_pid << "execve fail: " << strerror(errno) << "\n";
    }
    log_pid.close();
    // execve执行失败时，相当于复制了父进程，包括寄存器pc的值。
    // 我们可以通过给prg赋一个不存在的路径或者没有权限的路径导致execve失败
    // 会看到ForkProcess会被调用n(n+1)/2次，n是for循环的最大值
  }
}

int main(int argc, const char* argv[]) {
  if (argc == 1) {
    signal(SIGHUP, HandleHup);

#ifdef USE_DAEMON  // 打开可以测试daemon的效果-脱离控制终端
    cout << "before daemon, I'm parent = " << getpid() << "\n";
    int dret = daemon(1, 0);  // 详见APUE 13.3节关于daemon需要遵循的规则
// 如果是daemon(0, 0)，需要改变目录到当前执行文件的目录
// chdir("/home/rock");
#endif
    // ofstream必须放在daemon之后，daemon调用fork不会复制文件描述符
    std::ofstream log;
    log.open("./log.txt");

#ifdef USE_DAEMON
    if (dret == -1) {
      log << "daemon fail: " << strerror(errno);
    }
    log << "after daemon, I'm parent = " << getpid() << "\n";
#endif

    for (int i = 0; i < 3; ++i) ForkProcess(argv[0], log);

    log.flush();
    int status = 0;
    int ret = 0;
    do {
      ret = waitpid(-1, &status, 0);
      if (ret == -1) break;
      log << "pid = " << ret << " exit";
      if (WIFSIGNALED(status))
        log << ", which receive signal " << strsignal(WTERMSIG(status));
      log << "\n";
    } while (ret >= 0);
    log.close();
    // 取消注释，并使用daemon(0, 0)保证当前工作目录为根目录
    // 使用pstree -p <daemon-pid>会看到execve执行失败的效果
    // 这可以解释pc寄存器也被fork了
    // while (true)
    // std::this_thread::sleep_for(std::chrono::microseconds(1000));
  } else {  // 子进程循环进入睡眠
    while (true) {
      std::this_thread::sleep_for(std::chrono::microseconds(1000));
    }
  }

  return 0;
}
