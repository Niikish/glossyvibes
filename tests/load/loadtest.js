const autocannon = require('autocannon');

const url = process.env.URL || 'http://localhost:4000';

async function runLoadTests() {
    console.log('Running API Load Tests...');

    // Scenario 1: Homepage / Catalog Read Heavy (100 concurrent)
    const instance1 = autocannon({
        url: `${url}/api/v1/products`,
        connections: 100, // 100 concurrent users
        duration: 10,     // for 10 seconds
        title: 'Products API Load (100 Users)'
    });

    autocannon.track(instance1, { renderProgressBar: true });

    await new Promise((resolve) => instance1.on('done', resolve));

    // Scenario 2: Stress Testing (500 concurrent)
    console.log('\n--- Switching to 500 concurrent users ---\n');
    const instance2 = autocannon({
        url: `${url}/api/v1/products`,
        connections: 500,
        duration: 10,
        title: 'Products API Load (500 Users)'
    });

    autocannon.track(instance2, { renderProgressBar: true });

    await new Promise((resolve) => instance2.on('done', resolve));

    console.log('Load tests completed successfully.');
}

runLoadTests();
