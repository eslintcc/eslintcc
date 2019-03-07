'use strict';

function func1(a1) {
  console.log(a1);
}
func1();

const func2 = function func2(a1) {
  console.log(a1);
};
func2();

(function() {})();

const func3 = function(a1) {
  console.log(a1);
};
func3();

const func4 = a1 => {
  if (a1) {
    console.log(a1);
  }
  switch (a1) {
    case 'value':
      console.log(a1);
      break;
    default:
      console.log(a1);
      break;
  }
};
func4();

async function func5(a1) {
  await console.log(a1);
}
func5();


class myClass1 {
  constructor() {}
  myMethod1() {}
  get myProp1() { return 1; }
  static myMethod1() {}
  static get myProp1() { return 1; }
  static['my method 2']() {}
}
new myClass1();


const myObject1 = {
  ['my method 3']() {}
};
myObject1['my method 3']();
