import Api from '../framework/api';
import RequestParams from 'kiniauth/ts/util/request-params';
import Kinivue from "kiniauth/ts/framework/kinivue";

export default class KcOrder extends HTMLElement {

    constructor() {
        super();

        this.bind();
    }


    private bind() {

        const view = new Kinivue({
            el: this.querySelector(".vue-wrapper"),
            data: {
                order: {},
                currency: ''
            }
        });

        const api = new Api();

        const orderId = RequestParams.get().orderId;

        api.getOrder(orderId).then(order => {
            view.$data.order = order;
            switch (order.currency) {
                case 'USD':
                    view.$data.currency = '$';
                    break;
                case 'GBP':
                    view.$data.currency = '£';
                    break;
                case 'EUR':
                    view.$data.currency = '€';
                    break;
            }
        });
    }

}
