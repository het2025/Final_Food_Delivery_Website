import axios from 'axios';
import fs from 'fs';

const API_URL = 'http://localhost:5001/api/auth/register';
const PROFILE_URL = 'http://localhost:5001/api/profile/restaurant';

const generateRandomString = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const log = (message) => {
    console.log(message);
    fs.appendFileSync('test_result.txt', message + '\n');
};

const runTest = async () => {
    // Clear previous log
    fs.writeFileSync('test_result.txt', '');

    const randomSuffix = generateRandomString(6);
    const testData = {
        name: `Test Owner ${randomSuffix}`,
        email: `testowner${randomSuffix}@example.com`,
        password: 'password123',
        phone: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
        restaurant: {
            name: `Test Restaurant ${randomSuffix}`,
            description: 'A test restaurant for debugging',
            cuisine: ['Italian', 'Mexican'],
            location: {
                area: 'Test Area',
                address: '123 Test St',
                city: 'Vadodara',
                state: 'Gujarat',
                pincode: '390001'
            },
            contact: {
                phone: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
                email: `restaurant${randomSuffix}@example.com`
            }
        }
    };

    log('🚀 Starting Registration Test...');
    log('Payload: ' + JSON.stringify(testData, null, 2));

    try {
        const response = await axios.post(API_URL, testData);
        log('✅ Registration Successful!');
        log('Response Data: ' + JSON.stringify(response.data, null, 2));

        const token = response.data.token;
        if (token) {
            log('🔑 Token received. Testing Profile Retrieval...');
            try {
                const profileResponse = await axios.get(PROFILE_URL, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                log('✅ Profile Retrieval Successful!');
                log('Profile Data: ' + JSON.stringify(profileResponse.data, null, 2));
            } catch (profileError) {
                log('❌ Profile Retrieval Failed!');
                if (profileError.response) {
                    log('Status: ' + profileError.response.status);
                    log('Data: ' + JSON.stringify(profileError.response.data, null, 2));
                } else {
                    log('Error: ' + profileError.message);
                }
            }
        } else {
            log('❌ No token received, skipping profile test.');
        }

        if (token) {
            log('Testing Menu Categories Retrieval...');
            try {
                const catResponse = await axios.get('http://localhost:5001/api/menu/categories', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                log('✅ Categories Retrieval Successful!');
                log('Categories Data: ' + JSON.stringify(catResponse.data, null, 2));
            } catch (catError) {
                log('❌ Categories Retrieval Failed!');
                if (catError.response) {
                    log('Status: ' + catError.response.status);
                    log('Data: ' + JSON.stringify(catError.response.data, null, 2));
                } else {
                    log('Error: ' + catError.message);
                }
            }
        }

    } catch (error) {
        log('❌ Registration Failed!');
        if (error.response) {
            log('Status: ' + error.response.status);
            log('Data: ' + JSON.stringify(error.response.data, null, 2));
        } else {
            log('Error: ' + error.message);
        }
    }
};

runTest();
