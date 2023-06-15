class Test {

  #a = 1

  #b() {
    return this.#a
  }

  get a() {
    return this.#b()
  }

}

export default Test
