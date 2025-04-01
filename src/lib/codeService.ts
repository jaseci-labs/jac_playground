
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
