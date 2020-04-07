import Api from '../framework/api';

declare var window: any;

export default class KcStripeElement extends HTMLElement {

    private loadingElement: HTMLElement;

    private stripe;
    private clientSecret;
    private stripeCardElement;


    constructor() {
        super();

        this.loadScript();
    }


    private bind() {
        this.loadingElement = document.getElementById('loading-payment');
        this.loading(false);
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
        defaultCheckbox.className = 'mt050';
        defaultCheckbox.innerHTML = '<label><input type=\'checkbox\' id=\'default-card\' checked=\'checked\'/>Make Default</label>';

        this.appendChild(defaultCheckbox);

        this.stripe = stripe;
        this.clientSecret = clientSecret;
        this.stripeCardElement = stripeCardElement;

        window.addPaymentMethod = this.addPaymentMethod.bind(this);

        // const submitButton: HTMLButtonElement = document.createElement('button');
        // submitButton.id = 'add-stripe-card';
        // submitButton.textContent = 'Add Payment Method';
        // submitButton.className = 'but butsoftwh butsm';
        // submitButton.style.marginLeft = '0';
        // submitButton.style.marginTop = '.5rem';
        // submitButton.onclick = this.addPaymentMethod.bind(this, stripe, clientSecret, stripeCardElement);
        // this.appendChild(submitButton);
    }

    public addPaymentMethod() {
        return new Promise((resolve, reject) => {
            this.handleError();
            const cardholder: any = document.getElementById('cardholder-input');

            if (!cardholder.value) {
                this.handleError('Please enter the cardholder name');
                reject({ error: 'Please enter the cardholder name' });
                return false;
            }

            this.loading(true);
            return this.stripe.handleCardSetup(this.clientSecret, this.stripeCardElement, {
                payment_method_data: {
                    billing_details: {
                        name: cardholder.value
                    }
                }
            }).then(res => {
                if (res.setupIntent) {
                    const defaultCard: any = document.getElementById('default-card');
                    const api = new Api();
                    return api.addPaymentMethod(res.setupIntent.payment_method, defaultCard.checked)
                        .then(method => {
                            const event = new CustomEvent('paymentMethods', { detail: { paymentId: method.payment.id } });
                            document.dispatchEvent(event);
                            this.stripeCardElement.clear();
                            cardholder.value = '';
                            this.loading(false);
                            resolve({ method: method });
                        });
                } else if (res.error && res.error.message) {
                    this.loading(false);
                    this.handleError(res.error.message);
                    reject({ error: res.error.message });
                }
            })

        });

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

    private loading(show) {
        if (this.loadingElement) {
            this.loadingElement.style.display = show ? 'flex' : 'none';
            this.style.display = show ? 'none' : 'block';
        }
    }
}
