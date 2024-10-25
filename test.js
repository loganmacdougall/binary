function testFloatToIEEE() {
  let test = [
    [7, 8, 23],
    [2147483904, 8, 23],
    [3.00743350862e+38, 8, 23],
    [7.8474421207e+12, 8, 23],
    [-5.66, 8, 23],
    [-1.0E+11, 8, 23],
    [-1230984567, 8, 23],
    [9E+99, 8, 23],
    [-9E+99, 8, 23],
    [10000000003, 8, 23],
    [9999999999, 8, 23],
    [8E-40, 8, 23],
    [9E-40, 8, 23],
    [3E-44, 8, 23],
    [6E-39, 8, 23],
    [2.625, 4, 3]
  ]
  let testSolution = [
    "01000000111000000000000000000000",
    "01001111000000000000000000000001",
    "01111111011000100100000100010000",
    "01010100111001000110010000000000",
    "11000000101101010001111010111000",
    "11010001101110100100001110110111",
    "11001110100100101011111010101011",
    "01111111100000000000000000000000",
    "11111111100000000000000000000000",
    "01010000000101010000001011111001",
    "01010000000101010000001011111001",
    "00000000000010001011011000010011",
    "00000000000010011100110011010101",
    "00000000000000000000000000010101",
    "00000000010000010101010110001111",
    "01000010"
  ]

  for (let i = 0; i < test.length; i++) {
    let output = floatToIEEE(...test[i])
    if (output !== testSolution[i]) {
      console.log("Test failed")
      console.log("Inputs:   " + test[i])
      console.log("Output:   " + output)
      console.log("Solution: " + testSolution[i])
      return
    }
  }
  console.log("Tests passed!")
}

function testIEEEToFloat() {
  let test = [
    ["00111111100000000000000000000000", 8, 23],
    ["01000000010000000000000000000000", 8, 23],
    ["01000101", 4, 3]
  ]
  let testSolution = [
    1,
    3,
    3.25
  ]

  for (let i = 0; i < test.length; i++) {
    let output = IEEEToFloat(...test[i])
    if (output !== testSolution[i]) {
      console.log("Test failed")
      console.log("Inputs:   " + test[i])
      console.log("Output:   " + output)
      console.log("Solution: " + testSolution[i])
      return
    }
  }
  console.log("Tests passed!")
}