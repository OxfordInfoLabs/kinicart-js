import * as kinibind from '../../node_modules/kinibind/dist/kinibind';
import Api from '../framework/api';
import RequestParams from '../../../kiniauth-js/ts/util/request-params';

export default class KcOrder extends HTMLElement {

    constructor() {
        super();

        this.bind();
    }


    private bind() {

        const view = kinibind.bind(this, {
            order: {},
            currency: ''
        });

        const api = new Api();

        const orderId = RequestParams.get().orderId;

        api.getOrder(orderId).then(order => {
            view.models.order = order;
            switch (order.currency) {
                case 'USD':
                    view.models.currency = '$';
                    break;
                case 'GBP':
                    view.models.currency = '£';
                    break;
                case 'EUR':
                    view.models.currency = '€';
                    break;
            }
        });
    }

}
