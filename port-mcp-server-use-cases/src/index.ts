#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

// Port.io API configuration
const PORT_API_BASE = process.env.PORT_API_URL || "https://api.getport.io";
const PORT_CLIENT_ID = process.env.PORT_CLIENT_ID;
const PORT_CLIENT_SECRET = process.env.PORT_CLIENT_SECRET;

// Create server instance
const server = new McpServer({
  name: "port-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Port.io API helper functions
class PortAPI {
  private accessToken: string | null = null;
  private tokenExpiryTime: number = 0;

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiryTime) {
      return this.accessToken;
    }

    if (!PORT_CLIENT_ID || !PORT_CLIENT_SECRET) {
      throw new Error("PORT_CLIENT_ID and PORT_CLIENT_SECRET environment variables are required");
    }

    try {
      const response = await axios.post(`${PORT_API_BASE}/v1/auth/access_token`, {
        clientId: PORT_CLIENT_ID,
        clientSecret: PORT_CLIENT_SECRET,
      });

      this.accessToken = response.data.accessToken;
      // Set expiry time to 50 minutes from now (tokens typically expire in 1 hour)
      this.tokenExpiryTime = Date.now() + (50 * 60 * 1000);
      
      return this.accessToken!;
    } catch (error) {
      console.error("Failed to get access token:", error);
      throw new Error("Failed to authenticate with Port.io API");
    }
  }

  async makeRequest(method: string, endpoint: string, data?: any) {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios({
        method,
        url: `${PORT_API_BASE}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });

      return response.data;
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }
}

const portAPI = new PortAPI();

// Tool: Get Software Catalog Entities
server.tool(
  "get_entities",
  "Get entities from Port.io software catalog with optional filtering",
  {
    blueprint: z.string().optional().describe("Blueprint identifier to filter by"),
    search: z.string().optional().describe("Search term to filter entities"),
    limit: z.number().optional().default(50).describe("Maximum number of entities to return (max 500)"),
  },
  async ({ blueprint, search, limit }) => {
    try {
      let endpoint = "/v1/blueprints";
      const params = new URLSearchParams();
      
      if (limit) params.append("limit", Math.min(limit, 500).toString());
      if (search) params.append("search", search);
      
      if (blueprint) {
        endpoint = `/v1/blueprints/${blueprint}/entities`;
      } else {
        endpoint = "/v1/entities";
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const data = await portAPI.makeRequest("GET", endpoint);
      
      const entities = data.entities || data;
      const formattedEntities = Array.isArray(entities) ? entities.map((entity: any) => ({
        identifier: entity.identifier,
        title: entity.title,
        blueprint: entity.blueprint,
        properties: entity.properties,
        relations: entity.relations,
      })) : [];

      return {
        content: [{
          type: "text",
          text: `Found ${formattedEntities.length} entities:\n\n${formattedEntities.map(entity => 
            `• ${entity.title || entity.identifier} (${entity.blueprint})\n  Properties: ${JSON.stringify(entity.properties, null, 2)}`
          ).join('\n\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching entities: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Tool: Get Entity by Identifier
server.tool(
  "get_entity",
  "Get a specific entity by its identifier and blueprint",
  {
    blueprint: z.string().describe("Blueprint identifier"),
    entity: z.string().describe("Entity identifier"),
  },
  async ({ blueprint, entity }) => {
    try {
      const data = await portAPI.makeRequest("GET", `/v1/blueprints/${blueprint}/entities/${entity}`);
      
      return {
        content: [{
          type: "text",
          text: `Entity Details:\n\nIdentifier: ${data.entity.identifier}\nTitle: ${data.entity.title}\nBlueprint: ${data.entity.blueprint}\n\nProperties:\n${JSON.stringify(data.entity.properties, null, 2)}\n\nRelations:\n${JSON.stringify(data.entity.relations, null, 2)}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching entity: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Tool: Get Scorecard Results
server.tool(
  "get_scorecard_results",
  "Get scorecard evaluation results for entities",
  {
    blueprint: z.string().describe("Blueprint identifier"),
    scorecard: z.string().optional().describe("Specific scorecard identifier"),
    entity: z.string().optional().describe("Specific entity identifier"),
  },
  async ({ blueprint, scorecard, entity }) => {
    try {
      let endpoint = `/v1/blueprints/${blueprint}/scorecards`;
      
      if (scorecard) {
        endpoint += `/${scorecard}`;
        if (entity) {
          endpoint += `/entities/${entity}`;
        }
      }

      const data = await portAPI.makeRequest("GET", endpoint);
      
      return {
        content: [{
          type: "text",
          text: `Scorecard Results:\n\n${JSON.stringify(data, null, 2)}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching scorecard results: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Tool: Get Blueprints
server.tool(
  "get_blueprints",
  "Get available blueprints in the software catalog",
  {
    search: z.string().optional().describe("Search term to filter blueprints"),
  },
  async ({ search }) => {
    try {
      let endpoint = "/v1/blueprints";
      if (search) {
        endpoint += `?search=${encodeURIComponent(search)}`;
      }

      const data = await portAPI.makeRequest("GET", endpoint);
      
      const blueprints = data.blueprints || [];
      const formattedBlueprints = blueprints.map((bp: any) => ({
        identifier: bp.identifier,
        title: bp.title,
        description: bp.description,
        schema: bp.schema,
      }));

      return {
        content: [{
          type: "text",
          text: `Available Blueprints (${formattedBlueprints.length}):\n\n${formattedBlueprints.map((bp: any) => 
            `• ${bp.title || bp.identifier}\n  Description: ${bp.description || 'No description'}\n  Properties: ${Object.keys(bp.schema?.properties || {}).join(', ')}`
          ).join('\n\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching blueprints: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Tool: Search Entities
server.tool(
  "search_entities",
  "Search entities across all blueprints with advanced filtering",
  {
    query: z.string().describe("Search query"),
    blueprint: z.string().optional().describe("Filter by specific blueprint"),
    properties: z.record(z.any()).optional().describe("Filter by specific property values"),
  },
  async ({ query, blueprint, properties }) => {
    try {
      const params = new URLSearchParams();
      params.append("search", query);
      
      if (blueprint) {
        params.append("blueprint", blueprint);
      }
      
      let endpoint = `/v1/entities?${params.toString()}`;

      const data = await portAPI.makeRequest("GET", endpoint);
      
      let entities = data.entities || [];
      
      // Additional filtering by properties if specified
      if (properties) {
        entities = entities.filter((entity: any) => {
          return Object.entries(properties).every(([key, value]) => {
            return entity.properties[key] === value;
          });
        });
      }

      const formattedResults = entities.map((entity: any) => ({
        identifier: entity.identifier,
        title: entity.title,
        blueprint: entity.blueprint,
        properties: entity.properties,
      }));

      return {
        content: [{
          type: "text",
          text: `Search Results for "${query}" (${formattedResults.length} found):\n\n${formattedResults.map((entity: any) => 
            `• ${entity.title || entity.identifier} (${entity.blueprint})\n  ${JSON.stringify(entity.properties, null, 2)}`
          ).join('\n\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error searching entities: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Tool: Get Actions
server.tool(
  "get_actions", 
  "Get available self-service actions in Port.io",
  {
    blueprint: z.string().optional().describe("Filter actions by blueprint"),
  },
  async ({ blueprint }) => {
    try {
      let endpoint = "/v1/actions";
      if (blueprint) {
        endpoint = `/v1/blueprints/${blueprint}/actions`;
      }

      const data = await portAPI.makeRequest("GET", endpoint);
      
      const actions = data.actions || data;
      const formattedActions = Array.isArray(actions) ? actions.map((action: any) => ({
        identifier: action.identifier,
        title: action.title,
        description: action.description,
        blueprint: action.blueprint,
        trigger: action.trigger,
      })) : [];

      return {
        content: [{
          type: "text",
          text: `Available Actions (${formattedActions.length}):\n\n${formattedActions.map(action => 
            `• ${action.title || action.identifier}\n  Blueprint: ${action.blueprint}\n  Description: ${action.description || 'No description'}\n  Trigger: ${action.trigger}`
          ).join('\n\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching actions: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Main server startup
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Port.io MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});