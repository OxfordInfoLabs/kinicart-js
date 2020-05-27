import Api from '../framework/api';
import Kinibind from "kiniauth/ts/framework/kinibind";


export default class KcCart extends HTMLElement {

    // View
    private view;

    constructor() {
        super();
        this.bind();
    }


    private bind() {
        this.view = new Kinibind(
            this,
            {
                cart: {},
                cartItems: null,
                removeCartItem: (event, model) => {

                    const api = new Api();
                    api.removeCartItem(model.$index).then(() => {
                        this.loadCart();
                    });
                }

            });

        this.loadCart();
    }

    private loadCart() {
        const api = new Api();
        api.getCart().then(cart => {
            this.view.setModelItem("cart", cart);
            this.view.setModelItem("cartItems", cart.items.length);
        });
    }

}
