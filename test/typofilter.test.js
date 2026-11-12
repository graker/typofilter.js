// Regression tests: node --test
// test/expected.json holds reviewed outputs for test/corpus.js. If a rule change
// alters an output on purpose, update the expected value by hand after review.
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

global.window = global;
require(path.join(__dirname, '..', 'typofilter.js'));
const T = window.Typographus;
const expected = require('./expected.json');

test('corpus and expected outputs are in sync', () => {
  assert.deepStrictEqual(expected.map((c) => c.input), require('./corpus'));
});

for (const { input, output } of expected) {
  test(`process: ${JSON.stringify(input)}`, () => {
    assert.strictEqual(T.process(input), output);
  });
  test(`idempotent: ${JSON.stringify(input)}`, () => {
    assert.strictEqual(T.process(output), output);
  });
}

test('safeblock content with replacement patterns is restored verbatim', () => {
  const code = '<code>$& $1 $$ $` $\'</code>';
  assert.strictEqual(T.process(code), code);
});

test('mdash gets a non-breaking space before it', () => {
  assert.strictEqual(T.process('a - b'), 'a — b');
});

test('nested quotes become „“, depth resets per paragraph', () => {
  assert.strictEqual(
    T.process('<p>"Фильм "<em>Матрица</em>" хорош" и "ещё"</p><p>"Новый" абзац</p>'),
    '<p>«Фильм „<em>Матрица</em>“ хорош» и «ещё»</p><p>«Новый» абзац</p>'
  );
  assert.strictEqual(T.process('"Незакрытая\n\nСледующий "абзац"'), '«Незакрытая\n\nСледующий «абзац»');
  assert.strictEqual(T.process('«a „b“ c» и «d»'), '«a „b“ c» и «d»');
});

test('dash before &nbsp; or at the end (partial selection in an editor)', () => {
  assert.strictEqual(T.process('два" -&nbsp;'), 'два» —&nbsp;');
  assert.strictEqual(T.process('слово -'), 'слово —');
  assert.strictEqual(T.process('-&nbsp;реплика'), '—&nbsp;реплика');
});
