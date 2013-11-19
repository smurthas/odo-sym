var assert = require('assert');

var SYM_NUMS = ['0', '1', '8'];

var CALLS = 0;

function isSym(number) {
  CALLS++;
  var s = number.toString();
  if (s.length === 0) return true;
  if (s.length === 1 && SYM_NUMS.indexOf(s[0]) !== -1) return true;
  var a = s.substr(0, 1), b = s.slice(-1);
  if ( a !== b || SYM_NUMS.indexOf(a) === -1 ) return false;
  return isSym(s.slice(1, -1));
}

function findNextSym(number) {
  while (!isSym(++number)) {}
  return number;
}

function findNextSym2(number) {
  while (true) {
    var m = number % 10;
    if (m === 1) number += 7;
    else if (m === 8) number += 3;
    else number++;
    if (isSym(number)) return number;
  }
}

function findNextSym3(number) {
  while (true) {
    var mh = number % 100;
    if (mh === 1) number += 7;
    else if (mh === 8) number += 3;
    else if (mh === 11) number += 7;
    else if (mh === 18) number += 63;
    else if (mh === 88) number += 13;
    else number++;

    if (isSym(number)) return number;
  }
}

function numLen(number) {
  return Math.ceil(Math.log(number)/Math.log(10));
}

function findNextSym4(number, N) {
  // N is number of digits

  // if we are called externally, set N and recurse
  if (N === undefined) {
    N = numLen(number);
    var next = findNextSym4(number, N);
    if (next !== -1)  return next;
    // our number must have started with a 9
    // it's easiest to just carry over an try again than handle this direectly
    return findNextSym4(Math.pow(10, N), N+1);
  }

  if (N === 0) return 0;
  if (N === 1) {
    if (number === 0 || number === 1 || number === 8) return number;
    if (number > 1 && number < 8) return 8;
    // 9 means we have to carry over and try again
    // we can't just return 11 because the parent fn is expecting a 1-digit #
    return -1;
  }

  // left-most digit
  var a = Math.floor(number/Math.pow(10, N-1));
  // right most digit
  var b = number % 10;

  // starting with 0 can happen because we are dealing with inner digits, so
  // 20345 will pass in 34 with N = 3, which means 034
  if (a === 0 || a === 1 || a === 8) {
    // might not need to increment this digit, go inwards
    var a_pow = a * Math.pow(10, N-1);
    var inner = Math.floor((number - a_pow) / 10);
    var innerNext = findNextSym4(inner, N-2);
    if (innerNext === -1) {
      // the recursion result requires use to carry over

      // 8 becomes 9 and 9 needs a carry over, so just carry over
      if (a === 8) return -1;
      // 1 and zero just jump up to the next sym digit and then fill in the
      // middle with zeros, e.g. 19991 becomes 80008
      if (a === 1) return 8 * Math.pow(10, N-1) + 8;
      if (a === 0) return Math.pow(10, N-1) + 1;
    }
    var next = a_pow + a + (innerNext * 10);
    // this happens when the inner value holds constant and a < b which results
    // in the whole value going down. We'll increment and second to smallest
    if (next < number) return findNextSym4(number + 10, N);
    // phew, things worked out
    return next;

  }

  // for 2-7 we simply return 8____8 with N-2 zeros in the middle
  if (a > 1 && a < 8) {
    return 8* Math.pow(10, N-1) + 8;
  }

  // a is 9, we need to carry over
  return -1;
}

assert(isSym(1));
assert(isSym(181));
assert(isSym(1001));
assert(isSym(0));
assert.equal(isSym(188), false);
assert.equal(findNextSym(71), 88);
assert.equal(findNextSym2(71), 88);
assert.equal(findNextSym3(71), 88);
assert.equal(findNextSym3(79), 88);
assert.equal(findNextSym4(71), 88);
assert.equal(findNextSym4(171), 181);
assert.equal(findNextSym4(1821), 1881);
assert.equal(findNextSym4(9), 11);
assert.equal(findNextSym4(99), 101);
assert.equal(findNextSym4(899), 1001);
assert.equal(findNextSym4(119), 181);
assert.equal(findNextSym4(11113), 11811);
assert.equal(findNextSym4(10113), 10801);


console.error('findNextSym(71)', findNextSym(71));

CALLS = 0;
var s = Date.now();
console.error('findNextSym(1156234771)', findNextSym(1156234771));
console.error('et:', Date.now() - s, 'ms,\ncalls:', CALLS);

CALLS = 0;
s = Date.now();
console.error('findNextSym2(1156234771)', findNextSym2(1156234771));
console.error('et:', Date.now() - s, 'ms,\ncalls:', CALLS);

CALLS = 0;
s = Date.now();
console.error('findNextSym3(1156234771)', findNextSym3(1156234771));
console.error('et:', Date.now() - s, 'ms,\ncalls:', CALLS);

CALLS = 0;
s = Date.now();
console.error('findNextSym4(1156234771)', findNextSym4(1156234771));
console.error('et:', Date.now() - s, 'ms,\ncalls:', CALLS);
