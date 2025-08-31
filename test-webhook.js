// Test script to debug the webhook locally
// Run this with: node test-webhook.js

const fetch = require("node-fetch");

async function testWebhook() {
  try {
    console.log("Testing webhook endpoint...");

    // Test the GET endpoint first
    const getResponse = await fetch(
      "http://localhost:3000/api/webhooks/clerk",
      {
        method: "GET",
      },
    );

    console.log("GET response status:", getResponse.status);
    console.log("GET response text:", await getResponse.text());

    // Test the sync-profile-pic endpoint directly
    console.log("\nTesting sync-profile-pic endpoint...");

    const syncResponse = await fetch(
      "http://localhost:3000/api/sync-profile-pic",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "test-user-123",
          profileImageUrl: "https://example.com/test-image.jpg",
        }),
      },
    );

    console.log("Sync response status:", syncResponse.status);
    console.log("Sync response text:", await syncResponse.text());
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testWebhook();
