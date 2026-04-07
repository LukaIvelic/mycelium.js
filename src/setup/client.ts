interface MyceliumClientOptions {
    apiKey: RegExp;
}

class MyceliumClient {
    private apiKey: string = "";

    constructor(apiKey: string){
        this.apiKey = apiKey
    }
}

export default MyceliumClient;