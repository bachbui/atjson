import { Annotation, AtJSON } from '@atjson/core';
import { Parser as HTMLParser } from '@atjson/commonmark-html';

import * as MarkdownIt from 'markdown-it';

const parser = MarkdownIt('commonmark');

export class Parser {

  parse(content: string): AtJSON {
    let htmlContent = parser.render(this.markdownContent);
    let htmlParser = new HTMLParser(htmlContent);
    let annotations = HTMLParser.parse(htmlContent);

    return new AtJSON({
      conent: content,
      annotations: this.annotations
    });
  }
}
