function strictCheckVariables(names) {
  let exit = 0

  for (const name of names) {
    if (!(name in process.env)) {
      console.error(`Не задана переменная окружения "${name}"`)
      exit = 1
    }
  }
  if (exit) {
    process.exit(exit)
  }
}


exports.strictCheckVariables = strictCheckVariables
