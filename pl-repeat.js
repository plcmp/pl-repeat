import {PlElement, TemplateInstance, html} from "polylib";

class PlRepeat extends PlElement {
    static get properties() {
        return {
            as: { value: 'item' },
            sTpl: { type: Object }
        }
    }
    static repTpl = html`<template d:repeat="{{items}}" d:as="[[as]]">[[sTpl]]</template>`;
    constructor() {
        super({ lightDom: true });
    }
    connectedCallback() {
        super.connectedCallback();
        console.log('deprecated pl-repeat')
        let tplEl = [...this.childNodes].find( n => n.nodeType === document.COMMENT_NODE && n.textContent.startsWith('tpl:'));
        this.sTpl = tplEl?._tpl;
        this._ti = new TemplateInstance(PlRepeat.repTpl);
        this._ti.attach(null, this, [this, ...tplEl._hctx]);
    }

}

customElements.define('pl-repeat', PlRepeat);