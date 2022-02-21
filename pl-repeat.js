import { PlElement, TemplateInstance, createContext } from "polylib";

class PlRepeat extends PlElement {
    static get properties() {
        return {
            items: { observer: 'itemObserver' },
            as: { value: 'item' },
        }
    }
    rTpl;
    clones = [];
    constructor() {
        super({ lightDom: true });
    }
    connectedCallback() {
        super.connectedCallback();
        this.style.display = 'none';
        let tpl = this.querySelector('template');
        this.rTpl = tpl.tpl;
        this.oTpl = tpl;
        this._pti = tpl._pti;
        this._hti = tpl._hti;
        this.rTpl._dirtyRefresh = () => {
            this.dirtyRefresh();
        }
        this.pctx = tpl._pti?.ctx;
        /* render items if them already assigned */
        if (Array.isArray(this.items) && this.items.length > 0) {
            this.clones = this.renderItems(this.items, this);
        }
    }
    renderItems(items, sibling) {
        return items && items.map(i => {
            let ctx = createContext(this, i, this.as);
            let inst = new TemplateInstance(this.rTpl);
            let nodes = [...inst.childNodes];
            inst._hti = this._hti;
            ctx._ti = inst;
            inst.attach({ ...ctx, root: this.parentNode }, sibling, this._pti);
            let clone = { dom: nodes, _ti: inst };
            ctx.clone = clone;
            nodes.forEach(n => { n._io = this.oTpl; n._ctx = ctx; })
            return clone;
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.clones.forEach(c => this.detachClone(c));
    }
    dirtyRefresh() {
        this.clones.forEach(c => this.detachClone(c));
        this.clones = this.renderItems(this.items, this);
    }
    detachClone(clone) {
        clone._ti.detach();
        clone.dom.forEach(n => n.remove())
    }
    itemObserver(val, old, mutation) {
        /* init mutation skip, items render called from connectedCallback */
        if (mutation.init) return;
        let [, index, ...rest] = mutation.path.split('.');
        switch (mutation.action) {
            case 'upd':
                if (Number.isInteger(+index) && +index >= 0) {
                    // ищем клон
                    let clone = this.clones[+index];
                    let path = [this.as, ...rest].join('.');
                    clone._ti.applyEffects({ ...mutation, path });
                } else if (index === undefined) {
                    this.dirtyRefresh()
                }
                break;
            case 'splice':
                // deleted
                // ensure that path for this repeater
                if (mutation.path === 'items') {
                    for (let ind = mutation.index; ind < mutation.deletedCount + mutation.index; ind++) {
                        this.detachClone(this.clones[ind]);
                    }
                    this.clones.splice(mutation.index, mutation.deletedCount);
                    // added
                    let sibling = this.clones[mutation.index]?.dom[0];
                    let clones = this.renderItems(mutation.added, sibling || this);
                    this.clones.splice(mutation.index, 0, ...clones);
                    this.dispatchEvent(new CustomEvent('dom-changed', { bubbles: true, composed: true }));
                }
                break;
        }
    }
}

customElements.define('pl-repeat', PlRepeat);