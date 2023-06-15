// test

function MyFunc(a, b, c, d) {
  console.log(a, b, c, d)
}

MyFunc()

function MyFunc1(a) {
  console.log(a)
}

MyFunc1()

function MyFunc2(a) {
  console.log(a)
}

MyFunc2()

function MyFunc3(a) {
  console.log(a)
}

MyFunc3()

function myFunc4(a1, a2) {
  if (a1) {
    a1(() => {
      console.log(a2)
    })
  }
}

myFunc4()
