import * as kinibind from '../../node_modules/kinibind/dist/kinibind';
import Api from '../framework/api';

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

        const view = kinibind.bind(this, {
            cart: {},
            cartItems: 0,
            billingURL: '/checkout',
            billingContact: {},
            paymentMethods: []
        });

        const api = new Api();
        api.getCart().then(cart => {
            view.models.cart = cart;
            view.models.cartItems = cart.items.length
        });

        api.getSessionData().then(session => {
            if (session.user || session.account) {
                api.getBillingContact().then(contact => {
                    if (contact) {
                        view.models.billingURL = '/billing?contact=' + contact.id;
                        view.models.billingContact = contact;
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
            view.models.paymentMethods = paymentMethods;

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
                    // Disable the pace order buttons while we're adding a new payment method
                    Array.from(placeOrders).forEach((element: any) => {
                        element.disabled = this.value === 'new';
                    });
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
                element.addEventListener('click', this.processOrder.bind(this));
            });

            document.addEventListener('paymentMethods', (event: any) => {
                const paymentId = event.detail.paymentId;
                this.loadPaymentMethods(api, view, paymentId);
            });
        })
    }

    private processOrder() {
        this.checkoutWidget.style.display = 'none';
        this.processingOrder.style.display = 'flex';
        let selectedPayment = null;
        const payments = document.getElementsByName('paymentselected');
        payments.forEach((input: any) => {
            if (input.checked) {
                selectedPayment = input.value;
            }
        });

        if (selectedPayment) {
            const api = new Api();
            api.processOrder(this.billingContactId, selectedPayment)
                .then(res => {
                    window.location.href = '/order-confirmation?orderId=' + res;
                    // console.log(res);
                })
                .catch(err => {
                    window.location.href = '/checkout';
                    // console.log(err);
                })
        } else {
            alert('Please select a payment method');
        }
    }

}
