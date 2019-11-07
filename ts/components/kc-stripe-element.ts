import * as kinibind from '../../node_modules/kinibind/dist/kinibind';
import Api from '../framework/api';

declare var window: any;

export default class KcStripeElement extends HTMLElement {

    constructor() {
        super();

        this.loadScript();
    }


    private bind() {

        this.style.display = 'block';

        const api = new Api();

        api.stripePublishableKey()
            .then(key => {
                return window.Stripe(key);
            })
            .then(stripe => {
                api.createStripeSetupIntent().then(res => {
                    this.attachCardElement(stripe, res.client_secret);
                });
            });
    }


    private loadScript() {
        let script: HTMLScriptElement = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = this.bind.call(this);
        script.src = 'https://js.stripe.com/v3/';

        document.getElementsByTagName('head')[0].appendChild(script);
    }

    private attachCardElement(stripe: any, clientSecret: string) {
        const cardholderInput: HTMLInputElement = document.createElement('input');
        cardholderInput.type = 'text';
        cardholderInput.id = 'cardholder-input';
        cardholderInput.placeholder = 'Cardholder Name';
        cardholderInput.className = 'name-field bor1 py050 px050 w';
        this.appendChild(cardholderInput);

        const cardElement: HTMLDivElement = document.createElement('div');
        cardElement.id = 'card-element';
        cardElement.className = 'name-field bor1 w mt050';
        cardElement.style.borderColor = '#cccccc';
        cardElement.style.padding = '.6rem';
        this.appendChild(cardElement);
        const elements = stripe.elements();

        const style = {
            base: {
                color: '#242424',
                fontFamily: '"Open Sans", Helvetica, Arial, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#bbbbbb'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        };

        const stripeCardElement = elements.create('card', { style });
        stripeCardElement.mount('#card-element');

        const defaultCheckbox: HTMLDivElement = document.createElement('div');
        defaultCheckbox.className = "mt050";
        defaultCheckbox.innerHTML = '<label><input type=\'checkbox\' id=\'default-card\' checked=\'checked\'/>Make Default</label>';

        this.appendChild(defaultCheckbox);

        const submitButton: HTMLButtonElement = document.createElement('button');
        submitButton.id = 'add-stripe-card';
        submitButton.textContent = 'Add Payment Method';
        submitButton.className = 'but butsoftwh butsm';
        submitButton.style.marginLeft = '0';
        submitButton.style.marginTop = '.5rem';
        submitButton.onclick = this.addPaymentMethod.bind(this, stripe, clientSecret, stripeCardElement);
        this.appendChild(submitButton);
    }

    private addPaymentMethod(stripe, clientSecret, cardElement) {
        this.handleError();
        const cardholder: any = document.getElementById('cardholder-input');

        if (!cardholder.value) {
            this.handleError('Please enter the cardholder name');
            return false;
        }

        stripe.handleCardSetup(clientSecret, cardElement, {
            payment_method_data: {
                billing_details: {
                    name: cardholder.value
                }
            }
        }).then(res => {
            if (res.setupIntent) {
                const defaultCard: any = document.getElementById("default-card");
                const api = new Api();
                api.addPaymentMethod(res.setupIntent.payment_method, defaultCard.checked)
                    .then(method => {
                        const event = new CustomEvent("paymentMethods", {detail: {paymentId: method.payment.id}});
                        document.dispatchEvent(event);
                        cardElement.clear();
                        cardholder.value = '';
                    });
            } else if (res.error && res.error.message) {
                this.handleError(res.error.message);
            }
        })

    }

    private handleError(message?) {
        if (document.getElementById('card-error')) {
            this.removeChild(document.getElementById('card-error'));
        }

        if (message) {
            const errorElement = document.createElement('p');
            errorElement.textContent = message;
            errorElement.style.color = 'red';
            errorElement.id = 'card-error';
            this.appendChild(errorElement);
        }
    }
}
