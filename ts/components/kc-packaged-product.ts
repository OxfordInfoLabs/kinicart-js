import Api from '../framework/api';
import Configuration from "kiniauth/ts/configuration";
import AuthKinibind from "kiniauth/ts/framework/auth-kinibind";


export default class KcPackagedProduct extends HTMLElement {

    constructor() {
        super();

        this.bind();
    }


    private bind() {

        const productIdentifier = this.getAttribute('data-product-identifier');
        const view = new AuthKinibind(
            this,
            {
                plans: {}
            });


        let api = new Api();

        api.getPackageProductPlans(productIdentifier).then(res => {
            view.model.plans = res;
        });


        this.querySelectorAll("[data-add-to-cart]").forEach((item) => {

            item.addEventListener("click", event => {


                let addToCart = <HTMLElement>event.target;

                let cartItemDescriptor = {
                    planIdentifier: addToCart.getAttribute("data-plan"),
                    addOnDescriptors: []
                };

                this.doAddToCart(productIdentifier, cartItemDescriptor).then(() => {
                    let destination = addToCart.getAttribute("data-destination");
                    window.location.href = destination ? destination : "/cart";
                });

            });

        });


    }


    // Do add to cart
    private doAddToCart(productIdentifier: string, addDescriptor: any): Promise<any> {

        let api = new Api();

        const addURL = this.getAttribute('data-add-url');
        if (!addURL) {
            return api.addProductToCart(productIdentifier, addDescriptor, this.getAttribute("data-cart-item-index"));
        } else {
            return fetch(Configuration.endpoint + addURL, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(addDescriptor)
            });
        }


    }

}
