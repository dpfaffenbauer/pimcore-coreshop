export class CartInfo {
    private apiUrl: string;
    private elementSelector: string;

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
            }
            const html = await response.text();
            this.displayCartItems(html);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    _initCartWidget() {
        this.fetchCartItems();
    }
    displayCartItems(html: any) {
        const cartFlag = document.querySelector(this.elementSelector);
        if(cartFlag) {
            const loader = document.querySelector('.js-cart-loader');
            if(loader) {
               loader.remove();
            }
            cartFlag.innerHTML += html;
        }
    }
}
