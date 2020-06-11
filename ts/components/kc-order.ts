import Api from '../framework/api';
import RequestParams from 'kiniauth/ts/util/request-params';
import AuthKinibind from "kiniauth/ts/framework/auth-kinibind";


export default class KcOrder extends HTMLElement {

    constructor() {
        super();

        this.bind();
    }


    private bind() {

        const view = new AuthKinibind(
            this,
            {
                order: {},
                currency: ''
            });

        const api = new Api();

        const orderId = RequestParams.get().orderId;

        api.getOrder(orderId).then(order => {
            view.model.order = order;
            switch (order.currency) {
                case 'USD':
                    view.model.currency = '$';
                    break;
                case 'GBP':
                    view.model.currency = '£';
                    break;
                case 'EUR':
                    view.model.currency = '€';
                    break;
            }
        });
    }

}
