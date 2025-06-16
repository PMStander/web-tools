#!/usr/bin/env python3
"""
BMAD MCP Server - Exposes BMAD agents as MCP tools for OpenCode integration
"""

import json
import sys
import os
import logging
from typing import Dict, List, Any, Optional
from pathlib import Path
import re

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BMadMCPServer:
    def __init__(self, config_path: str, project_root: str):
        self.config_path = Path(config_path)
        self.project_root = Path(project_root)
        self.agents = {}
        self.load_agents()
    
    def load_agents(self):
        """Load BMAD agent configuration"""
        try:
            with open(self.config_path, 'r') as f:
                content = f.read()
            
            logger.debug(f"Config file content length: {len(content)}")
            
            # Split content by "## Title:" to get individual agent sections
            sections = re.split(r'^## Title: ', content, flags=re.MULTILINE)
            
            # Skip first section (before first "## Title:")
            for section in sections[1:]:
                try:
                    lines = section.strip().split('\n')
                    if len(lines) < 5:  # Need at least title, name, customize, description, persona
                        continue
                    
                    title = lines[0].strip()
                    
                    # Parse the required fields
                    name = None
                    customize = None
                    description = None
                    persona = None
                    
                    i = 1
                    while i < len(lines):
                        line = lines[i].strip()
                        if line.startswith('- Name: '):
                            name = line[8:].strip()
                        elif line.startswith('- Customize: "'):
                            customize = line[14:].rstrip('"')
                        elif line.startswith('- Description: "'):
                            description = line[16:].rstrip('"')
                        elif line.startswith('- Persona: "'):
                            persona = line[12:].rstrip('"')
                        elif line.startswith('- Tasks:'):
                            break
                        i += 1
                    
                    if not all([name, customize is not None, description, persona]):
                        logger.warning(f"Skipping agent {title} - missing required fields")
                        continue
                    
                    # Parse tasks if they exist
                    tasks = []
                    i += 1  # Skip the "- Tasks:" line
                    while i < len(lines):
                        line = lines[i].strip()
                        if line.startswith('  - ['):
                            # Extract task name and file from [name](file) format
                            match = re.match(r'  - \[(.+?)\]\((.+?)\)', line)
                            if match:
                                task_name, task_file = match.groups()
                                tasks.append({"name": task_name, "file": task_file})
                        elif line and not line.startswith('  '):
                            break  # End of tasks section
                        i += 1
                    
                    agent_id = name.lower().replace(" ", "_")
                    self.agents[agent_id] = {
                        "title": title,
                        "name": name,
                        "customize": customize,
                        "description": description,
                        "persona": persona,
                        "tasks": tasks
                    }
                    logger.debug(f"Added agent: {agent_id} ({title})")
                    
                except Exception as e:
                    logger.warning(f"Failed to parse agent section: {e}")
                    continue
            
            logger.info(f"Loaded {len(self.agents)} BMAD agents")
        except Exception as e:
            logger.error(f"Failed to load agents: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
    
    def get_tools(self) -> List[Dict[str, Any]]:
        """Return available MCP tools"""
        tools = []
        
        # Add agent listing tool
        tools.append({
            "name": "list_bmad_agents",
            "description": "List all available BMAD agents and their capabilities",
            "inputSchema": {
                "type": "object",
                "properties": {},
                "required": []
            }
        })
        
        # Add agent execution tool
        tools.append({
            "name": "execute_bmad_task",
            "description": "Execute a specific task with a BMAD agent",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "agent": {
                        "type": "string",
                        "description": "Agent name (e.g., 'wendy', 'bill', 'timmy')"
                    },
                    "task": {
                        "type": "string", 
                        "description": "Task to execute"
                    },
                    "input": {
                        "type": "string",
                        "description": "Input/prompt for the task"
                    }
                },
                "required": ["agent", "task", "input"]
            }
        })
        
        # Add knowledge access tool
        tools.append({
            "name": "get_bmad_knowledge",
            "description": "Access BMAD project knowledge from .ai directory",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "knowledge_type": {
                        "type": "string",
                        "description": "Type of knowledge (project-context, tech-stack, data-models, etc.)"
                    }
                },
                "required": ["knowledge_type"]
            }
        })
        
        return tools
    
    def execute_tool(self, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool and return results"""
        try:
            if name == "list_bmad_agents":
                return self.list_agents()
            elif name == "execute_bmad_task":
                return self.execute_task(args["agent"], args["task"], args["input"])
            elif name == "get_bmad_knowledge":
                return self.get_knowledge(args["knowledge_type"])
            else:
                return {"error": f"Unknown tool: {name}"}
        except Exception as e:
            logger.error(f"Tool execution error: {e}")
            return {"error": str(e)}
    
    def list_agents(self) -> Dict[str, Any]:
        """List all available BMAD agents"""
        agent_list = []
        for agent_id, agent_info in self.agents.items():
            tasks = [task["name"] for task in agent_info["tasks"]]
            agent_list.append({
                "id": agent_id,
                "name": agent_info["name"],
                "title": agent_info["title"],
                "description": agent_info["description"],
                "customize": agent_info["customize"],
                "available_tasks": tasks
            })
        
        return {
            "agents": agent_list,
            "total_count": len(agent_list)
        }
    
    def execute_task(self, agent: str, task: str, input_text: str) -> Dict[str, Any]:
        """Execute a task with specified agent"""
        if agent not in self.agents:
            return {"error": f"Agent '{agent}' not found"}
        
        agent_info = self.agents[agent]
        
        # Find the task
        task_file = None
        for task_info in agent_info["tasks"]:
            if task_info["name"].lower() == task.lower():
                task_file = task_info["file"]
                break
        
        if not task_file:
            return {"error": f"Task '{task}' not found for agent '{agent}'"}
        
        # This would interface with your BMAD agent execution system
        # For now, return a placeholder response
        return {
            "agent": agent_info["name"],
            "task": task,
            "input": input_text,
            "status": "Task queued for execution",
            "message": f"Task '{task}' has been queued for execution by {agent_info['name']} ({agent_info['title']})",
            "next_steps": [
                "Review task requirements",
                "Execute with BMAD agent system",
                "Return results to OpenCode"
            ]
        }
    
    def get_knowledge(self, knowledge_type: str) -> Dict[str, Any]:
        """Get knowledge from .ai directory"""
        ai_dir = self.project_root / ".ai"
        knowledge_file = ai_dir / f"{knowledge_type}.md"
        
        if not knowledge_file.exists():
            # Try common variations
            possible_files = [
                ai_dir / f"{knowledge_type}.md",
                ai_dir / f"{knowledge_type.replace('-', '_')}.md",
                ai_dir / f"{knowledge_type.replace('_', '-')}.md"
            ]
            
            for file_path in possible_files:
                if file_path.exists():
                    knowledge_file = file_path
                    break
            else:
                return {"error": f"Knowledge file '{knowledge_type}.md' not found in .ai directory"}
        
        try:
            with open(knowledge_file, 'r') as f:
                content = f.read()
            
            return {
                "knowledge_type": knowledge_type,
                "file_path": str(knowledge_file),
                "content": content,
                "last_modified": knowledge_file.stat().st_mtime
            }
        except Exception as e:
            return {"error": f"Failed to read knowledge file: {e}"}

def main():
    """Main MCP server loop"""
    config_path = os.getenv('BMAD_CONFIG_PATH', '')
    project_root = os.getenv('BMAD_PROJECT_ROOT', '')
    
    if not config_path or not project_root:
        logger.error("Missing required environment variables")
        sys.exit(1)
    
    server = BMadMCPServer(config_path, project_root)
    
    # MCP protocol implementation
    for line in sys.stdin:
        try:
            request = json.loads(line.strip())
            
            if request.get("method") == "tools/list":
                response = {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": {
                        "tools": server.get_tools()
                    }
                }
            elif request.get("method") == "tools/call":
                tool_name = request["params"]["name"]
                tool_args = request["params"]["arguments"]
                result = server.execute_tool(tool_name, tool_args)
                
                response = {
                    "jsonrpc": "2.0", 
                    "id": request.get("id"),
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": json.dumps(result, indent=2)
                            }
                        ]
                    }
                }
            else:
                response = {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "error": {
                        "code": -32601,
                        "message": "Method not found"
                    }
                }
            
            print(json.dumps(response))
            sys.stdout.flush()
            
        except Exception as e:
            logger.error(f"Request handling error: {e}")
            error_response = {
                "jsonrpc": "2.0",
                "id": request.get("id") if 'request' in locals() else None,
                "error": {
                    "code": -32603,
                    "message": "Internal error"
                }
            }
            print(json.dumps(error_response))
            sys.stdout.flush()

if __name__ == "__main__":
    main()
