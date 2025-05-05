
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Network, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GraphViewerProps {
  graphData: {
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
  className?: string;
  onClose?: () => void;
}

// I want to add some sample initial values to the following props
export function GraphViewer({ graphData, className, onClose }: GraphViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Optional: Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPanOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Create a simple force-directed layout
  const nodePositions = calculateNodePositions(graphData.nodes);

  return (
    <div 
      className={cn("h-full w-full flex flex-col overflow-hidden bg-card", className)}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="border-b border-border p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Graph Visualization</h3>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomOut}
                  className="h-7 w-7 p-0"
                >
                  -
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomIn}
                  className="h-7 w-7 p-0"
                >
                  +
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {onClose && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose}
                    className="h-7 w-7 p-0 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close Graph View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* Graph Visualization */}
      <div 
        className="flex-1 p-4 overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className="w-full h-full relative"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <svg width="100%" height="100%" className="text-foreground">
            {/* Draw edges first so they appear behind nodes */}
            {graphData.edges.map((edge, index) => {
              const sourceNode = nodePositions.find(n => n.id === edge.source);
              const targetNode = nodePositions.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;
              
              return (
                <g key={`edge-${index}`}>
                  <line 
                    x1={sourceNode.x} 
                    y1={sourceNode.y} 
                    x2={targetNode.x} 
                    y2={targetNode.y} 
                    className="stroke-muted-foreground" 
                    strokeWidth="1.5"
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.label && (
                    <text 
                      x={(sourceNode.x + targetNode.x) / 2} 
                      y={(sourceNode.y + targetNode.y) / 2 - 5}
                      textAnchor="middle"
                      className="text-xs fill-muted-foreground"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Draw nodes on top of edges */}
            {nodePositions.map((node) => (
              <g key={node.id}>
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r="25" 
                  className={node.type === 'agent' ? 'fill-primary/20 stroke-primary' : 'fill-secondary/20 stroke-secondary'}
                  strokeWidth="2"
                />
                <text 
                  x={node.x} 
                  y={node.y} 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="text-xs fill-current font-medium"
                >
                  {node.label}
                </text>
              </g>
            ))}
            
            {/* Define arrowhead marker */}
            <defs>
              <marker 
                id="arrowhead" 
                markerWidth="10" 
                markerHeight="7" 
                refX="35" 
                refY="3.5" 
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" className="fill-muted-foreground" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
      
      {/* Node Information */}
      <div className="border-t border-border p-2">
        <div className="text-xs text-muted-foreground">
          {graphData.nodes.length} nodes, {graphData.edges.length} edges
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate node positions in a force-directed layout
function calculateNodePositions(nodes: Array<{id: string; label: string; type: string}>) {
  const centerX = 400;
  const centerY = 300;
  const radius = Math.min(nodes.length * 15, 200);
  
  return nodes.map((node, index) => {
    const angle = (index * (2 * Math.PI)) / nodes.length;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return {
      ...node,
      x,
      y
    };
  });
}