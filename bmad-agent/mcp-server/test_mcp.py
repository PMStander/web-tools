#!/usr/bin/env python3
"""
Test script for BMAD MCP Server
"""

import json
import subprocess
import os

def test_mcp_server():
    """Test the BMAD MCP server"""
    
    # Set environment variables
    env = os.environ.copy()
    env['BMAD_CONFIG_PATH'] = '/Users/peetstander/Projects/langflow/bmad-agent/ide-bmad-orchestrator.cfg.md'
    env['BMAD_PROJECT_ROOT'] = '/Users/peetstander/Projects/langflow'
    
    # Start the MCP server
    proc = subprocess.Popen(
        ['python3', '/Users/peetstander/Projects/langflow/bmad-agent/mcp-server/bmad_mcp_server.py'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    
    # Test tools/list
    list_request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/list"
    }
    
    proc.stdin.write(json.dumps(list_request) + '\n')
    proc.stdin.flush()
    
    # Read response
    response_line = proc.stdout.readline()
    if response_line:
        response = json.loads(response_line)
        print("Tools List Response:")
        print(json.dumps(response, indent=2))
    
    # Test list_bmad_agents
    agents_request = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "list_bmad_agents",
            "arguments": {}
        }
    }
    
    proc.stdin.write(json.dumps(agents_request) + '\n')
    proc.stdin.flush()
    
    # Read response
    response_line = proc.stdout.readline()
    if response_line:
        response = json.loads(response_line)
        print("\nAgents List Response:")
        print(json.dumps(response, indent=2))
    
    # Clean up
    proc.terminate()
    proc.wait()

if __name__ == "__main__":
    test_mcp_server()
