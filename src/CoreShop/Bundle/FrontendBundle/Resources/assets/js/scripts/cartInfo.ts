export class CartInfo {
    private readonly apiUrl: string;          // Marked as readonly
    private readonly elementSelector: string;  // Marked as readonly

    constructor(apiUrl: string, elementSelector: string) {
        this.apiUrl = apiUrl;
        this.elementSelector = elementSelector;
        this._initCartWidget();
    }

    async fetchCartItems() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                console.error('There has been a problem with your fetch operation:', response.statusText);
                return;  // Added return to prevent further execution if there's an error
            }
            const html = await response.text();
            this.displayCartItems(html);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    private _initCartWidget() { // Made this private for better encapsulation
        this.fetchCartItems();
    }

    private displayCartItems(html: string) { // Changed any to string for better type safety
        const cartFlag = document.querySelector(this.elementSelector);
        if (cartFlag) {
            const loader = document.querySelector('.js-cart-loader');
            if (loader) {
                loader.remove();
            }
            cartFlag.innerHTML += html;
        }
    }
}
