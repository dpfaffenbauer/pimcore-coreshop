import {check, fail, group, sleep} from "k6";
import http from "k6/http";

export let options = {
    vus: 20,
    duration: '1m',
};

function addProductToCart(requestParams) {
    let response = http.get("https://coreshop-4.localhost/en/shop", {
        headers: requestParams,
    });

    checkStatus({
        response: response,
        expectedStatus: 200,
        failOnError: true,
        printOnError: true
    });

    const forms = response
        .html()
        .find("div[class*=product-col]")
        .find('form')
        .toArray();

    const formNames = forms.map(i => {
        return i.get(0).getAttribute("name");
    });

    const formName = formNames[Math.floor(Math.random() * forms.length)];

    response = response.submitForm({
        formSelector: 'form[name="' + formName + '"]',
        params: {
            headers: requestParams
        }
    });

    checkStatus({
        response: response,
        expectedStatus: 200,
        failOnError: true,
        printOnError: true
    });
}

function goToCheckout(requestParams) {
    let response = http.get("https://coreshop-4.localhost/en/shop/checkout/customer", {
        headers: requestParams,
    });

    var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var string = '';
    for (var ii = 0; ii < 15; ii++) {
        string += chars[Math.floor(Math.random() * chars.length)];
    }

    response = response.submitForm({
        formSelector: 'form[name="guest"]',
        fields: {
            'guest[gender]': 'female',
            'guest[firstname]': 'Pandora',
            'guest[lastname]': 'Flowers',
            'guest[email][first]': string + '@mailinator.com',
            'guest[email][second]': string + '@mailinator.com',
            'guest[address][company]': 'Chaney Madden Co',
            'guest[address][salutation]': 'mr',
            'guest[address][firstname]': 'Petra',
            'guest[address][lastname]': 'Ortiz',
            'guest[address][street]': 'Nihil repudiandae of',
            'guest[address][number]': '686',
            'guest[address][postcode]': '64675',
            'guest[address][city]': 'Nihil explicabo Ex',
            'guest[address][country]': '11',
            'guest[address][phoneNumber]': '+1 (693) 498-8241',
            'guest[termsAccepted]': '1',
            'guest[submit]': '',
        },
        params: {
            headers: requestParams
        }
    });

    checkStatus({
        response: response,
        expectedStatus: 200,
        failOnError: true,
        printOnError: true
    });
}

function goToPaymentStep(requestParams) {
    let response = http.get("https://coreshop-4.localhost/en/shop/checkout/payment", {
        headers: requestParams,
    });

    response = response.submitForm({
        formSelector: '.main-container form[name="coreshop"]',
        fields: {
            'coreshop[paymentProvider]': 1,
        },
        params: {
            headers: requestParams,
        }
    });

    checkStatus({
        response: response,
        expectedStatus: 200,
        failOnError: true,
        printOnError: true
    });
}

function finishCheckout(requestParams) {
    let response = http.get("https://coreshop-4.localhost/en/shop/checkout/summary", {
        headers: requestParams
    });

    response = response.submitForm({
        formSelector: '.main-container form[name="coreshop"]',
        submitSelector: '#coreshop_submitOrder',
        fields: {
            'coreshop[acceptTerms]': '1',
        },
        params: {
            headers: requestParams
        }
    });

    checkStatus({
        response: response,
        expectedStatus: 200,
        failOnError: true,
        printOnError: true
    });
}
function checkStatus({response, expectedStatus, expectedContent, failOnError, printOnError, dynamicIds}) {
    if (isEmpty(expectedStatus) && isEmpty(expectedContent)) {
        console.warn('No expected status or content specified in call to checkStatus for URL ' + response.url);
        return;
    }

    let contentCheckResult;
    let statusCheckResult;

    let url = response.url;

    if (dynamicIds) {
        dynamicIds.forEach((dynamicId) => {
            if (response.url.includes(dynamicId)) {
                url = url.replace(dynamicId, '[id]');
            }
        });
    }

    if (expectedContent) {
        contentCheckResult = check(response, {
            [`"${expectedContent}" in ${url} response`]: (r) => r.body.includes(expectedContent),
        });
    }

    if (expectedStatus) {
        const obj = {};
        obj[`${response.request.method} ${url} status ${expectedStatus}`] = (r) => r.status === expectedStatus;

        statusCheckResult = check(response, obj);
    }

    if (!statusCheckResult || !contentCheckResult && expectedContent) {
        if (printOnError && response.body) {
            console.log("Unexpected response: " + response.body);
        }
        if (failOnError) {
            if (!statusCheckResult && (!contentCheckResult && expectedContent)) {
                fail(`${response.request.method} ${url} status ${expectedStatus} and "${expectedContent}" not found in response`);
            } else {
                if (!statusCheckResult) {
                    fail(`Received unexpected status code ${response.status} for URL: ${url}, expected ${expectedStatus}`);
                } else if (!contentCheckResult) {
                    fail(`"${expectedContent}" not found in response for URL: ${url}`);
                }
            }
        }
    }
}

function isEmpty(str) {
    return (!str || str.length === 0);
}


export default function () {
    group("Checkout", function () {
        let requestParams = {
        };
        addProductToCart(requestParams);
        goToCheckout(requestParams);
        goToPaymentStep(requestParams);
        finishCheckout(requestParams)
    });
}
