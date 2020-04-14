/**
 * Initialiser for kinicart
 */
// @ts-ignore
import Kiniauth from 'kiniauth/ts/index';
import KcPackagedProduct from './components/kc-packaged-product';
import KcCart from './components/kc-cart';
import KcCheckout from './components/kc-checkout';
import KcStripeElement from './components/kc-stripe-element';
import KcOrder from './components/kc-order';
import KcPackagedProductBuilder from "./components/kc-packaged-product-builder";


export default class Kinicart extends Kiniauth {

    constructor(params: any) {
        super(params);

    }


    public bindElements() {
        super.bindElements();

        // Create the custom elements we need
        customElements.define('kc-packaged-product', KcPackagedProduct);
        customElements.define('kc-packaged-product-builder', KcPackagedProductBuilder);
        customElements.define('kc-cart', KcCart);
        customElements.define('kc-checkout', KcCheckout);
        customElements.define('kc-stripe-element', KcStripeElement);
        customElements.define('kc-order', KcOrder);

    }


}
