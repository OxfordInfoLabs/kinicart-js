import Configuration from "../configuration";

/**
 * API methods for accessing backend via fetch
 */
export default class Api {

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
