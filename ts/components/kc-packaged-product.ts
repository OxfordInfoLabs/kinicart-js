import * as kinibind from '../../node_modules/kinibind/dist/kinibind';
import Api from '../framework/api';

export default class KcPackagedProduct extends HTMLElement {

    constructor() {
        super();

        this.bind();
    }


    private bind() {
        const productIdentifier = 'virtual-host';
        const view = kinibind.bind(this, {
            plans: {}
        });

        const api = new Api();
        api.getPackageProductPlans(productIdentifier).then(res => {
            view.models.plans = res;

            const addCartElements = document.querySelectorAll('[data-add-to-cart]');
            addCartElements.forEach(addElement => {
                addElement.addEventListener('click', () => {
                    const plan = addElement.getAttribute('data-plan');
                    api.addProductToCart(productIdentifier, plan).then(res => {
                        window.location.href = '/cart';
                    });
                });
            });
        });


    }

}
