import * as kinibind from '../../node_modules/kinibind/dist/kinibind';
import Api from '../framework/api';
import RequestParams from '../../../kiniauth-js/ts/util/request-params';
import Configuration from '../../../kiniauth-js/ts/configuration';

export default class KcPackagedProduct extends HTMLElement {

    constructor() {
        super();

        this.bind();
    }


    private bind() {
        const productIdentifier = this.getAttribute('data-product-identifier');
        const view = kinibind.bind(this, {
            plans: {},
            fields: {},
            error: '',
            cart: {}
        });

        const api = new Api();
        api.getCart().then(cart => {
            view.models.cart = cart;
        });

        api.getPackageProductPlans(productIdentifier).then(res => {
            view.models.plans = res;

            const addCartElements = document.querySelectorAll('[data-add-to-cart]');
            addCartElements.forEach(addElement => {
                addElement.addEventListener('click', (event) => {
                    event.preventDefault();
                    let plan = RequestParams.get().plan;
                    if (!plan) {
                        plan = addElement.getAttribute('data-plan');
                    }
                    const params = {planIdentifier: plan};
                    Object.keys(view.models.fields).forEach(key => {
                        if (view.models.fields[key] !== undefined) {
                            params[key] = view.models.fields[key];
                        }
                    });

                    const addURL = this.getAttribute('data-add-url');
                    if (!addURL) {
                        api.addProductToCart(productIdentifier, plan).then(res => {
                            window.location.href = '/cart';
                        });
                    } else {
                        return fetch(Configuration.endpoint + addURL, {
                            method: 'POST',
                            credentials: 'include',
                            body: JSON.stringify(params)
                        })
                            .then((response) => {
                                if (response.text) {
                                    return response.text().then(function (text) {
                                        const res = text ? JSON.parse(text) : {};
                                        if (response.ok) {
                                            window.location.href = '/cart';
                                        } else {
                                            view.models.error = res.message;
                                        }
                                    });
                                }
                            });
                    }
                });
            });
        });


    }

}
