import { baseUrl } from "../../support/constants";

describe("REQRES Endpoint Tests", () => {

  describe("User List and Details", () => {
    it("Should return list of all users data", () => {
      cy.request(`${baseUrl}/users?page=2`).then((response) => {
        expect(response.status).to.eq(200);

        // Verify the response body has a 'data' property which is a non-empty array
        expect(response.body).to.have.property("data").that.is.an("array").that.is.not.empty;

        const users = response.body.data;
        const userIds = users.map((user) => user.id);

        // Check that the response contains the expected user IDs
        expect(userIds).to.include.members([7, 8, 9, 10, 11, 12]);
      });
    });

    it("Should return single user data", () => {
      cy.request(`${baseUrl}/users/2`).then((response) => {
        expect(response.status).to.eq(200);

        // Verify the response body has a 'data' property
        expect(response.body).to.have.property("data");

        const user = response.body.data;

        // Check the user details
        expect(user).to.have.property("id", 2);
        expect(user).to.have.property("email", "janet.weaver@reqres.in");
        expect(user).to.have.property("first_name", "Janet");
        expect(user).to.have.property("last_name", "Weaver");
      });
    });

    it("Should return user not found", () => {
      cy.request({
        url: `${baseUrl}/users/23`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.be.empty;
      });
    });
  });

  describe("Resource List and Details", () => {
    it("Should return list of resources", () => {
      cy.request(`${baseUrl}/unknown`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("data").to.be.an("array").that.is.not.empty;

        const resources = response.body.data;
        const resourceIds = resources.map((resource) => resource.id);

        // Check that the response contains the expected resource IDs
        expect(resourceIds).to.include.members([1, 2, 3, 4, 5, 6]);
      });
    });

    it("Should return single resource", () => {
      cy.request(`${baseUrl}/unknown/2`).then((response) => {
        expect(response.status).to.eq(200);

        expect(response.body).to.have.property("data");

        const resource = response.body.data;

        // Check the resource details
        expect(resource).to.have.property("id", 2);
        expect(resource).to.have.property("name", "fuchsia rose");
        expect(resource).to.have.property("year", 2001);
        expect(resource).to.have.property("color", "#C74375");
        expect(resource).to.have.property("pantone_value", "17-2031");
      });
    });

    it("Should return resource not found", () => {
      cy.request({
        url: `${baseUrl}/unknown/23`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.be.empty;
      });
    });
  });

  describe("User Creation and Updates", () => {
    it("Should create a new user", () => {
      const userData = {
        name: "morpheus",
        job: "leader",
      };

      cy.request("POST", `${baseUrl}/users`, userData).then((response) => {
        expect(response.status).to.within(200, 202);

        // Verify the response body contains the correct data
        expect(response.body).to.have.property("name", "morpheus");
        expect(response.body).to.have.property("job", "leader");

        // Verify that the 'id' property exists in the response body
        expect(response.body).to.have.property("id").that.is.not.empty;
      });
    });

    it("Should update a user details", () => {
      const updatedUserData = {
        name: "morpheus",
        job: "zion resident",
      };

      cy.request("PUT", `${baseUrl}/users/2`, updatedUserData).then((response) => {
        expect(response.status).to.eq(200);

        // Verify the response body contains the correct data
        expect(response.body).to.have.property("name", "morpheus");
        expect(response.body).to.have.property("job", "zion resident");
      });
    });

    it("Should update a user details using PATCH", () => {
      const updatedUserData = {
        name: "morpheus",
        job: "zion resident",
      };

      cy.request("PATCH", `${baseUrl}/users/2`, updatedUserData).then((response) => {
        expect(response.status).to.eq(200);

        // Verify the response body contains the correct data
        expect(response.body).to.have.property("name", "morpheus");
        expect(response.body).to.have.property("job", "zion resident");
        expect(response.body).to.have.property("updatedAt").that.is.a("string");
      });
    });

    it("Should delete a user", () => {
      cy.request("DELETE", `${baseUrl}/users/2`).then((response) => {
        expect(response.status).to.eq(204);
        expect(response.body).to.be.empty;
      });
    });
  });

  describe("User Registration", () => {
    it("Should register a user successfully", () => {
      const registrationData = {
        email: "eve.holt@reqres.in",
        password: "pistol",
      };

      cy.request("POST", `${baseUrl}/register`, registrationData).then((response) => {
        expect(response.status).to.eq(200);

        // Verify the response body contains the id and token
        expect(response.body).to.have.property("id").that.is.a("number");
        expect(response.body).to.have.property("token").that.is.a("string");
      });
    });

    it("Should fail to register a user with incomplete details", () => {
      const registrationData = {
        email: "sydney@fife",
      };

      cy.request({
        method: "POST",
        url: `${baseUrl}/register`,
        body: registrationData,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);

        // Verify the response body contains the correct error message
        expect(response.body).to.have.property("error", "Missing password");
      });
    });
  });

  describe("User Login", () => {
    it("Should log in a user successfully", () => {
      const loginData = {
        email: "eve.holt@reqres.in",
        password: "cityslicka",
      };

      cy.request("POST", `${baseUrl}/login`, loginData).then((response) => {
        expect(response.status).to.eq(200);

        // Verify the response body contains the token
        expect(response.body).to.have.property("token").that.is.a("string");
      });
    });

    it("Should fail to log in a user with incomplete details", () => {
      const loginData = {
        email: "peter@klaven",
      };

      cy.request({
        method: "POST",
        url: `${baseUrl}/login`,
        body: loginData,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);

        // Verify the response body contains the correct error message
        expect(response.body).to.have.property("error", "Missing password");
      });
    });
  });

  describe("Delayed Response", () => {
    it("Should return a list of users after a delay", () => {
      const startTime = performance.now();
    
      cy.request(`${baseUrl}/users?delay=3`).then((response) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
    
        // Verify that the response status is 200
        expect(response.status).to.eq(200);
    
        // Verify that the response time is greater than or equal to 3 Sec
        expect(responseTime).to.be.at.least(3000);
    
        // Verify the response body contains the data array with expected users
        expect(response.body).to.have.property("data");
        expect(response.body.data).to.be.an("array").that.is.not.empty;
    
        const users = response.body.data;
        const userIds = users.map((user) => user.id);
        const expectedUserIds = [1, 2, 3, 4, 5, 6];
    
        // Check that the response contains the expected user IDs
        expect(userIds).to.include.members(expectedUserIds);
      });
    }); 
    });
  });
