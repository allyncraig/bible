class ModalTag extends HTMLElement {
	connectedCallback() {
		this.innerHTML = '<p>This is my custom element.</p>';
	}
	static get observedAttributes() {
		return ['class'];
	}
}
customElements.define('Modal', ModalTag);