## Port.io MCP Server - Custom Instructions

This workspace contains a comprehensive MCP (Model Context Protocol) server for Port.io integration.

## Project Completion Status

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements - MCP server for Port.io with TypeScript, Node.js
- [x] Scaffold the Project - Complete project structure created
- [x] Customize the Project - Comprehensive Port.io MCP server with 6 main tools implemented
- [x] Install Required Extensions - TypeScript support verified
- [x] Compile the Project - All dependencies installed, TypeScript compilation successful
- [x] Create and Run Task - VS Code tasks configured for build automation
- [x] Launch the Project - Server ready for launch with MCP clients
- [x] Ensure Documentation is Complete - README.md and all documentation completed

## Project Overview

This is a fully functional MCP server that provides Port.io integration with the following capabilities:

### Implemented Tools
1. `get_entities` - Retrieve entities from Port.io with filtering and pagination
2. `get_entity` - Get specific entity details by identifier and blueprint
3. `get_scorecard_results` - Fetch scorecard evaluation results for entities
4. `get_blueprints` - List available blueprints in Port.io
5. `search_entities` - Search entities across blueprints with flexible criteria
6. `get_actions` - Retrieve available actions for entities or blueprints

### Technical Stack
- **Runtime**: Node.js 16+
- **Language**: TypeScript with strict type checking
- **MCP SDK**: @modelcontextprotocol/sdk v1.1.0
- **HTTP Client**: Axios with authentication handling
- **Validation**: Zod for schema validation
- **Build System**: TypeScript compiler with VS Code tasks

### Usage Instructions
Refer to the README.md file for complete setup and usage instructions.