import Configuration from '../../../kiniauth-js/ts/configuration';

/**
 * API methods for accessing backend via fetch
 */
export default class Api {

    public getPackageProductPlans(identifier) {
        return this.callAPI(`/guest/packagedproduct/plans/${identifier}`);

    }

    public addProductToCart(productIdentifier, plan) {
        return this.callAPI('/guest/packagedproduct/cartitem/' + productIdentifier, {
            planIdentifier: plan
        }, 'POST');
    }

    public getCart() {
        return this.callAPI('/guest/cart');
    }

    public getSessionData() {
        return this.callAPI('/guest/session');
    }

    public getPaymentMethods() {
        return this.callAPI('/account/payment/methods');
    }

    public stripePublishableKey() {
        return this.callAPI('/account/stripe/publishableKey');
    }

    public createStripeSetupIntent() {
        return this.callAPI('/account/stripe/createSetupIntent');
    }

    public addPaymentMethod(paymentMethod, defaultMethod = true) {
        return this.callAPI(`/account/payment/saveMethod?defaultMethod=${defaultMethod}&provider=stripe`,
            { paymentMethod }, 'POST');
    }

    public processOrder(contactId, paymentMethodId) {
        return this.callAPI(`/account/order/process?paymentMethodId=${paymentMethodId}&contactId=${contactId}`);
    }

    public getOrder(id) {
        return this.callAPI(`/account/order?id=${id}`);
    }

    public getBillingContact() {
        return this.callAPI('/account/contact/contacts?type=BILLING')
            .then(contacts => {
                if (contacts.length) {
                    return contacts[0];
                }
                return null;
            });
    }

    /**
     * Call an API using fetch
     *
     * @param url
     * @param params
     * @param method
     */
    private callAPI(url: string, params: any = {}, method: string = 'GET') {


        url = Configuration.endpoint + url;

        const obj: any = {
            method: method,
            credentials: 'include'
        };

        if (method != 'GET') {
            obj.body = JSON.stringify(params);
        }

        return fetch(url, obj)
            .then((response) => {
                if (response.ok) {
                    return response.text().then(function (text) {
                        return text ? JSON.parse(text) : {}
                    })
                } else {
                    throw new Error(response.statusText);
                }
            })
            .then((data) => {
                return data;
            });

    }

}
