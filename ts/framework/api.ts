import Configuration from "../../../kiniauth-js/ts/configuration";

/**
 * API methods for accessing backend via fetch
 */
export default class Api {

    public getPackageProductPlans(identifier) {
        return this.callAPI(`/guest/packagedproduct/plans/${identifier}`)
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

    /**
     * Call an API using fetch
     *
     * @param url
     * @param params
     * @param method
     */
    private callAPI(url: string, params: any = {}, method: string = "GET") {


        url = Configuration.endpoint + url;

        const obj: any = {
            method: method,
            credentials: "include"
        };

        if (method != "GET") {
            obj.body = JSON.stringify(params);
        }

        return fetch(url, obj);

    }

}
