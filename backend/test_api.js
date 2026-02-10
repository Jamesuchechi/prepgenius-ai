
// Native fetch is available in Node 18+

async function testApi() {
    const endpoints = [
        'http://localhost:8000/api/content/exam-types/',
    ];

    console.log('Testing with BAD token...');

    for (const url of endpoints) {
        console.log(`Testing ${url}...`);
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer BAD_TOKEN_VALUE'
                }
            });
            console.log(`Status: ${response.status}`);

            const clone = response.clone();

            if (!response.ok) {
                console.error('Request failed!');
                const text = await clone.text();
                console.log(`Body: ${text}`); // Print full body
                try {
                    const json = JSON.parse(text);
                    console.error('JSON Error:', json);
                    if (json.detail) console.log('Found detail:', json.detail);
                } catch (e) {
                    console.error('Body is not JSON');
                }
            } else {
                const json = await response.json();
                console.log('Success! (Unexpected if token is bad but permissions allow read-only)');
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
        console.log('-------------------');
    }
}

testApi();
