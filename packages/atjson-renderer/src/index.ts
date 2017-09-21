interface Annotation {
  type: string;
  attributes: Object;
  children: (Annotation|string)[];
}

interface Serializeable {
  toJSON(): Annotation
}

function compile(scope: Renderer, node: Annotation): string {
  let generator = scope.invoke(scope.renderAnnotation, node);
  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  return generator.next(node.children.map(function (childNode) {
    if (typeof childNode === 'string') {
      return childNode;
    } else {
      return compile(scope, childNode);
    }
  })).value;
}

export default abstract class Renderer {
  private scopes: Object[];

  constructor() {
    this.scopes = [];
  }

  pushScope(scope: any) {
    this.scopes.push(Object.assign({
      popScope: () => this.popScope(),
        pushScope: (scope: any) => this.pushScope(scope)
    }, scope));
  }

  popScope() {
    this.scopes.pop();
  }

  invoke(fn, ...args: any[]) {
    let scope = this.scopes[this.scopes.length - 1];
    return fn.call(scope, ...args);
  }

  abstract *renderAnnotation();

  willRender() {
    this.pushScope({});
  }

  didRender() {
    this.popScope();
  }

  render(annotationGraph: Serializeable) {
    this.willRender();
    let renderedDocument = compile(this, annotationGraph.toJSON());
    this.didRender();
    return renderedDocument;
  }
}