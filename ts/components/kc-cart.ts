import Api from '../framework/api';
import Kiniauth from '../../../kiniauth-js/ts/index';

export default class KcCart extends HTMLElement {

    constructor() {
        super();

        this.bind();
    }


    private bind() {
        const view = Kiniauth.kinibind.bind(this, {
            cart: {},
            cartItems: null
        });

        this.loadCart(view);
    }

    private loadCart(view) {
        const api = new Api();
        api.getCart().then(cart => {
            view.models.cart = cart;
            view.models.cartItems = cart.items.length;
            const deleteButtons = document.getElementsByClassName('delete');
            Array.from(deleteButtons).forEach((element: any, index) => {
                element.addEventListener('click', (event) => {
                    api.removeCartItem(index).then(() => {
                        this.loadCart(view);
                    });
                });
            });
        });
    }

}
