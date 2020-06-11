import Api from '../framework/api';
import AuthKinibind from "kiniauth/ts/framework/auth-kinibind";

declare var window: any;

export default class KcCheckout extends HTMLElement {

    private loadingElement: HTMLElement;
    private checkoutWidget: HTMLElement;
    private processingOrder: HTMLElement;

    private billingContactId;

    constructor() {
        super();

        this.loadingElement = document.getElementById('loading-checkout');
        this.checkoutWidget = document.getElementById('checkout-wrapper');
        this.processingOrder = document.getElementById('processing-order');
        this.checkoutWidget.style.display = 'none';
        this.processingOrder.style.display = 'none';

        this.bind();
    }


    private bind() {

        const view = new AuthKinibind(this,
            {
                cart: {},
                cartItems: 0,
                billingURL: '/checkout',
                billingContact: {},
                paymentMethods: []
            });

        const api = new Api();
        api.getCart().then(cart => {
            view.model.cart = cart;
            view.model.cartItems = cart.items.length;
        });

        api.getSessionData().then(session => {
            if (session.user || session.account) {
                api.getBillingContact().then(contact => {
                    if (contact) {
                        view.model.billingURL = '/billing?contact=' + contact.id;
                        view.model.billingContact = contact;
                        this.billingContactId = contact.id;
                        this.loadPaymentMethods(api, view);
                    } else {
                        const url = this.getAttribute('data-billing-url');
                        window.location.href = url;
                    }
                });
            } else {
                this.loadingElement.style.display = 'none';
                const url = this.getAttribute('data-security-url');
                window.location.href = url + '?signinSuccessURL=/checkout'
            }
        })
    }

    private loadPaymentMethods(api, view, paymentId?) {
        api.getPaymentMethods().then(paymentMethods => {
            let defaultId = 0;
            if (paymentMethods.length) {
                paymentMethods.forEach(method => {
                    if (!paymentId && method.defaultMethod) {
                        defaultId = method.id;
                    } else if (paymentId && method.payment.id === paymentId) {
                        defaultId = method.id;
                    }
                });
            }
            view.model.paymentMethods = paymentMethods;

            const placeOrders: any = document.getElementsByClassName('place-order');
            const payments = document.getElementsByName('paymentselected');
            payments.forEach((input: any) => {
                if (!paymentMethods.length) {
                    input.checked = 'checked';
                } else {
                    // Hide the New stripe element until the user selects to add one
                    document.getElementById('stripe-element').style.display = 'none';
                }

                input.addEventListener('change', function () {
                    if (this.value === 'new') {
                        document.getElementById('stripe-element').style.display = 'block';
                    } else {
                        document.getElementById('stripe-element').style.display = 'none';
                    }
                });
                if (input.value == defaultId) {
                    input.checked = 'checked';
                }
            });

            this.loadingElement.style.display = 'none';
            this.checkoutWidget.style.display = 'block';

            Array.from(placeOrders).forEach((element: any) => {
                element.addEventListener('click', this.processPaymentMethod.bind(this));
            });
        });
    }

    private processPaymentMethod() {
        let selectedPayment = null;
        const payments = document.getElementsByName('paymentselected');
        payments.forEach((input: any) => {
            if (input.checked) {
                selectedPayment = input.value;
            }
        });

        if (selectedPayment) {
            if (selectedPayment === 'new') {
                window.addPaymentMethod().then(res => {
                    if (!res.error) {
                        this.processOrder(res.method.id);
                    }
                }).catch(err => {
                });
            } else {
                this.processOrder(selectedPayment);
            }
        } else {
            alert('Please add/select a payment method');
        }
    }

    private processOrder(paymentMethod) {
        this.checkoutWidget.style.display = 'none';
        this.processingOrder.style.display = 'flex';
        const api = new Api();
        api.processOrder(this.billingContactId, paymentMethod)
            .then(res => {
                window.location.href = '/order-confirmation?orderId=' + res;
                // console.log(res);
            })
            .catch(err => {
                window.location.href = '/checkout';
                // console.log(err);
            })
    }

}
