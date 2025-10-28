import "dotenv/config";

async function testApi() {
    console.log("Testing Cygnis A1 API...");

    // Replace with your actual deployed URL if needed
    const api_url = "http://localhost:9002/api/ask";
    const api_key = process.env.CYGNIS_API_KEY;

    if (!api_key) {
        console.error("\n❌ API Test Failed: CYGNIS_API_KEY is not defined in your .env file.");
        return;
    }

    const headers = {
        "Authorization": `Bearer ${api_key}`,
        "Content-Type": "application/json"
    };
    const data = {
        "question": "Who discovered penicillin?"
    };

    try {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log("\n✅ API Test Passed!");
            console.log("Status:", response.status);
            console.log("Response:", JSON.stringify(responseData, null, 2));
        } else {
            console.error("\n❌ API Test Failed!");
            console.error("Status:", response.status);
            console.error("Error:", responseData);
        }
    } catch (error) {
        console.error("\n❌ API Test Failed with an exception!");
        console.error("Error making request:", error);
    }
}

testApi();
