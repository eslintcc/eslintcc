'use strict';
/* global define */

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
  myMethod3() {},
  ['my method 3']() {}
};
myObject1['my method 3']();


async function func6(a1) {
  for (let a in a1) {
    await a();
  }
  let y = x => {
    if (x) {
      console.log(x);
    }
  };
  y();

  function func6IN(a1) {
    if (a1) {
      console.log(a1);
    }
  }
  func6IN();
}
func6();


const arr1 = () => {
  (arr2 => {
    console.log(arr2);
  })();
};
arr1();


define(function() {
  (function() {})();
  if (arr1) {
    if (arr1) {
      console.log(1);
    }
  }
});


const myObject2 = {
  mo_op: {
    myMethod5() {}
  }
};
myObject2.mo_op.myMethod5();


const myFunc4 =
  function() {};
myFunc4();


const myObject3 = {
  myFunc5: function() {},
  myFunc6: function myFunc7() {},
};
myObject3.myFunc5();
