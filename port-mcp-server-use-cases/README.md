# Port.io MCP Server

A Model Context Protocol (MCP) server that provides AI applications with seamless access to Port.io software catalog data and operations.

## Features

This MCP server enables AI applications to:

- **Query Software Catalog**: Search and retrieve entities from your Port.io software catalog
- **Analyze Scorecards**: Get scorecard evaluation results and quality metrics
- **Manage Services**: Access service information, dependencies, and ownership details  
- **Execute Self-Service Actions**: Discover and understand available Port.io actions
- **Search and Filter**: Advanced search capabilities across blueprints and entities

## Use Cases

### Software Catalog Queries
- "Who owns the user-service?"
- "Show me all microservices owned by the Backend team"
- "What are the dependencies of the OrderProcessing service?"
- "How many services do we have in production?"

### Scorecard Analysis  
- "Which services are failing our security requirements scorecard?"
- "What's preventing the InventoryService from reaching Gold level?"
- "Show me services missing critical monitoring dashboards"

### Development Operations
- "What do I need to do to set up a new ReportingService?"
- "Guide me through creating a new component blueprint"
- "Help me add a rule to the Tier1Services scorecard"

## Prerequisites

1. **Port.io Account**: You need access to a Port.io organization
2. **API Credentials**: Client ID and Client Secret from Port.io
3. **Node.js**: Version 16 or higher

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the server:
   ```bash
   npm run build
   ```

## Configuration

Set the following environment variables:

```bash
export PORT_CLIENT_ID="your-port-client-id"
export PORT_CLIENT_SECRET="your-port-client-secret"
export PORT_API_URL="https://api.getport.io"  # Optional, defaults to this value
```

### Getting Port.io Credentials

1. Log into your Port.io organization
2. Go to Settings > Developers
3. Create a new API token
4. Copy the Client ID and Client Secret

## Usage

### Running the Server

```bash
npm start
```

### Using with Claude Desktop

Add this configuration to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "port": {
      "command": "node",
      "args": ["/path/to/port-mcp-server/build/index.js"],
      "env": {
        "PORT_CLIENT_ID": "your-client-id",
        "PORT_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

### Using with VS Code MCP

Create or update your VS Code MCP configuration:

```json
{
  "servers": {
    "port-mcp-server": {
      "type": "stdio", 
      "command": "node",
      "args": ["/path/to/port-mcp-server/build/index.js"]
    }
  }
}
```

## Available Tools

### `get_entities`
Get entities from the software catalog with optional filtering.

**Parameters:**
- `blueprint` (optional): Filter by blueprint identifier
- `search` (optional): Search term to filter entities
- `limit` (optional): Maximum number of entities (default: 50, max: 500)

### `get_entity`
Get a specific entity by identifier and blueprint.

**Parameters:**
- `blueprint`: Blueprint identifier
- `entity`: Entity identifier

### `get_scorecard_results`
Get scorecard evaluation results for entities.

**Parameters:**
- `blueprint`: Blueprint identifier
- `scorecard` (optional): Specific scorecard identifier
- `entity` (optional): Specific entity identifier

### `get_blueprints`
Get available blueprints in the software catalog.

**Parameters:**
- `search` (optional): Search term to filter blueprints

### `search_entities`
Search entities across all blueprints with advanced filtering.

**Parameters:**
- `query`: Search query string
- `blueprint` (optional): Filter by specific blueprint
- `properties` (optional): Filter by specific property values

### `get_actions`
Get available self-service actions.

**Parameters:**
- `blueprint` (optional): Filter actions by blueprint

## Example Interactions

### Finding Service Ownership
**Query**: "Who owns the user-authentication service?"
**MCP Call**: `get_entity` with blueprint="service" and entity="user-authentication"

### Analyzing Service Quality
**Query**: "Which services are failing the production readiness scorecard?"
**MCP Call**: `get_scorecard_results` with blueprint="service" and scorecard="production-readiness"

### Discovering Available Actions
**Query**: "What self-service actions are available for the service blueprint?"
**MCP Call**: `get_actions` with blueprint="service"

## Development

### Project Structure
```
port-mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled TypeScript output
├── package.json
├── tsconfig.json
└── README.md
```

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

## Troubleshooting

### Authentication Errors
- Verify your PORT_CLIENT_ID and PORT_CLIENT_SECRET are correct
- Check that your Port.io API credentials have the necessary permissions
- Ensure you're using the correct PORT_API_URL for your organization

### Connection Issues
- Verify Node.js version (16+ required)
- Check that the server builds successfully with `npm run build`
- Ensure the MCP client can find the built server at `build/index.js`

### Rate Limiting
The server automatically handles Port.io API rate limits and token refresh. If you encounter persistent rate limiting issues, consider reducing the frequency of requests or implementing additional caching.

## Security Considerations

- Store API credentials securely using environment variables
- Never commit credentials to version control
- Consider using Port.io's IP allowlisting if available
- Monitor API usage and access logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues related to:
- **This MCP Server**: Open an issue in this repository
- **Port.io API**: Check Port.io documentation or contact their support
- **Model Context Protocol**: Visit the [MCP documentation](https://modelcontextprotocol.io/)