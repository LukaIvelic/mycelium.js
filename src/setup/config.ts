class MyceliumClientConfig {
    private readonly apiKeyFormat = /AIza[0-9A-Za-z-_]{32}/;

    private isValidApiKeyFormat(apiKey: string){
        return this.apiKeyFormat.test(apiKey);
    }

    private isApiKeyInDatabase(apiKey: string){
        
    }
}

export default MyceliumClientConfig;