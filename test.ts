import { createClient } from "./src/setup/client";

createClient()
    .defineService({
        key: '',
        origin: '',
        name: '',
        version: '',
        description: '',
    })
    .apiKey('')
    .subscribeToFetch()
    .subscribeToHttp()
    .captureBody({maxBytes: 1024})
    .captureStreamBodies()
    .initialize();