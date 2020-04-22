import Api from '../framework/api';
import Kinivue from "kiniauth/ts/framework/kinivue";


export default class KcCart extends HTMLElement {

    constructor() {
        super();

        this.bind();
    }


    private bind() {
        const view = new Kinivue({
            el: this.querySelector(".vue-wrapper"),
            data: {
                cart: {},
                cartItems: null
            },
            methods: {
                removeCartItem: (index) => {
                    const api = new Api();
                    api.removeCartItem(index).then(() => {
                        this.loadCart(view);
                    });
                }
            }
        });

        this.loadCart(view);
    }

    private loadCart(view) {
        const api = new Api();
        api.getCart().then(cart => {
            view.$data.cart = cart;
            view.$data.cartItems = cart.items.length;
        });
    }

}
