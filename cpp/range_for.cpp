// 只要类型拥有返回迭代器的begin和end成员
// 都可以使用范围for语句 for (auto it : range)
//
// g++ -std=c++11 range_for.cpp

#include <iostream>
#include <vector>

class Range {
 public:
  explicit Range(std::vector<int> v) : v_(v) {}
  std::vector<int>::iterator begin() { return v_.begin(); }
  std::vector<int>::iterator end() { return v_.end(); }

 private:
  std::vector<int> v_;
};

int main(int argc, const char *argv[]) {
  std::vector<int> v{1, 3, 5, 7};
  Range range{v};
  for (auto it : range) {
    std::cout << it << std::endl;
  }
  return 0;
}
