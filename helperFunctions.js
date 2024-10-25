function signExtend(value, num, base, prepend = true) {
  let s = value.toString(base)
  let missingNum = num - s.length
  if (missingNum > 0) {
    let zeros = "0".repeat(missingNum)
    if (prepend) s = zeros + s
    else s = s + zeros
  }
  return s
}