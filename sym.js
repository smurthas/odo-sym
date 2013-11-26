var assert = require('assert');

var SYM_DIGITS = [0, 1, 8];

var SYM_NUMS = [0, 1, 8, 11, 25, 52, 88, 101, 111, 181, 205, 215, 285, 502, 512,
    582, 808, 818, 888, 1001, 1111, 1251, 1521, 1881, 2005, 2115, 2255, 2525,
    2885, 5002, 5112, 5252, 5522, 5882, 8008, 8118, 8258, 8528, 8888, 10001,
    10101, 10801, 11011, 11111, 11811, 12051, 12151, 12851, 15021, 15121, 15821,
    18081, 18181, 18881, 20005, 20105, 20805, 21015, 21115, 21815, 22055, 22155,
    22855, 25025, 25125, 25825, 28085, 28185, 28885, 50002, 50102, 50802, 51012,
    51112, 51812, 52052, 52152, 52852, 55022, 55122, 55822, 58082, 58182, 58882,
    80008, 80108, 80808, 81018, 81118, 81818, 82058, 82158, 82858, 85028, 85128,
    85828, 88088, 88188, 88888];
function testFinder(fn, sliceBack) {
  var s = Date.now();
  var stop = SYM_NUMS.slice(sliceBack || -1)[0];
  console.error('stop', stop);
  for (var i = 1; i < stop; i++) {
    var next = fn(i);
    for (var j in SYM_NUMS) {
      if (SYM_NUMS[j] >= i) {
        assert.equal(next, SYM_NUMS[j], next + ' !== ' + SYM_NUMS[j] + ', number = ' +i);
        break;
      }
    }
  }
  console.log('Done. ET: ' + (Date.now() - s) + 'ms');
}

function isSym(number) {
  var s = number.toString();
  if (s.length === 0) return true;
  if (s.length === 1 && SYM_DIGITS.indexOf(s[0]) !== -1) return true;
  var a = parseInt(s.substr(0, 1), 10), b = parseInt(s.slice(-1), 10);
  if (a === 2 || a === 5) {
    if ( (a === 2 && b !== 5) || (a === 5 && b !== 2) ) return false;
  } else {
    if (a !== b || SYM_DIGITS.indexOf(a) === -1 ) return false;
  }
  return isSym(s.slice(1, -1));
}

function findNextSym1(number) {
  while (!isSym(number++)) {}
  return number-1;
}

function findNextSym2(number) {
  while (true) {
    if (isSym(number)) return number;
    var m = number % 10;
    if (m === 2) number += 3;
    else if (m === 5) number += 3;
    else if (m === 8) number += 3;
    else number++;
  }
}

function findNextSym3(number) {
  while (true) {
    if (isSym(number)) return number;
    var mh = number % 100;
    if (mh === 2) number += 3;
    else if (mh === 5) number += 3;
    else if (mh === 8) number += 3;
    else if (mh === 12) number += 3;
    else if (mh === 15) number += 3;
    else if (mh === 18) number += 3;
    else if (mh === 22) number += 3;
    else if (mh === 25) number += 3;
    else if (mh === 25) number += 26;
    else if (mh === 52) number += 3;
    else if (mh === 55) number += 3;
    else if (mh === 58) number += 23;
    else if (mh === 82) number += 3;
    else if (mh === 85) number += 3;
    else if (mh === 88) number += 13;
    else number++;
  }
}

function numLen(number) {
  if (number === 0 || number === 1) return 1;
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
  //var b = number % 10;

  // starting with 0 can happen because we are dealing with inner digits, so
  // 20345 will pass in 34 with N = 3, which means 034
  if (a === 0 || a === 1 || a === 2 || a === 5 || a === 8) {
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
      if (a === 1) return 2 * Math.pow(10, N-1) + 5;
      if (a === 2) return 5 * Math.pow(10, N-1) + 2;
      if (a === 5) return 8 * Math.pow(10, N-1) + 8;
      if (a === 0) return Math.pow(10, N-1) + 1;
    }
    var next;
    if (a === 0 || a === 1 || a === 8) next = a_pow + a + (innerNext * 10);
    else if (a === 2) next = a_pow + 5 + (innerNext * 10);
    else next = a_pow + 2 + (innerNext * 10);
    // this happens when the inner value holds constant and a < b which results
    // in the whole value going down. We'll increment and second to smallest
    if (next < number) return findNextSym4(number + 1, N);
    // phew, things worked out
    return next;

  }

  // for 2-7 we simply return 8____8 with N-2 zeros in the middle
  if (a > 2 && a < 5) return 5 * Math.pow(10, N-1) + 2;
  if (a > 5 && a < 8) return 8 * Math.pow(10, N-1) + 8;

  // a is 9, we need to carry over
  return -1;
}

//testFinder(findNextSym4);
//testFinder(findNextSym3);
assert(isSym(25));
testFinder(findNextSym4, -13);
