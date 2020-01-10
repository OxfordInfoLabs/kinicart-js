import Api from '../framework/api';
import Kiniauth from "../../../kiniauth-js/ts/index";

export default class KcPackagedProduct extends HTMLElement {

    constructor() {
        super();

        this.bind();
    }


    private bind() {
        const productIdentifier = this.getAttribute('data-product-identifier');
        const view = Kiniauth.kinibind.bind(this, {
            plans: {},
        });

        let api = new Api();

        api.getPackageProductPlans(productIdentifier).then(res => {
            view.models.plans = res;
        });


    }

}
