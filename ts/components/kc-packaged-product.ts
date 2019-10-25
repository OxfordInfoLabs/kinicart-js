import * as kinibind from '../../node_modules/kinibind/dist/kinibind';
import Api from '../framework/api';

export default class KcPackagedProduct extends HTMLElement {

    constructor() {
        super();

        const view = kinibind.bind(this, {
            plans: {}
        });

        const api = new Api();
        api.getPackageProductPlans('virtual-host').then(res => {
            view.models.plans = res;
        });


    }


}
