import Api from '../framework/api';
import RequestParams from 'kiniauth/ts/util/request-params';
import Kinibind from "kiniauth/ts/framework/kinibind";


export default class KcOrder extends HTMLElement {

    constructor() {
        super();

        this.bind();
    }


    private bind() {

        const view = new Kinibind(
            this,
            {
                order: {},
                currency: ''
            });

        const api = new Api();

        const orderId = RequestParams.get().orderId;

        api.getOrder(orderId).then(order => {
            view.setModelItem("order", order);
            switch (order.currency) {
                case 'USD':
                    view.setModelItem("currency", '$');
                    break;
                case 'GBP':
                    view.setModelItem("currency", '£');
                    break;
                case 'EUR':
                    view.setModelItem("currency", '€');
                    break;
            }
        });
    }

}
