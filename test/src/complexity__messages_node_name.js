'use strict';
/* global define */

function myFunc1() {}
myFunc1();


const myFunc2 = function() {};
myFunc2();


(function() {})();


define(function() {
  function myFunc3() {}
  return myFunc3;
});


class myClass1 {
  constructor() {}
  myMethod1() {}
  get myProp1() { return 1; }
  static myMethod1() {}
  static get myProp1() { return 1; }
  static['my method 2']() {}
}
new myClass1();


const mo1 = {
  ['my method 3']() {}
};
mo1['my method 3']();


const arr1 = () => {
  (arr2 => {
    console.log(arr2);
  })();
};
arr1();


define(function() {
  (function() {})();
  if (arr1) {
    if (mo1) {
      console.log(1);
    }
  }
});


const mo2 = {
  mo_op: {
    myMethod5() {}
  }
};
mo2.myMethod5();


const myFunc4 =
  function() {};
myFunc4();
