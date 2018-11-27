'use strict';

function myFunc1() {}
myFunc1();


const myFunc2 = function() {};
myFunc2();


(function() {})();

/* global define */
define(function() {
  function myFunc3() {}
  return myFunc3;
});
