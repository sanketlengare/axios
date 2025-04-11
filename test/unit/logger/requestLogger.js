import axios from '../../../lib/axios.js'
import assert from 'assert';


const originalAdapter = axios.defaults.adapter;

const STUB_RESPONSES = {
    GET: {
        data: {message: 'GET stub'},
        status: 200,
        statusText: 'OK',
        headers: {},
        request: {}
    },
    POST: {
        data: {message: 'POST stub'},
        status: 200,
        statusText: '',
        headers: {},
        request: {}
    },
    PUT: {
        data: {message: 'ERROR stub'},
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
    }
}

const stubAdapter = (config) => {
    const method = config.method.toLowerCase();
    if (method === 'get') {
        return Promise.resolve({...STUB_RESPONSES.GET, config});
    } else if (method === 'post') {
        return Promise.resolve({...STUB_RESPONSES.POST, config});
    } else if (method === 'put') {
        return Promise.resolve({...STUB_RESPONSES.PUT, config});
    } else {
        return Promise.reject(new Error(`Unexpected request: ${config.method} ${config.url}`));
    }
}

describe('Axios Request Logging', () => {
    beforeEach(() => {
        axios.clear_request_log();
        axios.disable_request_logging();
        axios.defaults.adapter = originalAdapter;
    });

    afterEach(() => {
        axios.defaults.adapter = originalAdapter;
    });



    it("Should log when logging is not disabled", async () => {

        axios.defaults.adapter = stubAdapter;

        axios.enable_request_logging();
        await axios.get('https://httpbin.org/get');
        const logs = axios.get_request_log();

        assert.strictEqual(logs.length, 1);
        assert.strictEqual(logs[0].method,'GET');
        assert.strictEqual(logs[0].url,'https://httpbin.org/get');
        assert.strictEqual(logs[0].status,200);
    });

    it("Should not log when logging is disabled", async () => {

        axios.defaults.adapter = stubAdapter;

        await axios.get('https://httpbin.org/get');
        const logs = axios.get_request_log();

        assert.strictEqual(logs.length, 0);
    });

    it("Should log an error request when logging is not disabled", async () => {

        axios.defaults.adapter = stubAdapter;
        axios.enable_request_logging();
        await axios.put('https://httpbin.org/put');
        const logs = axios.get_request_log();

        assert.strictEqual(logs.length, 1);
        assert.strictEqual(logs[0].method,'PUT');
        assert.strictEqual(logs[0].url,'https://httpbin.org/put');
        assert.strictEqual(logs[0].status,500);
    });

    it("Should log multiple requests when logging is not disabled", async () => {

        axios.defaults.adapter = stubAdapter;
        axios.enable_request_logging();
        await axios.get('https://httpbin.org/get');
        await axios.post('https://httpbin.org/post');
        await axios.put('https://httpbin.org/put');
        const logs = axios.get_request_log();
        const expectedLogs = [
            { method: 'GET', url: 'https://httpbin.org/get', status: 200 },
            { method: 'POST', url: 'https://httpbin.org/post', status: 200 },
            { method: 'PUT', url: 'https://httpbin.org/put', status: 500}
        ];

        assert.strictEqual(logs.length, 3);
        assert.deepStrictEqual(logs, expectedLogs);
    });

    it("Should log multiple requests the clear successfully", async () => {

        axios.defaults.adapter = stubAdapter;
        axios.enable_request_logging();
        await axios.get('https://httpbin.org/get');
        await axios.post('https://httpbin.org/post');

        const logs = axios.get_request_log();
        const expectedLogs = [
            { method: 'GET', url: 'https://httpbin.org/get', status: 200 },
            { method: 'POST', url: 'https://httpbin.org/post', status: 200 }
        ];

        assert.strictEqual(logs.length, 2);
        assert.deepStrictEqual(logs, expectedLogs);

        axios.clear_request_log();
        const logsCleared = axios.get_request_log();
        assert.strictEqual(logsCleared.length, 0);
    });

    it("Should not log an error if error.response is undefined - no response exists", async () => {
        axios.defaults.adapter = (config) => {
            const error = new Error("Network error");
            error.config = config;
            return Promise.reject(error);
        };

        axios.enable_request_logging();
        try {
            await axios.get("https://httpbin.org/get");
        } catch(error) {
            // Expected error
        }

        const logs = axios.get_request_log();
        assert.strictEqual(logs.length, 0);
    });
});