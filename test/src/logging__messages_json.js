// test

function myFunc() {

}

myFunc()

function myFunc1(a1, a2) {
  console.log(a1, a2)
}

myFunc1()

function myFunc2(a1, a2) {
  if (a1) {
    a1(() => {
      console.log(a2)
    })
  }
}

myFunc2()
