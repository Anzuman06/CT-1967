const assert = require("assert");
const fs = require('fs');
const path = require('path');

// Adjust this path based on the actual location of environments.json
const envFilePath = path.join('C:\\Users\\ASUS\\OneDrive\\Documents\\MeldCXAPP\\Money_Transfer\\WUNextGenKioskApp-v1.20.2j-release-default','environments.json');
// Function to get the customerRegistrationFormat from environments.json
function getCustomerRegistrationFormat() {
    const envData = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
    return envData.SEND_MONEY_CONFIG.customerRegistrationFormat;
}
describe("CT-1967 RegisterNewCustomer API payload automation", () => {
    it("should capture and verify registerNewCustomer API payload for v1/v2/v3/v4", async () => {
        // Retrieve registration format from environments.json
        const registrationFormat = getCustomerRegistrationFormat();
        // Initialize the mock in the test block to ensure a fresh instance for each run
        const mockRegisterNewCustomer = await browser.mock(
            'http://192.168.68.107:8081/racbcspf/v1/rac/bpo/customer/register',
            { method: 'POST' }
        );
        // Load the page
        await browser.url('http://127.0.0.1:5500');

        // Wait for the click button to be displayed
        const clickButton = await $("#click-button");
        await clickButton.waitForDisplayed({ timeout: 10000 });
        await clickButton.click();

        // Enter a 12-digit random number
        const numberArray = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
        const numberLocator1 = num => `//div[@data-analytics-component='Numpad']//button[@aria-label='${num}' and @tabindex='0']`;

        for (const num of numberArray) {
            await $(numberLocator1(num)).click();
        }

        await $('//button[@aria-label="Terminado"]').click();
        await browser.pause(5000);

        // Entering OTP code
        const codeNumber = [2, 2, 2, 2, 2, 2];
        const OTP = num => `//div[@data-analytics-component='Numpad']//button[@aria-label='${num}' and @tabindex='0']`;

        for (const num of codeNumber) {
            await $(OTP(num)).click();
        }

        await $('//button[@class="components__NumpadItem-sc-1fgmark-2 bsckYD"]').click();
        await browser.pause(7000);

        // Entering valid birthday
        const generateValidBirthday = () => {
            const currentDate = new Date();
            const earliestValidDate = new Date(currentDate.getFullYear() - 18, currentDate.getMonth(), currentDate.getDate());
            const randomDate = new Date(
                earliestValidDate.getFullYear() - Math.floor(Math.random() * 82),
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
            );

            const month = String(randomDate.getMonth() + 1).padStart(2, '0');
            const day = String(randomDate.getDate()).padStart(2, '0');
            const year = randomDate.getFullYear();
            return `${month}/${day}/${year}`;
        };

        const birthday = generateValidBirthday();
        const birthdayArray = birthday.split('').filter(char => char !== '/');
        const numberLocator = num => `//div[@data-analytics-component='Numpad']//button[@aria-label='${num}' and @tabindex='0']`;

        for (const num of birthdayArray) {
            await $(numberLocator(num)).click();
        }

        await $("(//button[@class='components__NumpadItem-sc-1fgmark-2 bsckYD'])[1]").click();
        console.log(`Entered birthday: ${birthday}`);

        // Complete other steps
        await browser.pause(7000);
        await $("//button[@aria-label='Enviar dinero']").click();
        await $('//button[@aria-label="Si entiendo"]').click();
        await browser.pause(5000);
        await $("//button[@aria-label='US Dollar']").click();
        await $('//button[@aria-label="Continuar"]').click();
        await $('//button[@aria-label="Si entiendo"]').click();
        await $("//span[normalize-space()='Nombre de pila']").$("//input[@placeholder='Ingresar nombre de pila']").setValue("John");
        await $("//span[normalize-space()='Apellido']").$("//input[@placeholder='Ingresar apellido']").setValue("DOE");
        await $("//span[normalize-space()='Estado']").$("//input[@id='state-dropdown']").setValue("California");
        await $("//div[@class='components__DetailsForm-sc-1bsunor-2 fqHQCj']").click();
        await $("//button[@aria-label='Continuar']").click();
        await browser.pause(5000);

        await $("//span[normalize-space()='Primer Nombre']").$("//input[@placeholder='Ingresar nombre']").setValue("Yoy");
        await $("//span[normalize-space()='Apellido']").$("//input[@placeholder='Ingresar apellido']").setValue("Dop");
        await $("//input[@placeholder='Ingresar nombre de la cuidad']").setValue("dd");
        await $("//input[@id='state-dropdown']").setValue("California");
        await $("//input[@placeholder='Ingresar código postal']").setValue("12345");
        await $("//input[@id='search']").click();
        await $("//input[@id='search']").setValue("kkkk");
        await $("//div[@class='components__ModalWrapper-dkei8z-4 NMnOg']").click();
        await $("//button[@class='Button-zquyky-1 cWOeYY']").click();
        await $("//button[@aria-label='No, continúa']").click();
    
        const confirmButton = await $("//button[@aria-label='Confirmar para continuar']");
        await confirmButton.click();
       await browser.pause(20000);

       // Retrieve all captured requests
       const requests = mockRegisterNewCustomer.calls;
       console.log("Captured Requests:", requests);  // Log requests for debugging

       // Check if at least one request was captured
       assert.ok(requests.length > 0, "Request payload not captured");

       // Parse the payload data from the first captured request
       const requestPayload = requests[0].request['goog:postData'];
       const payloadData = requestPayload ? JSON.parse(requestPayload) : null;

       // Ensure payload data exists
       assert(payloadData, "Payload data is undefined");

       if (registrationFormat === 'v1') {
        assert.ok(!payloadData.journeyFacts, "journeyFacts should not exist for v1");

        const expectedPayload = {
            header: {
                appName: "",
                appVersion: "",
                tenantId: "RACMULE_API"
            },
            template: {
                id: "UNI_WT",
                version: "US_2.0"
            },
            customer: {
                name: {
                    firstName: "Yoy",
                    lastName: "Dop",
                    nameType: "D"
                },
                address: {
                    line1: "kkkk",
                    city: "dd",
                    stateProvinceCode: "CA",
                    postalCode: "12345",
                    countryCode: "US",
                    addrType: "PRIMARY"
                },
                mobileNumber: {
                    countryCode: "1",
                    phoneNumber: payloadData.customer.mobileNumber.phoneNumber, // Dynamically retrieved
                    phoneType: "MOBILE",
                    vvStatus: "Y"
                },
                dateOfBirth: payloadData.customer.dateOfBirth, // Dynamically retrieved
                channel: "RETAIL"
            },
            customerEnrollment: {
                enrollmentType: "C",
                transType: "WMN"
            },
            platform: {},
            agent: {
                name: {},
                accountNumber: "headerAccountNumberfromjson",
                networkId: "headerNetworkIdfromjson",
                terminalId: "headerTerminalIdfromjson",
                softwareVersion: "",
                countryISOCode: "US",
                cpcCode: "USA",
                originalCountry: "USA"
            },
            product: {
                recordingChannel: "KP"
            },
            transaction: {
                referenceId: payloadData.transaction.referenceId, // Dynamically retrieved
                attemptType: "CustomerRegistration"
            },
            preferences: {
                optInForEmail: "N",
                optInForSms: "N"
            }
        };

        // Assertion for each property in the payload
        assert.deepStrictEqual(payloadData.header, expectedPayload.header, "Header data mismatch for v1");
        assert.deepStrictEqual(payloadData.template, expectedPayload.template, "Template data mismatch for v1");
        assert.deepStrictEqual(payloadData.customer.name, expectedPayload.customer.name, "Customer name data mismatch for v1");
        assert.deepStrictEqual(payloadData.customer.address, expectedPayload.customer.address, "Customer address data mismatch for v1");
        assert.strictEqual(payloadData.customer.mobileNumber.phoneNumber, expectedPayload.customer.mobileNumber.phoneNumber, "Customer phoneNumber mismatch for v1");
        assert.strictEqual(payloadData.customer.dateOfBirth, expectedPayload.customer.dateOfBirth, "Customer dateOfBirth mismatch for v1");
        assert.deepStrictEqual(payloadData.customerEnrollment, expectedPayload.customerEnrollment, "Customer enrollment data mismatch for v1");
        assert.deepStrictEqual(payloadData.agent, expectedPayload.agent, "Agent data mismatch for v1");
        assert.deepStrictEqual(payloadData.product, expectedPayload.product, "Product data mismatch for v1");
        assert.strictEqual(payloadData.transaction.referenceId, expectedPayload.transaction.referenceId, "Transaction referenceId mismatch for v1");
        assert.deepStrictEqual(payloadData.preferences, expectedPayload.preferences, "Preferences data mismatch for v1");

        console.log("Assertion of customer register payload for the v1 completed successfully.");
        console.log("Payload Data:", JSON.stringify(payloadData, null, 2));
    }

       else if (registrationFormat === 'v2') {
        console.log("I'm inside v2");
        assert.ok(payloadData.journeyFacts, "journeyFacts is missing for v2");
        
        const expectedPayload = {
            header: {
                appName: "",
                appVersion: "",
                tenantId: "RAC-BPO",
                source: "NGKIOSK"
            },
            journeyFacts: {
                name: "NGKIOSK",
                type: "FullRegistration",
                context: "Sender"
            },
            template: {
                id: "UNI_WT",
                version: "US_2.0"
            },
            customer: {
                name: {
                    firstName: "Yoy",
                    lastName: "Dop",
                    nameType: "D"
                },
                address: {
                    line1: "kkkk",
                    city: "dd",
                    stateProvinceCode: "CA",
                    postalCode: "12345",
                    country: "US",
                    countryCode: "US",
                    addrType: "PRIMARY",
                    stateProvince: "US/CA"
                },
                mobileNumber: {
                    countryCode: "1",
                    phoneNumber: payloadData.customer.mobileNumber.phoneNumber, // Dynamically retrieved
                    phoneType: "MOBILE",
                    vvStatus: "Y"
                },
                dateOfBirth: payloadData.customer.dateOfBirth, // Dynamically retrieved
                channel: "RETAIL"
            },
            customerEnrollment: {
                enrollmentType: "C",
                transType: "WMN",
                enrollingAgentNumber: "headerAccountNumberfromjson"
            },
            platform: {},
            agent: {
                name: {},
                accountNumber: "headerAccountNumberfromjson",
                networkId: "headerNetworkIdfromjson",
                terminalId: "headerTerminalIdfromjson",
                softwareVersion: "",
                countryISOCode: "US",
                cpcCode: "USA",
                originalCountry: "USA"
            },
            product: {
                recordingChannel: "KP"
            },
            transaction: {
                referenceId: payloadData.transaction.referenceId, // Dynamically retrieved
                attemptType: "CustomerRegistration"
            }
        };

        // Assertions for each property in the payload
        assert.deepStrictEqual(payloadData.header, expectedPayload.header, "Header data mismatch for v2");
        assert.deepStrictEqual(payloadData.journeyFacts, expectedPayload.journeyFacts, "journeyFacts data mismatch for v2");
        assert.deepStrictEqual(payloadData.template, expectedPayload.template, "Template data mismatch for v2");
        assert.deepStrictEqual(payloadData.customer.name, expectedPayload.customer.name, "Customer name data mismatch for v2");
        assert.deepStrictEqual(payloadData.customer.address, expectedPayload.customer.address, "Customer address data mismatch for v2");
        assert.strictEqual(payloadData.customer.mobileNumber.phoneNumber, expectedPayload.customer.mobileNumber.phoneNumber, "Customer phoneNumber mismatch for v2");
        assert.strictEqual(payloadData.customer.dateOfBirth, expectedPayload.customer.dateOfBirth, "Customer dateOfBirth mismatch for v2");
        assert.deepStrictEqual(payloadData.customerEnrollment, expectedPayload.customerEnrollment, "Customer enrollment data mismatch for v2");
        assert.deepStrictEqual(payloadData.agent, expectedPayload.agent, "Agent data mismatch for v2");
        assert.deepStrictEqual(payloadData.product, expectedPayload.product, "Product data mismatch for v2");
        assert.strictEqual(payloadData.transaction.referenceId, expectedPayload.transaction.referenceId, "Transaction referenceId mismatch for v2");

        console.log("Assertion of customer register payload for the v2 completed successfully.");
        console.log("Payload Data:", JSON.stringify(payloadData, null, 2));
    }
       else if (registrationFormat === 'v3') {
        assert.ok(payloadData.journeyFacts, "journeyFacts is missing for v3");

        const expectedPayload = {
            header: {
                appName: "",
                appVersion: "",
                tenantId: "RAC-BPO",
                source: "NGKIOSK"
            },
            journeyFacts: {
                name: "NGKIOSK",
                type: "FullRegistration",
                context: "Sender"
            },
            template: {
                id: "UNI_WT",
                version: "US_2.0"
            },
            customer: {
                name: {
                    firstName: "Yoy",
                    lastName: "Dop",
                    nameType: "D"
                },
                address: {
                    line1: "kkkk",
                    city: "dd",
                    stateProvinceCode: "CA",
                    postalCode: "12345",
                    country: "US",
                    countryCode: "US",
                    addrType: "PRIMARY",
                    stateProvince: "US/CA"
                },
                mobileNumber: {
                    countryCode: "1",
                    phoneNumber: payloadData.customer.mobileNumber.phoneNumber, // Dynamically retrieved
                    phoneType: "MOBILE",
                    vvStatus: "Y"
                },
                dateOfBirth: payloadData.customer.dateOfBirth, // Dynamically retrieved
                channel: "RETAIL"
            },
            customerEnrollment: {
                enrollmentType: "C",
                transType: "WMN",
                enrollingAgentNumber: "headerAccountNumberfromjson"
            },
            platform: {},
            agent: {
                name: {},
                accountNumber: "headerAccountNumberfromjson",
                networkId: "headerNetworkIdfromjson",
                terminalId: "headerTerminalIdfromjson",
                softwareVersion: "",
                countryISOCode: "US",
                cpcCode: "USA",
                originalCountry: "USA"
            },
            product: {
                recordingChannel: "KP"
            },
            
        };

        // Assertions for each property in the payload
        assert.deepStrictEqual(payloadData.header, expectedPayload.header, "Header data mismatch for v3");
        assert.deepStrictEqual(payloadData.journeyFacts, expectedPayload.journeyFacts, "journeyFacts data mismatch for v3");
        assert.deepStrictEqual(payloadData.template, expectedPayload.template, "Template data mismatch for v3");
        assert.deepStrictEqual(payloadData.customer.name, expectedPayload.customer.name, "Customer name data mismatch for v3");
        assert.deepStrictEqual(payloadData.customer.address, expectedPayload.customer.address, "Customer address data mismatch for v3");
        assert.strictEqual(payloadData.customer.mobileNumber.phoneNumber, expectedPayload.customer.mobileNumber.phoneNumber, "Customer phoneNumber mismatch for v3");
        assert.strictEqual(payloadData.customer.dateOfBirth, expectedPayload.customer.dateOfBirth, "Customer dateOfBirth mismatch for v3");
        assert.deepStrictEqual(payloadData.customerEnrollment, expectedPayload.customerEnrollment, "Customer enrollment data mismatch for v3");
        assert.deepStrictEqual(payloadData.agent, expectedPayload.agent, "Agent data mismatch for v3");
        assert.deepStrictEqual(payloadData.product, expectedPayload.product, "Product data mismatch for v3");
        
        console.log("Assertion of customer register payload for the v3 completed successfully.");
        console.log("Payload Data:", JSON.stringify(payloadData, null, 2));
    }

        else if (registrationFormat === 'v4') {
            assert.ok(payloadData.journeyFacts, "journeyFacts is missing for v4");

            const expectedPayload = {
                header: {
                    appName: "",
                    appVersion: "",
                    tenantId: "RAC-BPO",
                    source: "NGKIOSK"
                },
                journeyFacts: {
                    NAME: "NGKIOSK",
                    TYPE: "FullRegistration",
                    CONTEXT: "Sender"
                },
                template: {
                    id: "UNI_WT",
                    version: "US_2.0"
                },
                customer: {
                    name: {
                        firstName: "Yoy",
                        lastName: "Dop",
                        nameType: "D"
                    },
                    address: {
                        line1: "kkkk",
                        city: "dd",
                        stateProvinceCode: "CA",
                        postalCode: "12345",
                        country: "US",
                        countryCode: "US",
                        addrType: "PRIMARY",
                        stateProvince: "US/CA"
                    },
                    mobileNumber: {
                        countryCode: "1",
                        phoneNumber: payloadData.customer.mobileNumber.phoneNumber, // Dynamically retrieved
                        phoneType: "MOBILE",
                        vvStatus: "Y"
                    },
                    dateOfBirth: payloadData.customer.dateOfBirth, // Dynamically retrieved
                    channel: "RETAIL"
                },
                customerEnrollment: {
                    enrollmentType: "C",
                    transType: "WMN",
                    enrollingAgentNumber: "headerAccountNumberfromjson"
                },
                platform: {},
                agent: {
                    name: {},
                    accountNumber: "headerAccountNumberfromjson",
                    networkId: "headerNetworkIdfromjson",
                    terminalId: "headerTerminalIdfromjson",
                    softwareVersion: "",
                    countryISOCode: "US",
                    cpcCode: "USA",
                    originalCountry: "USA"
                },
                product: {
                    recordingChannel: "KP"
                }
            };

            // Assertions for each property in the payload
            assert.deepStrictEqual(payloadData.header, expectedPayload.header, "Header data mismatch for v4");

            // Assert journeyFacts with capitalized keys
            assert.ok(payloadData.journeyFacts.NAME === expectedPayload.journeyFacts.NAME, "NAME in journeyFacts should be capitalized for v4");
            assert.ok(payloadData.journeyFacts.TYPE === expectedPayload.journeyFacts.TYPE, "TYPE in journeyFacts should be capitalized for v4");
            assert.ok(payloadData.journeyFacts.CONTEXT === expectedPayload.journeyFacts.CONTEXT, "CONTEXT in journeyFacts should be capitalized for v4");

            assert.deepStrictEqual(payloadData.template, expectedPayload.template, "Template data mismatch for v4");
            assert.deepStrictEqual(payloadData.customer.name, expectedPayload.customer.name, "Customer name data mismatch for v4");
            assert.deepStrictEqual(payloadData.customer.address, expectedPayload.customer.address, "Customer address data mismatch for v4");
            assert.strictEqual(payloadData.customer.mobileNumber.phoneNumber, expectedPayload.customer.mobileNumber.phoneNumber, "Customer phoneNumber mismatch for v4");
            assert.strictEqual(payloadData.customer.dateOfBirth, expectedPayload.customer.dateOfBirth, "Customer dateOfBirth mismatch for v4");
            assert.deepStrictEqual(payloadData.customerEnrollment, expectedPayload.customerEnrollment, "Customer enrollment data mismatch for v4");
            assert.deepStrictEqual(payloadData.agent, expectedPayload.agent, "Agent data mismatch for v4");
            assert.deepStrictEqual(payloadData.product, expectedPayload.product, "Product data mismatch for v4");

            console.log("Assertion of customer register payload for the v4 completed successfully.");
            console.log("Payload Data:", JSON.stringify(payloadData, null, 2));
        }
         
        else {
           throw new Error(`Unknown registration format: ${registrationFormat}`);
       }

       console.log(`Validated payload for ${registrationFormat} successfully.`);
   });
});