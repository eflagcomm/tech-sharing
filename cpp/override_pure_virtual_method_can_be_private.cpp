// g++ -std=c++11 override_pure_virtual_method_can_be_private.cpp

#include <iostream>

class Base {
 public:
  Base() {}
  virtual ~Base() {}

  virtual void Print() = 0;
};

class Derived : public Base {
 private:
  void Print() override { std::cout << "Derived\n"; }
};

int main(int argc, const char *argv[]) {
  Derived d;
  Base *b = &d;
  b->Print();
  return 0;
}
