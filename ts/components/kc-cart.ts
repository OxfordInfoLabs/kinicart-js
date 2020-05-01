import Api from '../framework/api';
import Kinivue from "kiniauth/ts/framework/kinivue";


export default class KcCart extends HTMLElement {

    // View
    private view;

    constructor() {
        super();
        this.bind();
    }


    private bind() {
        this.view = new Kinivue({
            el: this.querySelector(".vue-wrapper"),
            data: {
                cart: {},
                cartItems: null
            },
            methods: {
                removeCartItem: (index) => {
                    const api = new Api();
                    api.removeCartItem(index).then(() => {
                        this.loadCart();
                    });
                }
            }
        });

        this.loadCart();
    }

    private loadCart() {
        const api = new Api();
        api.getCart().then(cart => {
            this.view.cart = cart;
            this.view.cartItems = cart.items.length;
        });
    }

}
