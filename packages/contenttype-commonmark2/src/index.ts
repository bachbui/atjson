import { Annotation, AtJSON } from '@atjson/core';
import { Parser as HTMLParser } from '@atjson/contenttype-html';

import * as MarkdownIt from 'markdown-it';

const parser = MarkdownIt('commonmark');

export class Parser {

  parse(content: string): AtJSON {
    let htmlContent = parser.render(content);
    let htmlParser = new HTMLParser(htmlContent);
    let annotations = htmlParser.parse();

    return new AtJSON({ content: htmlContent, annotations });
  }
}
