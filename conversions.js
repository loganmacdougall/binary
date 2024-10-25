let float_exp = document.getElementById("conversions-operation-float-exp")
let float_man = document.getElementById("conversions-operation-float-man")

let floatDec = document.getElementById("conversions-operation-floats-dec")

let floatBinContainer = document.getElementById("conversions-operation-float-bin")

let floatActual = document.getElementById("conversions-operation-float-actual")
let floatError = document.getElementById("conversions-operation-float-error")

window.onload = () => { 
  float_exp.addEventListener("change", onChangeUpdateBin)
  float_man.addEventListener("change", onChangeUpdateBin)
  floatDec.addEventListener("change", onChangeUpdateBin)

  floatBinContainer.addEventListener("change", () => {
    let inputs = getFloatInputs()
    floatDec.value = IEEEToFloat(inputs.bits, inputs.expBits, inputs.manBits)
    updateOutput()
  })

  onChangeUpdateBin()
}

function onChangeUpdateBin() {
  let inputs = getFloatInputs()
  if (isNaN(inputs.float) || isNaN(inputs.expBits) || isNaN(inputs.manBits)) {
    let p = document.createElement("p")
    p.textContent = "Make sure all the fields are filled in"
    floatBinContainer.replaceChildren(p)
    floatActual.textContent = "Actual Value: NaN"
  floatError.textContent = "Conversion Error: NaN"
    return
  }
  let bits = floatToIEEE(inputs.float, inputs.expBits, inputs.manBits)
  updateFloatBinContainer(bits, inputs.expBits, inputs.manBits)
  updateOutput()
}

function updateOutput() {
  inputs = getFloatInputs()
  let actualValue = IEEEToFloat(inputs.bits, inputs.expBits, inputs.manBits)
  floatActual.textContent = "Actual Value: " + actualValue.toString()
  floatError.textContent = "Conversion Error: " + (inputs.float - actualValue)
}

function pushBitToContainer(classname, id, container) {
  let bitid = `bit-${id}`
  let inputBit = document.createElement("input")
  inputBit.classList.add(classname)
  inputBit.classList.add("float-bit")
  inputBit.id = bitid
  inputBit.type = "checkbox"
  container.push(inputBit)
  let labelBit = document.createElement("label")
  labelBit.htmlFor = bitid
  inputBit.classList.add("float-bit-label")
  container.push(labelBit)
}

function updateFloatBinContainer(bits, expBits, manBits) {
  let bitId = 1
  let inputBits = []

  pushBitToContainer("float-sign-bit", 0, inputBits)

  for (let i = 0; i < expBits; i++) {
    pushBitToContainer("float-exp-bit", bitId, inputBits)
    bitId++
  }

  for (let i = 0; i < manBits; i++) {
    pushBitToContainer("float-man-bit", bitId, inputBits)
    bitId++
  }

  inputBits.forEach((bit, i) => {
    if (i % 2 == 1) return // Only want inputs, not labels
    if (bits.charAt(i/2) === "1") bit.checked = true
    else bit.checked = false
  })

  floatBinContainer.replaceChildren(...inputBits)
}

class floatData {
  constructor(expBits, manBits, float, bits) {
    this.expBits = expBits
    this.manBits = manBits
    this.float = float
    this.bits = bits
  }
}

function getFloatInputs() {
  let expBits = Number.parseInt(float_exp.value)
  let manBits = Number.parseInt(float_man.value)
  let float = Number.parseFloat(floatDec.value)
  let bits = ""
  Array.from(floatBinContainer.children).forEach((bit, i) => {
    if (i % 2 == 1) return // Only want inputs, not labels
    if (bit.checked) bits += "1"
    else bits += "0"
  })

  return new floatData(expBits, manBits, float, bits)
}

function floatToIEEE(float, numExpBits, numManBits) {
  let absFloat = Math.abs(float)
  let exp = Math.log(absFloat)/Math.log(2)

  //Special case for 0, all zeros
  if (float === 0) {
    return "0".repeat(1 + numExpBits + numManBits)
  }

  //Get the sign bit
  let signBit = float > 0 ? "0" : "1"

  //Get the num for the Exponet bits
  let expNum = Math.floor(exp) + Math.pow(2, numExpBits - 1) - 1
  let expBin, manNum, manBin

  //extremely small
  if (expNum <= -(numManBits - 1)) {
    return "0".repeat(1 + numExpBits + numManBits) //all zeros
  }
  //denormalized
  else if (expNum <= 0) {
    expBin = "0".repeat(numExpBits)
    manNum = (absFloat / Math.pow(2,Math.floor(exp)))
    manBin = signExtend(manNum, numManBits + 1 - Math.abs(expNum), 2, true).slice(2)
    manBin = "0".repeat(Math.abs(expNum)) + "1" + manBin
  // normalized
  } else {

    //If the number is out of bounds of the exponet bits, return infinity
    //signbit, max exponet exp (all ones), min mantissa (all zeros)
    if (expNum >= Math.pow(2, numExpBits) - 1) {
      expBin = '1'.repeat(numExpBits)
      let manBin = '0'.repeat(numManBits)
      return signBit + expBin + manBin
    } else {
      expBin = signExtend(expNum, numExpBits, 2, true)
    }

    //Get the binary string for the Mantissa bits
    manNum = (absFloat / Math.pow(2,Math.floor(exp)))
    manBin = signExtend(manNum, numManBits + 2, 2, false).slice(2)
  }

  if (manBin.length > numManBits) {
    //Round to even
    let lastBit = manBin.charAt(numManBits - 1)
    let pastBits = manBin.slice(numManBits)
    let halfWay = "1" + "0".repeat(pastBits.length - 1)
    let pastBitsNum = Number.parseInt(pastBits)
    let halfWayNum = Number.parseInt(halfWay)
    if (pastBitsNum === halfWayNum) {
      let tmp_value = Number.parseInt(manBin.slice(0,numManBits), 2)
      if (lastBit === "1") tmp_value += 1
      manBin = signExtend(Number.parseInt(tmp_value), numManBits, 2, true)
    } else if (pastBitsNum > halfWayNum) {
      let tmp_value = Number.parseInt(manBin.slice(0,numManBits), 2) + 1
      manBin = signExtend(Number.parseInt(tmp_value), numManBits, 2, true)

    } else {
      manBin = manBin.slice(0,numManBits)
    }
  }

  return signBit + expBin + manBin
}

function IEEEToFloat(IEEE, numExpBits, numManBits) {
  let signBit = IEEE.slice(0,1)
  let expBin = IEEE.slice(1, numExpBits + 1)
  let manBin = IEEE.slice(numExpBits + 1)

  let expOnes = "1".repeat(numExpBits)
  let manZeros = "0".repeat(numManBits)

  let sign = signBit === "0" ? 1 : -1

  if (expBin === expOnes) {
    if (manBin === manZeros) {
      return Infinity * sign
    } else {
      return NaN
    }
  }
  
  //Math.pow(2, numExpBits - 1) - 1
  let exp = Number.parseInt(expBin, 2)
  expNum = exp - (Math.pow(2, numExpBits - 1) - 1)

  let man
  if (exp === 0) {
    man = Number.parseInt(manBin, 2) / Math.pow(2, manBin.length)
  } else {
    man = 1 + Number.parseInt(manBin, 2) / Math.pow(2, manBin.length)
  }

  return sign * man * Math.pow(2, expNum)

}