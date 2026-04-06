const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "FinTrack API",
    version: "1.0.0",
    description: "Finance Data Processing and Access Control Backend API",
  },
  servers: [
    {
      url: "https://fintrack-api-1-i2fi.onrender.com",
      description: "Local server",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      // ENUMS
      Role: {
        type: "string",
        enum: ["VIEWER", "ANALYST", "ADMIN"],
      },
      Status: {
        type: "string",
        enum: ["ACTIVE", "INACTIVE"],
      },
      RecordType: {
        type: "string",
        enum: ["INCOME", "EXPENSE"],
      },

      // AUTH
      UserRegister: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      UserLogin: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },

      // RECORD
      RecordCreate: {
        type: "object",
        required: ["amount", "type", "category", "date"],
        properties: {
          amount: { type: "number" },
          type: { $ref: "#/components/schemas/RecordType" },
          category: { type: "string" },
          date: { type: "string", format: "date-time" },
          note: { type: "string" },
        },
      },
      //   record update
      RecordUpdate: {
        type: "object",
        properties: {
          amount: { type: "number" },
          type: { $ref: "#/components/schemas/RecordType" },
          category: { type: "string" },
          date: { type: "string", format: "date-time" },
          note: { type: "string" },
        },
      },
      // USER UPDATE
      UserRoleUpdate: {
        type: "object",
        required: ["role"],
        properties: {
          role: { $ref: "#/components/schemas/Role" },
        },
      },
      UserStatusUpdate: {
        type: "object",
        required: ["status"],
        properties: {
          status: { $ref: "#/components/schemas/Status" },
        },
      },

      // Filtered RESPONSE
      PaginatedRecords: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { type: "object" },
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "number" },
              page: { type: "number" },
              limit: { type: "number" },
              totalPages: { type: "number" },
            },
          },
        },
      },

      ApiError: {
        type: "object",
        properties: {
          message: { type: "string" },
          success: { type: "boolean" },
        },
      },
    },
  },

  security: [{ bearerAuth: [] }],

  paths: {
    // AUTH
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRegister" },
            },
          },
        },
        responses: {
          201: { description: "User created" },
          400: { description: "Validation error" },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserLogin" },
            },
          },
        },
        responses: {
          200: { description: "JWT token returned" },
          400: { description: "Invalid credentials" },
        },
      },
    },

    // RECORDS
    "/api/records": {
      get: {
        tags: ["Records"],
        summary: "Get records with filters",
        parameters: [
          {
            name: "type",
            in: "query",
            schema: { $ref: "#/components/schemas/RecordType" },
          },
          { name: "category", in: "query", schema: { type: "string" } },
          {
            name: "from",
            in: "query",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "to",
            in: "query",
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          200: {
            description: "Filtered records",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedRecords" },
              },
            },
          },
        },
      },

      post: {
        tags: ["Records"],
        summary: "Create record",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RecordCreate" },
            },
          },
        },
        responses: {
          201: { description: "Record created" },
        },
      },
    },

    "/api/records/{id}": {
      patch: {
        tags: ["Records"],
        summary: "Update record",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "c096ff5f-6328-4c75-9685-e8b9b32f2890",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RecordUpdate",
              },
            },
          },
        },
        responses: {
          200: { description: "Record updated successfully" },
          400: { description: "Validation error" },
          403: { description: "Forbidden" },
        },
      },
      delete: {
        tags: ["Records"],
        summary: "Soft delete record",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Deleted" },
        },
      },
    },

    // USERS
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users (Admin only)",
        responses: {
          200: { description: "Users list" },
        },
      },
    },

    "/api/users/{id}/role": {
      patch: {
        tags: ["Users"],
        summary: "Update user role",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRoleUpdate" },
            },
          },
        },
        responses: {
          200: { description: "Role updated" },
        },
      },
    },

    "/api/users/{id}/status": {
      patch: {
        tags: ["Users"],
        summary: "Update user status",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserStatusUpdate" },
            },
          },
        },
        responses: {
          200: { description: "Status updated" },
        },
      },
    },

    // DASHBOARD
    "/api/dashboard/overview": {
      get: {
        tags: ["Dashboard"],
        summary: "Global financial overview can be accessed by all users",
        parameters: [
          {
            name: "trendType",
            in: "query",
            schema: { type: "string", enum: ["monthly", "weekly"] },
          },
        ],
        responses: {
          200: { description: "Overview data with trends" },
        },
      },
    },

    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "User-specific dashboard summary",
        responses: {
          200: { description: "User summary data" },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
