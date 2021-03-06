export const log = console.log;

export const curry = (f) => (a, ..._) =>
  _.length ? f(a, ..._) : (..._) => f(a, ..._);

export const map = curry((f, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(f(a));
  }
  return res;
});

export const filter = curry((f, iter) => {
  let res = [];
  for (const a of iter) {
    if (f(a)) res.push(a);
  }
  return res;
});

export const reduce = curry((f, acc, iter) => {
  if (!iter) {
    iter = acc[Symbol.iterator]();
    acc = iter.next().value;
  }
  for (const a of iter) {
    acc = f(acc, a);
  }
  return acc;
});

export const go = (...args) => reduce((a, f) => f(a), args);
export const pipe = (f, ...fs) => (...as) => go(f(...as), ...fs);

export const take = curry((l, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(a);
    if (res.length == l) return res;
  }
  return res;
});

export const L = {};
L.range = function* (l) {
  let i = -1;
  while (++i < l) {
    yield i;
  }
};
L.map = curry(function* (f, iter) {
  for (const a of iter) yield f(a);
});
L.filter = curry(function* (f, iter) {
  for (const a of iter) if (f(a)) yield a;
});

export const takeAll = take(Infinity);

L.deepFlat = function* f(iter) {
  for (const a of iter) {
    if (isIterable(a)) yield* f(a);
    else yield a;
  }
};

export const isIterable = (a) => a && a[Symbol.iterator];

L.flatten = function* (iter) {
  for (const a of iter) {
    if (isIterable(a)) yield* a;
    // yield *iterable; is equal to for(const val of iterable) yield val;
    else yield a;
  }
};

export const flatten = pipe(L.flatten, takeAll);

L.flatMap = curry(pipe(L.map, L.flatten));
export const flatMap = curry(pipe(L.map, flatten));
