
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface DebugPanelProps {
  debugState: DebugState | null;
  className?: string;
}

export interface DebugState {
  currentLine: number;
  variables: Record<string, any>;
  callStack: string[];
  graph: {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
    }>;
    edges: Array<{
      source: string;
      target: string;
      label?: string;
    }>;
  };
}

export function DebugPanel({ debugState, className }: DebugPanelProps) {
  if (!debugState) {
    return (
      <div className={cn(
        "h-full w-full flex items-center justify-center bg-card text-foreground", 
        className
      )}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Waiting for debugging to start...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full flex flex-col overflow-hidden bg-card", className)}>
      <div className="flex-1 p-4 overflow-auto">
        {/* Simple graph visualization */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Graph Visualization</h3>
          <div className="border border-border rounded-md bg-muted/20 p-4 h-48 flex items-center justify-center">
            {debugState.graph.nodes.length > 0 ? (
              <div className="w-full h-full relative">
                {/* Simple placeholder for graph visualization */}
                <svg width="100%" height="100%" viewBox="0 0 400 200" className="text-foreground">
                  {/* Nodes */}
                  {debugState.graph.nodes.map((node, index) => {
                    const x = 70 + (index * 80) % 300;
                    const y = 60 + Math.floor((index * 80) / 300) * 80;
                    
                    return (
                      <g key={node.id}>
                        <circle 
                          cx={x} 
                          cy={y} 
                          r="20" 
                          className={node.type === 'agent' ? 'fill-primary/20 stroke-primary' : 'fill-secondary/20 stroke-secondary'}
                          strokeWidth="2"
                        />
                        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-xs fill-current">
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Edges */}
                  {debugState.graph.edges.map((edge, index) => {
                    const sourceIndex = debugState.graph.nodes.findIndex(n => n.id === edge.source);
                    const targetIndex = debugState.graph.nodes.findIndex(n => n.id === edge.target);
                    
                    if (sourceIndex === -1 || targetIndex === -1) return null;
                    
                    const sourceX = 70 + (sourceIndex * 80) % 300;
                    const sourceY = 60 + Math.floor((sourceIndex * 80) / 300) * 80;
                    const targetX = 70 + (targetIndex * 80) % 300;
                    const targetY = 60 + Math.floor((targetIndex * 80) / 300) * 80;
                    
                    return (
                      <g key={`edge-${index}`}>
                        <line 
                          x1={sourceX} 
                          y1={sourceY} 
                          x2={targetX} 
                          y2={targetY} 
                          className="stroke-muted-foreground" 
                          strokeWidth="1.5"
                          markerEnd="url(#arrowhead)"
                        />
                        {edge.label && (
                          <text 
                            x={(sourceX + targetX) / 2} 
                            y={(sourceY + targetY) / 2 - 5}
                            textAnchor="middle"
                            className="text-[10px] fill-muted-foreground"
                          >
                            {edge.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  
                  <defs>
                    <marker 
                      id="arrowhead" 
                      markerWidth="10" 
                      markerHeight="7" 
                      refX="9" 
                      refY="3.5" 
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" className="fill-muted-foreground" />
                    </marker>
                  </defs>
                </svg>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No graph data available</span>
            )}
          </div>
        </div>
        
        {/* Current line */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Current Line</h3>
          <div className="bg-muted/20 border border-border rounded-md px-3 py-2">
            <span className="font-mono text-sm">Line {debugState.currentLine}</span>
          </div>
        </div>
        
        {/* Variables */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Variables</h3>
          <div className="bg-muted/20 border border-border rounded-md p-3 max-h-40 overflow-y-auto">
            {Object.keys(debugState.variables).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(debugState.variables).map(([name, value]) => (
                  <div key={name} className="flex items-start">
                    <span className="font-mono text-sm font-medium text-primary min-w-20">{name}:</span>
                    <span className="font-mono text-sm ml-2">{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No variables defined</span>
            )}
          </div>
        </div>
        
        {/* Call Stack */}
        <div>
          <h3 className="text-sm font-medium mb-2">Call Stack</h3>
          <div className="bg-muted/20 border border-border rounded-md p-3 max-h-40 overflow-y-auto">
            {debugState.callStack.length > 0 ? (
              <div className="space-y-1">
                {debugState.callStack.map((call, index) => (
                  <div key={index} className="font-mono text-sm">
                    {call}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Call stack is empty</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}