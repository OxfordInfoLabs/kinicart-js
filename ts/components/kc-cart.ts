import * as kinibind from '../../node_modules/kinibind/dist/kinibind';
import Api from '../framework/api';

export default class KcCart extends HTMLElement {

    constructor() {
        super();

        this.bind();
    }


    private bind() {

        const view = kinibind.bind(this, {
            cart: {},
            cartItems: null
        });

        const api = new Api();
        api.getCart().then(cart => {
            view.models.cart = cart;
            view.models.cartItems = cart.items.length;
        });
    }

}
