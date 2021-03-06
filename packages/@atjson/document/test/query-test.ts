import Document, { Annotation } from '../src/';
import AnnotationCollection from '../src/query';

describe('Document.where', () => {
  it('runs queries against existing annotations', () => {
    let doc = new Document({
      content: 'Hello',
      annotations: [{
        type: 'strong',
        start: 0,
        end: 5
      }, {
        type: 'em',
        start: 0,
        end: 5
      }]
    });

    doc.where({ type: 'strong' }).set({ type: 'bold' });
    doc.where({ type: 'em' }).set({ type: 'italic' });
    expect(doc.content).toBe('Hello');
    expect(doc.annotations).toEqual([{
      type: 'bold',
      start: 0,
      end: 5
    }, {
      type: 'italic',
      start: 0,
      end: 5
    }]);
  });

  it('set', () => {
    let doc = new Document({
      content: 'Hello',
      annotations: [{
        type: 'h1',
        start: 0,
        end: 5
      }]
    });

    doc.where({ type: 'h1' }).set({ type: 'heading', attributes: { level: 1 } });
    expect(doc.content).toBe('Hello');
    expect(doc.annotations).toEqual([{
      type: 'heading',
      attributes: {
        level: 1
      },
      start: 0,
      end: 5
    }]);
  });

  it('unset', () => {
    let doc = new Document({
      content: '\uFFFC\uFFFC',
      annotations: [{
        type: 'embed',
        attributes: {
          type: 'instagram',
          url: 'https://www.instagram.com/p/BeW0pqZDUuK/'
        },
        start: 0,
        end: 1
      },
      {
        type: 'embed',
        attributes: {
          type: 'instagram',
          url: 'https://www.instagram.com/p/BdyySYBDvpm/'
        },
        start: 1,
        end: 2
      }]
    });

    doc.where({ type: 'embed', attributes: { type: 'instagram' } }).set({ type: 'instagram' }).unset('attributes.type');
    expect(doc.content).toBe('\uFFFC\uFFFC');
    expect(doc.annotations).toEqual([{
      type: 'instagram',
      attributes: {
        url: 'https://www.instagram.com/p/BeW0pqZDUuK/'
      },
      start: 0,
      end: 1
    }, {
      type: 'instagram',
      attributes: {
        url: 'https://www.instagram.com/p/BdyySYBDvpm/'
      },
      start: 1,
      end: 2
    }]);
  });

  it('rename', () => {
    let doc = new Document({
      content: 'Conde Nast',
      annotations: [{
        type: 'a',
        attributes: {
          href: 'https://example.com'
        },
        start: 0,
        end: 5
      },
      {
        type: 'a',
        attributes: {
          href: 'https://condenast.com'
        },
        start: 6,
        end: 10
      }]
    });

    doc.where({ type: 'a' }).set({ type: 'link' }).rename({ attributes: { href: 'url' } });
    doc.addAnnotations();
    expect(doc.content).toBe('Conde Nast');
    expect(doc.annotations).toEqual([{
      type: 'link',
      attributes: {
        url: 'https://example.com'
      },
      start: 0,
      end: 5
    }, {
      type: 'link',
      attributes: {
        url: 'https://condenast.com'
      },
      start: 6,
      end: 10
    }]);
  });

  it('map with a patch mapping', () => {
    let doc = new Document({
      content: 'Conde Nast',
      annotations: [{
        type: 'a',
        attributes: {
          href: 'https://example.com'
        },
        start: 0,
        end: 5
      },
      {
        type: 'a',
        attributes: {
          href: 'https://condenast.com'
        },
        start: 6,
        end: 10
      }]
    });

    doc.where({ type: 'a' }).set({ type: 'link' }).map({ attributes: { href: 'url' } });
    expect(doc.content).toBe('Conde Nast');
    expect(doc.annotations).toEqual([{
      type: 'link',
      attributes: {
        url: 'https://example.com'
      },
      start: 0,
      end: 5
    }, {
      type: 'link',
      attributes: {
        url: 'https://condenast.com'
      },
      start: 6,
      end: 10
    }]);
  });

  it('map with function', () => {
    let doc = new Document({
      content: 'Conde Nast',
      annotations: [{
        type: 'a',
        attributes: {
          href: 'https://example.com'
        },
        start: 0,
        end: 5
      },
      {
        type: 'a',
        attributes: {
          href: 'https://condenast.com'
        },
        start: 6,
        end: 10
      }]
    });

    doc.where({ type: 'a' }).map(annotation => {
      return {
        type: 'link',
        start: annotation.start,
        end: annotation.end,
        attributes: {
          url: annotation.attributes ? annotation.attributes.href : '',
          openInNewTab: true
        }
      };
    });
    expect(doc.content).toBe('Conde Nast');
    expect(doc.annotations).toEqual([{
      type: 'link',
      attributes: {
        url: 'https://example.com',
        openInNewTab: true
      },
      start: 0,
      end: 5
    }, {
      type: 'link',
      attributes: {
        url: 'https://condenast.com',
        openInNewTab: true
      },
      start: 6,
      end: 10
    }]);
  });

  it('remove', () => {
    let doc = new Document({
      content: 'function () {}',
      annotations: [{
        type: 'code',
        start: 0,
        end: 14
      },
      {
        type: 'code',
        start: 0,
        end: 14
      }]
    });

    doc.where({ type: 'code' }).remove();
    expect(doc.content).toBe('function () {}');
    expect(doc.annotations).toEqual([]);
  });

  it('annotation expansion', () => {
    let doc = new Document({
      content: 'string.trim();\nstring.strip',
      annotations: [{
        type: 'code',
        start: 0,
        end: 14,
        attributes: {
          class: 'language-js',
          language: 'js'
        }
      },
      {
        type: 'code',
        start: 16,
        end: 28,
        attributes: {
          class: 'language-rb',
          language: 'rb'
        }
      }]
    });

    doc.where({ type: 'code' }).map(annotation => {
      return [{
        type: 'pre',
        start: annotation.start,
        end: annotation.end,
        attributes: annotation.attributes
      }, {
        type: 'code',
        start: annotation.start,
        end: annotation.end,
        attributes: {}
      }];
    }).unset('attributes.class');

    expect(doc.content).toBe('string.trim();\nstring.strip');
    expect(doc.annotations).toEqual([{
      type: 'pre',
      start: 0,
      end: 14,
      attributes: {
        language: 'js'
      }
    }, {
      type: 'code',
      start: 0,
      end: 14,
      attributes: {}
    }, {
      type: 'pre',
      start: 16,
      end: 28,
      attributes: {
        language: 'rb'
      }
    }, {
      type: 'code',
      start: 16,
      end: 28,
      attributes: {}
    }]);
  });

  describe('AnnotationCollection.join', () => {
    let doc: Document;

    beforeEach(() => {
      doc = new Document({
        content: 'string.trim();\nstring.strip\nextra',
        annotations: [{
          type: 'code',
          start: 0,
          end: 14,
          attributes: {
            class: 'language-js',
            language: 'js'
          }
        },
        {
          type: 'pre',
          start: 0,
          end: 14,
          attributes: { }
        },
        {
          type: 'pre',
          start: 16,
          end: 28,
          attributes: { }
        },
        {
          type: 'code',
          start: 30,
          end: 35
        }]
      });
    });

    describe('simple join', () => {

      let code;
      let pre;
      let preAndCode: AnnotationCollection;

      beforeEach(() => {
        code = doc.where({ type: 'code' }).as('code');
        pre = doc.where({ type: 'pre' }).as('pre');

        preAndCode = code.join(pre, (l, r) => l.start === r.start && l.end === r.end);
      });

      it('should construct an AnnotationJoin', () => {

        expect(preAndCode.annotations[0]).toEqual({
          code: {
            type: 'code',
            start: 0,
            end: 14,
            attributes: {
              class: 'language-js',
              language: 'js'
            }
          },
          pre: [
            { type: 'pre', start: 0, end: 14, attributes: {} }
          ]
        });
      });

      describe('transform', () => {

        beforeEach(() => {
          preAndCode.transform(join => {
            doc.removeAnnotation(join.pre[0]);

            let newAttributes = Object.assign(join.code.attributes, {
              textStyle: 'pre'
            });
            let newCode = Object.assign(join.code, {attributes: newAttributes});

            doc.replaceAnnotation(join.code, newCode);
            doc.deleteText({start: 2, end: 4} as Annotation);

            return {
              update: [[join.code, newCode]],
              remove: [join.pre[0]]
            };
          });
        });

        it('successfully transforms the document', () => {
          expect(doc.annotations.filter(x => x.type === 'pre')).toEqual(
            [{ type: 'pre', start: 14, end: 26, attributes: {} }]
          );
        });

        it('updates the annotations on the AnnotationCollection', () => {
          expect(preAndCode.annotations).toEqual([
            {
              type: 'code',
              start: 0,
              end: 12,
              attributes: {
                class: 'language-js',
                language: 'js',
                textStyle: 'pre'
              }
            }
          ]);
        });
      });
    });

    describe('complex (three-way) join', () => {
      let pre;
      let code;
      let locale;
      let allJoin: AnnotationCollection;

      beforeEach(() => {
        doc.addAnnotations({
          type: 'locale',
          start: 0,
          end: 14,
          attributes: { locale: 'en-us' }
        }, {
          type: 'pre',
          start: 0,
          end: 14,
          attributes: { style: 'color: red' }
        });

        code = doc.where({ type: 'code' }).as('code');
        pre = doc.where({ type: 'pre' }).as('pre');
        locale = doc.where({ type: 'locale' }).as('locale');

        allJoin = code.join(pre, (l, r) => l.start === r.start && l.end === r.end)
                      .join(locale, (l, r) => l.code.start === r.start && l.code.end === r.end);
      });

      it('constructs a valid join', () => {
        expect(allJoin.annotations).toEqual([{
          code: {
            type: 'code',
            start: 0,
            end: 14,
            attributes: {
              class: 'language-js',
              language: 'js'
            }
          },
          pre: [{
            type: 'pre',
            start: 0,
            end: 14,
            attributes: { }
          }, {
            type: 'pre',
            start: 0,
            end: 14,
            attributes: { style: 'color: red' }
          }],
          locale: [{
            type: 'locale',
            start: 0,
            end: 14,
            attributes: { locale: 'en-us' }
          }]
        }]);
      });

      describe('transform', () => {
        beforeEach(() => {
          allJoin.transform(join => {

            doc.insertText(0, 'Hello!\n');

            let removeAnnotations: Annotation[] = [];
            let newAttributes = {};
            join.pre.forEach((x: Annotation) => {
              Object.assign(newAttributes, x.attributes);
              doc.removeAnnotation(x);
              removeAnnotations.push(x);
            });
            newAttributes = Object.assign(newAttributes, { locale: join.locale[0].attributes.locale });
            removeAnnotations.push(join.locale[0]);
            doc.removeAnnotation(join.locale[0]);

            let newCode = Object.assign(join.code, {
              attributes: Object.assign(join.code.attributes, newAttributes)
            });
            doc.replaceAnnotation(join.code, newCode);

            return {
              update: [[join.code, newCode]],
              remove: removeAnnotations
            };
          });
        });

        it('does the transform right', () => {
          expect(allJoin.annotations).toEqual([
            {
              type: 'code',
              start: 7,
              end: 21,
              attributes: {
                locale: 'en-us',
                style: 'color: red',
                class: 'language-js',
                language: 'js'
              }
            }
          ]);
        });

        it('updates the document', () => {
          expect(doc.annotations).toEqual([
            {
              type: 'code', start: 7, end: 21, attributes: {
                class: 'language-js',
                language: 'js',
                locale: 'en-us',
                style: 'color: red'
              }
            },
            {
              type: 'pre', start: 23, end: 35, attributes: {}
            },
            {
              type: 'code', start: 37, end: 42
            }
          ]);
        });
      });
    });
  });
});
