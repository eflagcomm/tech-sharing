// http://stackoverflow.com/questions/1087042/c-new-int0-will-it-allocate-memory
// new一个0长数据，解引用这个指针的行为是未定义的（参考上面的连接），
// 但是在我的电脑中可以工作（目前观察到0长数组和非0长数组的地址不是连续的）
// TODO 模拟出未定义行为
//
// g++ -std=c++11 -Wall new_zero_array.cpp

#include <iostream>

int main(int argc, const char *argv[]) {
  {
    int *p = new int[0];
    std::cout << "p address is " << p << std::endl;
    *p = 1;
    std::cout << "p(set with 1) content is " << *p << std::endl;
    delete[] p;
  }
  {
    short *p = new short[0];
    std::cout << "p address is " << p << std::endl;
    *p = 0x11ff;
    short *q = new short[2];
    std::cout << "q address is " << q << std::endl;
    q[0] = 0xaaaa, q[1] = 0xcccc;
    std::cout << "p(set with 0x11ff) content is 0x" << std::hex << *p
              << std::dec << std::endl;
    delete[] p;
    delete[] q;
  }
  return 0;
}
