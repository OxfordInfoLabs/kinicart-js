import Configuration from 'kiniauth/ts/configuration';
import Session from "kiniauth/ts/framework/session";

/**
 * API methods for accessing backend via fetch
 */
export default class Api {

    public getPackageProductPlans(identifier) {
        return this.callAPI(`/guest/packagedproduct/plans/${identifier}`);

    }

    public getPackageProductPlan(productIdentifier, planIdentifier) {
        return this.callAPI(`/guest/packagedproduct/plans/${productIdentifier}/${planIdentifier}`);
    }


    public addProductToCart(productIdentifier, packagedProductCartItemDescriptor, cartItemIndex) {
        return this.callAPI('/guest/packagedproduct/cartitem/' + productIdentifier + (cartItemIndex !== null ? "?cartItemIndex=" + cartItemIndex : ""), packagedProductCartItemDescriptor, 'POST', true);
    }

    public removeCartItem(index) {
        return this.callAPI('/guest/cart/remove?index=' + index);
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
            {paymentMethod}, 'POST');
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
     * @param rawResponse
     */
    private callAPI(url: string, params: any = {}, method: string = 'GET', rawResponse: boolean = false) {

        let csrf = url.includes("/account/");

        let response;
        if (csrf) {
            response = Session.getSessionData().then(session => {
                return this.makeAPICall(url, params, method, session)
            });
        } else {
            response = this.makeAPICall(url, params, method);
        }

        if (rawResponse)
            return response;
        else return response
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


    private makeAPICall(url: string, params: any = {}, method: string = 'GET', sessionData = null): Promise<Response> {
        if (url.indexOf("http") < 0)
            url = Configuration.endpoint + url;

        var obj: any = {
            method: method,
            credentials: 'include'
        };

        if (sessionData) {
            obj.headers = {
                'X-CSRF-TOKEN': sessionData.csrfToken
            };
        }

        if (method != 'GET') {
            obj.body = JSON.stringify(params);
        }

        // Clear session data
        Session.clearSessionData();

        return fetch(url, obj);

    }


}
