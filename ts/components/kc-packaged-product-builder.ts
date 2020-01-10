import Kiniauth from "../../../kiniauth-js/ts/index";
import Api from "../framework/api";
import RequestParams from "../../../kiniauth-js/ts/util/request-params";
import Configuration from "../../../kiniauth-js/ts/configuration";
import StandardForm from "../../../kiniauth-js/ts/components/standard-form";

/**
 * Product builder for generic packaged products
 */
export default class KcPackagedProductBuilder extends StandardForm {


    // Kinibind model
    private model: any;

    // Product identifier
    private productIdentifier: string;


    // Success url
    private successUrl: string = "/cart/";

    // Cart item index
    private cartItemIndex = null;

    constructor() {
        super();
        this.initialise();
    }


    private initialise() {


        this.productIdentifier = this.getAttribute('data-product-identifier');

        this.model = Kiniauth.kinibind.bind(this, {
            plan: {},
            addOns: [],
            packageTotal: 0.00,
            update: null
        });


        // Register fields
        let fields = {};
        this.querySelectorAll("input").forEach((item) => {
            for (let key in item.dataset) {
                if (key.substr(key.length - 5) == "Field") {
                    let propertyName = key.substr(0, key.length - 5);
                    fields[propertyName] = {
                        "required": "You must supply a " + propertyName
                    }

                }
            }
        });

        this.fields = fields;


        const api = new Api();

        // If we are in the default plan based configuration state call the get package product plan logic.
        if (RequestParams.get().plan) {

            this.model.models.update = 0;

            api.getPackageProductPlan(this.productIdentifier, RequestParams.get().plan).then(plan => {

                this.initialiseBuilder(plan, null);
            });
        } else if (RequestParams.get().cartItem) {

            this.cartItemIndex = RequestParams.get().cartItem;
            this.model.models.update = 1;

            // Get the cart first.
            api.getCart().then(cart => {

                let cartItem = cart.items[Number(RequestParams.get().cartItem)];

                for (let key in cartItem.otherProperties) {
                    if (fields[key]) {
                        fields[key].value = cartItem.otherProperties[key];
                    }
                }
                this.setFieldValues(fields);


                api.getPackageProductPlan(this.productIdentifier, cartItem.subType).then(plan => {
                    this.initialiseBuilder(plan, cartItem);

                });


            });

        }


    }


    // Initialise builder optionally with a cart
    private initialiseBuilder(plan, cartItem) {

        // Add the plan to the models.
        this.model.models.plan = plan;

        if (plan.relatedAddOns) {
            let addOns = [];
            plan.relatedAddOns.forEach((addOn, index) => {

                let quantity = 0;

                if (cartItem && cartItem.subItems) {
                    cartItem.subItems.forEach((cartAddOn) => {
                        if (cartAddOn.subType == addOn.identifier) {
                            quantity = cartAddOn.quantity;
                        }
                    });
                }

                addOns.push({
                    addOnIndex: String(index),
                    quantity: quantity,
                    item: addOn,
                    total: quantity * addOn.activePrices.MONTHLY
                })
            });

            this.model.models.addOns = addOns;
        }


        this.querySelectorAll("[data-add-on-index]").forEach((item) => {

            item.addEventListener("click", (event) => {

                let target = <HTMLElement>(event.currentTarget);

                let addOnIndex = target.getAttribute("data-add-on-index");
                if (target.hasAttribute("data-quantity-plus")) {
                    this.changeAddOnQuantity(addOnIndex, 1, null);
                } else if (target.hasAttribute("data-quantity-minus")) {
                    this.changeAddOnQuantity(addOnIndex, -1, null);
                } else if (target.hasAttribute('data-deselect')) {
                    this.changeAddOnQuantity(addOnIndex, null, 0);
                } else if (target.hasAttribute('data-select')) {
                    this.changeAddOnQuantity(addOnIndex, null, 1);
                }
            });
        });


        // Submit the form when clicking
        const addCartElements = document.querySelectorAll('[data-add-to-cart]');
        addCartElements.forEach(addElement => {
            addElement.addEventListener("click", (event) => {
                this.successUrl = (<HTMLElement>event.target).hasAttribute("data-destination") ?
                    (<HTMLElement>event.target).getAttribute("data-destination") : "/cart/";
                this.getElementsByTagName("form").item(0).dispatchEvent(new Event("submit"));
            });
        });


        // Recalculate package total
        this.recalculatePackageTotal();

    }


    // Change the add on quantity
    private changeAddOnQuantity(addOnIndex, adjustment, quantity) {

        let addOn = this.model.models.addOns[addOnIndex];
        let addOnQuantity = addOn.quantity;

        if (adjustment)
            addOnQuantity += adjustment;

        else if (quantity !== null)
            addOnQuantity = quantity;

        if (addOnQuantity >= 0 && addOnQuantity <= addOn.item.maxQuantity) {
            addOn.quantity = addOnQuantity;
            this.recalculatePackageTotal();

        }


    }

    // Recalculate the package total
    private recalculatePackageTotal() {

        let packageTotal = this.model.models.plan.activePrices.MONTHLY;

        this.model.models.plan.total = this.model.models.plan.activePrices.MONTHLY.toFixed(2);

        this.model.models.addOns.forEach((item) => {
            if (item.quantity > 0) {
                let total = item.quantity * item.item.activePrices.MONTHLY;
                item.total = total.toFixed(2);
                packageTotal += total;
            }

        });


        // Calculate package total
        this.model.models.packageTotal = packageTotal.toFixed(2);

    }


    // Main submit form logic
    public submitForm(fieldValues: any): Promise<any> {

        const api = new Api();


        let plan = this.model.models.plan;
        let addOns = this.model.models.addOns;

        let addOnDescriptors = [];
        addOns.forEach((addOn) => {
            if (addOn.quantity > 0)
                addOnDescriptors.push({
                    addOnIdentifier: addOn.item.identifier,
                    quantity: addOn.quantity
                });
        });


        let cartItemDescriptor = {
            planIdentifier: plan.identifier,
            addOnDescriptors: addOnDescriptors,
        };

        cartItemDescriptor = {...cartItemDescriptor, ...fieldValues};

        const addURL = this.getAttribute('data-add-url');
        if (!addURL) {
            return api.addProductToCart(this.productIdentifier, cartItemDescriptor, this.cartItemIndex);
        } else {
            return fetch(Configuration.endpoint + addURL + (this.cartItemIndex !== null ? "?cartItemIndex=" + this.cartItemIndex : ""), {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(cartItemDescriptor)
            });
        }

    }

    // Redirect to the cart on success
    public success(jsonResponse: any) {
        window.location.href = this.successUrl;
    }

    // Show global error message if failure.
    public failure(jsonResponse: any) {
        alert(jsonResponse.message);
    }


}
