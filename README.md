# Web Tools

A collection of web-based utility tools including:
- PDF Merge: Combine multiple PDF files into one
- Image Converter: Convert images between different formats
- Format Converter: Convert between various data formats

## Setup

1. Clone the repository:
```bash
git clone https://github.com/PMStander/web-tools.git
cd web-tools
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## MCP Server Configuration

If you want to use the GitHub MCP server functionality:

1. Get a GitHub Personal Access Token (PAT) with the necessary permissions
2. Update `.vscode/mcp.json` with your PAT:
```json
{
  "mcpServers": {
    "github.com/github/github-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_PAT_HERE"
      }
    }
  }
}
```

## Built With

- [Next.js](https://nextjs.org/) - The React framework for production
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
