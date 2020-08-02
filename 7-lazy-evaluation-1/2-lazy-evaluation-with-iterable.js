import { curry, go, pipe, map, reduce, filter, log, L } from "../lib/fx.js";

console.clear();

/**
 * # 이터러블 중심 프로그래밍에서의 지연 평가 (Lazy Evaluation)
 * - 제때 계산법
 * - 느긋한 계산법
 * - 제너레이터 / 이터레이터 프로토콜을 기반으로 구현
 */

/**
 * ### L.map
 */

L.map = curry(function* (f, iter) {
  for (const a of iter) yield f(a);
});

const it = L.map((a) => a + 10, [1, 2, 3]);
log([...it]);

/**
 * ### L.filter
 */

L.filter = curry(function* (f, iter) {
  for (const a of iter) if (f(a)) yield a;
});

const it2 = L.filter((a) => a % 2, [1, 2, 3, 4]);
log([...it2]);

console.clear();

/**
 * ### range, map, filter, take, reduce 중첩 사용
 */

const range = (l) => {
  let i = -1;
  let res = [];
  while (++i < l) {
    res.push(i);
  }
  return res;
};

const take = curry((l, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(a);
    if (res.length == l) return res;
  }
  return res;
});

go(
  range(10),
  map((n) => n + 10),
  filter((n) => n % 2),
  take(2),
  log
);

/**
 * ### L.range, L.map, L.filter, take, reduce 중첩 사용
 */

go(
  L.range(10),
  L.map((n) => n + 10),
  L.filter((n) => n % 2),
  take(2),
  log
);

/**
 * ### map, filter 계열 함수들이 가지는 결합 법칙
 *
 * - 사용하는 데이터가 무엇이든지
 * - 사용하는 보조 함수가 순수 함수라면 무엇이든지
 * - 아래와 같이 결합한다면 둘 다 결과가 같다.
 *
 * [[mapping, mapping], [filtering, filtering], [mapping, mapping]]
 * =
 * [[mapping, filtering, mapping], [mapping, filtering, mapping]]
 */

/**
 * ## 결과를 만드는 함수 reduce, take
 *
 * ### reduce
 */

L.entries = function* (obj) {
  for (const k in obj) yield [k, obj[k]];
};

console.clear();

const join = curry((sep = ",", iter) =>
  reduce((a, b) => `${a}${sep}${b}`, iter)
);

// Fully lazy compared to Object.entries, map
const queryStr = pipe(
  L.entries,
  L.map(([k, v]) => `${k}=${v}`),
  join("&")
);

log(queryStr({ limit: 10, offset: 10, type: "notice" }));

function* a() {
  yield 10;
  yield 11;
  yield 12;
  yield 13;
}

log(join(" - ", a()));

/**
 * ### take, find
 */

console.clear();

const users = [
  { age: 32 },
  { age: 31 },
  { age: 37 },
  { age: 28 },
  { age: 25 },
  { age: 32 },
  { age: 31 },
  { age: 37 },
];

// When we use L.filter instead of filter,
// we postpone the calculation so that we can process the data more efficiently.
const find = curry((f, iter) => go(iter, L.filter(f), take(1), ([a]) => a));

log(find((u) => u.age < 30)(users));

go(
  users,
  L.map((u) => u.age),
  find((n) => n < 30),
  log
);
