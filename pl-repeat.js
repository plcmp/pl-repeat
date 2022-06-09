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
        this.sTpl = [...this.childNodes].find( n => n.nodeType === document.COMMENT_NODE && n.textContent.startsWith('tpl:'))?._tpl;
        let ti = new TemplateInstance(PlRepeat.repTpl);
        ti.attach(null, this, this);
    }

}

customElements.define('pl-repeat', PlRepeat);