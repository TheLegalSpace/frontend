import { api } from "./services/api";

async function testEndpoint() {
  try {
    console.log("Testing API endpoint...\n");

    const response = await api.post("/api/v1/auth/login", {
      authProvider: "email",
      email: "adaeze@example.com",
      password: "securePass123",
    });

    console.log("===== SUCCESS =====");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
  } catch (error: any) {
    console.log("===== ERROR =====");

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

testEndpoint();
