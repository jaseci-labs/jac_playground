
// This is a mock service as we can't actually run Jaclang in the browser
// In a real implementation, this would connect to a backend service
export async function executeCode(code: string): Promise<string> {
  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Parse the code to generate a simulated output
  const outputLines: string[] = [];
  
  // Simple parsing to simulate execution
  const lines = code.split("\n");
  let inFunction = false;
  let indentLevel = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Handle print statements
    if (trimmedLine.startsWith("print(") && trimmedLine.endsWith(");") || 
        trimmedLine.startsWith("print(") && trimmedLine.endsWith(")")) {
      // Extract content inside print()
      const match = trimmedLine.match(/print\((.*)\)/);
      if (match && match[1]) {
        let content = match[1];
        
        // Handle string literals
        if (content.startsWith('"') && content.endsWith('"')) {
          content = content.slice(1, -1);
        } else if (content.includes(",")) {
          // Handle multiple arguments
          content = content.split(",").map(arg => arg.trim()).join(" ");
        }
        
        outputLines.push(content);
      }
    }
    
    // Simulate function execution for fibonacci
    if (trimmedLine === "for i in range(10):") {
      // Special case for the default example
      if (code.includes("fibonacci(i)")) {
        outputLines.push("Fibonacci Sequence:");
        // Calculate actual fibonacci numbers
        const fibs = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
        fibs.forEach(num => outputLines.push(num.toString()));
      }
    }
  }
  
  return outputLines.join("\n");
}

// Mock conversion service for Jac to Python
export async function convertJacToPython(jacCode: string): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  if (!jacCode.trim()) {
    throw new Error("No Jac code provided");
  }
  
  // This is a mock conversion. In a real implementation, this would call the Jaclang transpiler
  const lines = jacCode.split("\n");
  const pythonLines: string[] = [];
  
  pythonLines.push("# Auto-generated Python code from Jac");
  pythonLines.push("# This is a mock conversion - real implementation would use Jaclang transpiler");
  pythonLines.push("");
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Convert Jac-specific syntax to Python equivalents (mock examples)
    if (trimmedLine.startsWith("walker ")) {
      pythonLines.push(line.replace("walker ", "class ") + ":");
    } else if (trimmedLine.startsWith("node ")) {
      pythonLines.push(line.replace("node ", "class ") + ":");
    } else if (trimmedLine.includes(" can ")) {
      // Convert "can" methods to Python methods
      pythonLines.push(line.replace(" can ", " def ") + ":");
    } else if (trimmedLine.includes("-->")) {
      // Convert graph traversal syntax
      pythonLines.push("    # Graph traversal: " + line);
    } else {
      // Keep other lines as-is for now
      pythonLines.push(line);
    }
  }
  
  return pythonLines.join("\n");
}

// Mock conversion service for Python to Jac
export async function convertPythonToJac(pythonCode: string): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  if (!pythonCode.trim()) {
    throw new Error("No Python code provided");
  }
  
  // This is a mock conversion. In a real implementation, this would use AI or rule-based conversion
  const lines = pythonCode.split("\n");
  const jacLines: string[] = [];
  
  jacLines.push("// Auto-generated Jac code from Python");
  jacLines.push("// This is a mock conversion - real implementation would use intelligent conversion");
  jacLines.push("");
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Convert Python-specific syntax to Jac equivalents (mock examples)
    if (trimmedLine.startsWith("class ") && trimmedLine.endsWith(":")) {
      const className = trimmedLine.slice(6, -1);
      if (className.toLowerCase().includes("walker") || className.toLowerCase().includes("agent")) {
        jacLines.push(line.replace("class ", "walker ").replace(":", " {"));
      } else if (className.toLowerCase().includes("node") || className.toLowerCase().includes("state")) {
        jacLines.push(line.replace("class ", "node ").replace(":", " {"));
      } else {
        jacLines.push(line.replace("class ", "obj ").replace(":", " {"));
      }
    } else if (trimmedLine.startsWith("def ")) {
      // Convert Python methods to Jac "can" methods
      jacLines.push(line.replace("def ", "can ").replace(":", " {"));
    } else if (trimmedLine.startsWith("print(")) {
      // Keep print statements but adjust syntax if needed
      jacLines.push(line.replace("print(", "print(").replace(")", ");"));
    } else if (trimmedLine === "" || trimmedLine.startsWith("#")) {
      // Keep empty lines and comments
      jacLines.push(line);
    } else {
      // Keep other lines with minor adjustments
      let jacLine = line;
      if (trimmedLine && !trimmedLine.endsWith(";") && !trimmedLine.endsWith("{") && !trimmedLine.endsWith("}")) {
        jacLine = line + ";";
      }
      jacLines.push(jacLine);
    }
  }
  
  // Close any open braces (simple heuristic)
  const openBraces = jacLines.filter(line => line.includes("{")).length;
  const closeBraces = jacLines.filter(line => line.includes("}")).length;
  for (let i = 0; i < openBraces - closeBraces; i++) {
    jacLines.push("}");
  }
  
  return jacLines.join("\n");
}
