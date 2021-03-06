/**
 * Helper class for walking the AST of a project definition.
 */
export class TreeElement {
    public readonly element:any;
    public readonly errors:Array<string>;

    constructor(element:any, errors:Array<string> = []) {
        this.element = element;
        this.errors = errors;
    }
}