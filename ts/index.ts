/**
 * Initialiser for kinicart
 */
import Kiniauth from '../../kiniauth-js/ts/index';
import KcPackagedProduct from './components/kc-packaged-product';


export default class Kinicart extends Kiniauth {

    constructor(params: any) {
        super(params);

    }


    public bindElements() {
        super.bindElements();

        // Create the custom elements we need
        customElements.define('kc-packaged-product', KcPackagedProduct);
    }


}
