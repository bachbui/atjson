import { Parser } from '@atjson/contenttype-commonmark2';

describe('markdown -> atjson', function () {
  it('Correctly obtains annotations for simple inline elements', function () {
    let markdown = '*hello* __world__';
    let expectedAnnotations = [
      { type: 'parse-token', start: 0, end: 3, attributes: {}, htmlType: 'paragraph' },
      { type: 'parse-token', start: 40, end: 44, attributes: {}, htmlType: 'paragraph' },
      { type: 'paragraph', start: 3, end: 40, attributes: {} },
      { type: 'parse-token', start: 3, end: 7, attributes: {}, htmlType: 'em' },
      { type: 'parse-token', start: 12, end: 17, attributes: {}, htmlType: 'em' },
      { type: 'em', start: 7, end: 12, attributes: {} },
      { type: 'parse-token', start: 18, end: 26, attributes: {}, htmlType: 'strong' },
      { type: 'parse-token', start: 31, end: 40, attributes: {}, htmlType: 'strong' },
      { type: 'strong', start: 26, end: 31, attributes: {} }
    ];

    let parser = new Parser();
    let atjson = parser.parse(markdown);
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('Correctly handles multiple paragraphs', function () {
    let markdown = '12345\n\n\n678\n910\n\neleventwelve\n\n';

    let expectedAnnotations = [
      { type: 'parse-token', start: 0, end: 3, attributes: {}, htmlType: 'paragraph' },
      { type: 'parse-token', start: 8, end: 12, attributes: {}, htmlType: 'paragraph' },
      { type: 'paragraph', start: 3, end: 8, attributes: {} },
      { type: 'parse-token', start: 13, end: 16, attributes: {}, htmlType: 'paragraph' },
      { type: 'parse-token', start: 23, end: 27, attributes: {}, htmlType: 'paragraph' },
      { type: 'paragraph', start: 16, end: 23, attributes: {} },
      { type: 'parse-token', start: 28, end: 31, attributes: {}, htmlType: 'paragraph' },
      { type: 'parse-token', start: 43, end: 47, attributes: {}, htmlType: 'paragraph' },
      { type: 'paragraph', start: 31, end: 43, attributes: {} }
    ];

    let parser = new Parser();
    let atjson = parser.parse(markdown);
    expect(atjson.content).toBe('<p>12345</p>\n<p>678\n910</p>\n<p>eleventwelve</p>\n');
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('Correctly handles escape sequences', function () {
    let markdown = 'foo __\\___';
    let expectedAnnotations = [
      { type: 'parse-token', start: 0, end: 3, attributes: {}, htmlType: 'paragraph' },
      { type: 'parse-token', start: 25, end: 29, attributes: {}, htmlType: 'paragraph' },
      { type: 'paragraph', start: 3, end: 25, attributes: {} },
      { type: 'parse-token', start: 7, end: 15, attributes: {}, htmlType: 'strong' },
      { type: 'parse-token', start: 16, end: 25, attributes: {}, htmlType: 'strong' },
      { type: 'strong', start: 15, end: 16, attributes: {} }
    ];

    let parser = new Parser();
    let atjson = parser.parse(markdown);

    expect(atjson.content).toBe('<p>foo <strong>_</strong></p>\n');
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('Correctly handles simple code spans', function () {
    let markdown = '`a b`';

    let expectedAnnotations = [
      { type: 'parse-token', start: 0, end: 3, attributes: {}, htmlType: 'paragraph' },
      { type: 'parse-token', start: 19, end: 23, attributes: {}, htmlType: 'paragraph' },
      { type: 'paragraph', start: 3, end: 19, attributes: {} },
      { type: 'parse-token', start: 3, end: 9, attributes: {}, htmlType: 'code' },
      { type: 'parse-token', start: 12, end: 19, attributes: {}, htmlType: 'code' },
      { type: 'code', start: 9, end: 12, attributes: {} }
    ];

    let parser = new Parser();
    let atjson = parser.parse(markdown);

    expect(atjson.content).toBe('<p><code>a b</code></p>\n');
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('`` foo ` bar  ``', function () {
    let markdown = '`` foo ` bar  ``';
    let expectedAnnotations = [
      { type: 'parse-token', start: 0, end: 3, attributes: {}, htmlType: 'paragraph' },
      { type: 'parse-token', start: 25, end: 29, attributes: {}, htmlType: 'paragraph' },
      { type: 'paragraph', start: 3, end: 25, attributes: {} },
      { type: 'parse-token', start: 3, end: 9, attributes: {}, htmlType: 'code' },
      { type: 'parse-token', start: 18, end: 25, attributes: {}, htmlType: 'code' },
      { type: 'code', start: 9, end: 18, attributes: {} }
    ];
    let parser = new Parser();
    let atjson = parser.parse(markdown);
    expect(atjson.content).toBe('<p><code>foo ` bar</code></p>\n');
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('links', function () {
    let markdown = '[link](/url "title")\n[link](/url \'title\')\n[link](/url (title))';
    let expectedAnnotations = [
      { type: 'parse-token', start: 0, end: 3, attributes: {}, htmlType: 'paragraph' },
      { type: 'parse-token', start: 116, end: 120, attributes: {}, htmlType: 'paragraph' },
      { type: 'paragraph', start: 3, end: 116, attributes: {} },
      { type: 'parse-token', start: 3, end: 32, attributes: {}, htmlType: 'a' },
      { type: 'parse-token', start: 36, end: 40, attributes: {}, htmlType: 'a' },
      { type: 'a', start: 32, end: 36, attributes: { href: '/url', title: 'title' } },
      { type: 'parse-token', start: 41, end: 70, attributes: {}, htmlType: 'a' },
      { type: 'parse-token', start: 74, end: 78, attributes: {}, htmlType: 'a' },
      { type: 'a', start: 70, end: 74, attributes: { href: '/url', title: 'title' } },
      { type: 'parse-token', start: 79, end: 108, attributes: {}, htmlType: 'a' },
      { type: 'parse-token', start: 112, end: 116, attributes: {}, htmlType: 'a' },
      { type: 'a', start: 108, end: 112, attributes: { href: '/url', title: 'title' } }
    ];

    let parser = new Parser();
    let atjson = parser.parse(markdown);
    expect(atjson.content).toBe('<p><a href="/url" title="title">link</a>\n<a href="/url" title="title">link</a>\n<a href="/url" title="title">link</a></p>\n');
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('An ordered list with an embedded blockquote', function () {

    let markdown = '1.  A paragraph\n    with two lines.\n\n        indented code\n\n    > A block quote.';

    let parser = new Parser();
    let atjson = parser.parse(markdown);

    let c = atjson.content;
    let expectedAnnotations = [
      { type: 'ordered-list', start: 0, end: c.length - 1, attributes: {} },
      { type: 'list-item', start: 1, end: c.length - 2, attributes: {} },
      { type: 'paragraph', start: 2, end: c.indexOf('nes.') + 4, attributes: {} },
      { type: 'pre', start: c.indexOf('inden'), end: c.indexOf('code\n') + 5, attributes: {} },
      { type: 'code', start: c.indexOf('inden'), end: c.indexOf('code\n') + 5, attributes: {} },
      { type: 'blockquote', start: c.indexOf('\nA block'), end: c.indexOf('quote.\n') + 7, attributes: {} },
      { type: 'paragraph', start: c.indexOf('A block'), end: c.indexOf('quote.') + 6, attributes: {} }
    ];

    expect(atjson.content).toBe('<ol>\n<li>\n<p>A paragraph\nwith two lines.</p>\n<pre><code>indented code\n</code></pre>\n<blockquote>\n<p>A block quote.</p>\n</blockquote>\n</li>\n</ol>\n');
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('html blocks', function () {
    let markdown = '<DIV CLASS="foo">\n<p><em>Markdown</em></p>\n</DIV>\n';

    let parser = new Parser();
    let atjson = parser.parse(markdown);

    expect(atjson.content).toBe('<DIV CLASS="foo">\n<p><em>Markdown</em></p>\n</DIV>\n');
    expect(atjson.annotations).toEqual([{ type: 'html', start: 0, end: 49, attributes: {} }]);
  });

  it('tabs', function () {
    let markdown = '\tfoo\tbaz\t\tbim';

    let parser = new Parser();
    let atjson = parser.parse(markdown);

    expect(atjson.content).toBe('<pre><code>foo\tbaz\t\tbim</code></pre>\n');
  });

  it('hr', function () {
    let markdown = '*\t*\t*\t\n';

    let parser = new Parser();
    let atjson = parser.parse(markdown);

    expect(atjson.content).toBe('<hr />\n');
  });

  it('simple images', function () {
    let markdown = '![foo](/url "title")';

    let parser = new Parser();
    let atjson = parser.parse(markdown);

    expect(atjson.content).toBe('<p><img src="/url" alt="foo" title="title" /></p>\n');

    let expectedAnnotations = [
      { type: 'parse-token', start: 0, end: 3, attributes: {}, htmlType: 'paragraph' },
      { type: 'parse-token', start: 45, end: 49, attributes: {}, htmlType: 'paragraph' },
      { type: 'paragraph', start: 3, end: 45, attributes: {} },
      { type: 'parse-token', start: 3, end: 45, attributes: {}, htmlType: 'image' }
      { type: 'image', start: 3, end: 45, attributes: { src: '/url', title: 'title', alt: 'foo' } }
    ];

    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('Does not add extra paragraphs within list items', function () {
    let markdown = '- foo\n-\n- bar\n';

    let parser = new Parser();
    let atjson = parser.parse(markdown);

    expect(atjson.content).toBe('<ul>\n<li>foo</li>\n<li></li>\n<li>bar</li>\n</ul>\n');

    let expectedAnnotations = [
      { type: 'parse-token', start: 0, end: 4, attributes: {}, htmlType: 'unordered-list' },
      { type: 'parse-token', start: 41, end: 46, attributes: {}, htmlType: 'unordered-list' },
      { type: 'unordered-list', start: 4, end: atjson.content.length - 6, attributes: {} },
      { type: 'parse-token', start: 5, end: 9, attributes: {}, htmlType: 'list-item' },
      { type: 'parse-token', start: 12, end: 17, attributes: {}, htmlType: 'list-item' },
      { type: 'list-item', start: 9, end: 12, attributes: {} },
      { type: 'parse-token', start: 18, end: 22, attributes: {}, htmlType: 'list-item' },
      { type: 'parse-token', start: 22, end: 27, attributes: {}, htmlType: 'list-item' },
      { type: 'list-item', start: 22, end: 22, attributes: {} },
      { type: 'parse-token', start: 28, end: 32, attributes: {}, htmlType: 'list-item' },
      { type: 'parse-token', start: 35, end: 40, attributes: {}, htmlType: 'list-item' },
      { type: 'list-item', start: 32, end: 35, attributes: {} }
    ];

    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('fenced code blocks2', function () {
    let markdown = '``` ```\naaa\n';

    let parser = new Parser();
    let atjson = parser.parse(markdown);

    expect(atjson.content).toBe('<p><code></code>\naaa</p>\n');

    let expectedAnnotations = [
      { type: 'parse-token', start: 0, end: 3, attributes: {}, htmlType: 'paragraph' },
      { type: 'parse-token', start: 20, end: 24, attributes: {}, htmlType: 'paragraph' },
      { type: 'paragraph', start: 3, end: atjson.content.length - 5, attributes: {} },
      { type: 'parse-token', start: 3, end: 9, attributes: {}, htmlType: 'code' },
      { type: 'parse-token', start: 9, end: 16, attributes: {}, htmlType: 'code' },
      { type: 'code', start: 9, end: 9, attributes: {} }
    ];

    expect(atjson.annotations).toEqual(expectedAnnotations);
  });
});

