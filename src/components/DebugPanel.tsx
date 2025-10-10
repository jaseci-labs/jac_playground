import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Activity, GitBranch } from "lucide-react";

interface DebugPanelProps {
  graph: JSON;
  className?: string;
  debugStatus?: boolean;
}

declare var vis: any;

export function DebugPanel({ graph, debugStatus, className }: DebugPanelProps) {
  const networkElement = useRef<HTMLDivElement>(null);
  const [isGraphVisible, setGraphVisible] = useState(false);

  const networkRef = useRef<any>(null);
  const nodesRef = useRef<any>(null);
  const edgesRef = useRef<any>(null);
  const dataNodesRef = useRef<any[]>([]);
  const dataEdgesRef = useRef<any[]>([]);

  function nodesEqual(node1: any, node2: any) {
    return node1.id === node2.id && node1.label === node2.label;
  }

  function edgesEqual(edge1: any, edge2: any) {
    return edge1.from === edge2.from && edge1.to === edge2.to;
  }

  function nodeExists(node: any) {
    return dataNodesRef.current.some(n => nodesEqual(n, node));
  }

  function edgeExists(edge: any) {
    return dataEdgesRef.current.some(e => edgesEqual(e, edge));
  }

  function showGraph() {
    setGraphVisible(true);
  }

  function destroyGraph() {
    if (networkRef.current !== null) {
      networkRef.current.destroy();
      networkRef.current = null;
    }

    if (nodesRef.current) {
      nodesRef.current.clear();
      nodesRef.current = null;
    }

    if (edgesRef.current) {
      edgesRef.current.clear();
      edgesRef.current = null;
    }

    dataNodesRef.current = [];
    dataEdgesRef.current = [];

  }


  function updateGraph(newNodes: any[], newEdges: any[]) {
    newNodes = Array.isArray(newNodes) ? newNodes : [];
    newEdges = Array.isArray(newEdges) ? newEdges : [];
    showGraph();

    if (networkRef.current === null || nodesRef.current === null || edgesRef.current === null) {
      newGraph(newNodes, newEdges);
    }
    else {
      for (let node of newNodes) {
        if (!nodeExists(node)) {
          dataNodesRef.current.push(node);
          nodesRef.current.add(node);
        }
      }

      for (let edge of newEdges) {
        if (!edgeExists(edge)) {
          dataEdgesRef.current.push(edge);
          edgesRef.current.add(edge);
        }
      }

      if (networkRef.current) {
        networkRef.current.setOptions({
          physics: {
            enabled: true,
            stabilization: {
              enabled: false
            },
            barnesHut: {
              gravitationalConstant: -2000,
              centralGravity: 0.3,
              springLength: 95,
              springConstant: 0.04,
              damping: 0.09
            }
          }
        });
      }

      setTimeout(() => {
        if (networkRef.current) {
          networkRef.current.setOptions({
            physics: {
              stabilization: {
                enabled: true,
                iterations: 100,
                updateInterval: 25,
                onlyDynamicEdges: false,
                fit: true
              }
            }
          });
        }
      }, 2000);
    }
  }

  function newGraph(newNodes: any[], newEdges: any[]) {
    console.log("newGraph called with:", { nodes: newNodes, edges: newEdges });
    
    // Ensure newNodes and newEdges are arrays
    newNodes = Array.isArray(newNodes) ? newNodes : [];
    newEdges = Array.isArray(newEdges) ? newEdges : [];
    
    showGraph();
    destroyGraph();

    dataNodesRef.current = [...newNodes];
    dataEdgesRef.current = [...newEdges];

    const container = networkElement.current;
    console.log("vis library available:", typeof vis !== 'undefined');

    if (!container) {
      console.error("Network container not available");
      return;
    }

    if (typeof vis === 'undefined') {
      console.error("vis library not loaded");
      return;
    }

    nodesRef.current = new vis.DataSet(newNodes);
    edgesRef.current = new vis.DataSet(newEdges);

    const data = { nodes: nodesRef.current, edges: edgesRef.current };
    const options = {
      physics: {
        enabled: true,
        stabilization: {
          iterations: 200,
          updateInterval: 25,
        },
      },
    };

    setTimeout(() => {
      try {
        networkRef.current = new vis.Network(container, data, options);
        console.log("vis.Network created successfully");
        if (networkRef.current) {
          networkRef.current.stabilize();
        }
      } catch (error) {
        console.error("Error creating vis.Network:", error);
      }
    }, 100);
  }

  useEffect(() => {
    if (graph && networkElement.current) {
      const nodes = graph["nodes"] || [];
      const edges = graph["edges"] || [];
      
      console.log("DebugPanel: Graph data received", { 
        nodesCount: nodes.length, 
        edgesCount: edges.length,
        nodes: nodes,
        edges: edges 
      });
      
      if (nodes.length > 0) {
        updateGraph(nodes, edges);
      }
    }
  }, [graph]);


  useEffect(() => {
    if (debugStatus) {
      destroyGraph();
    } else if (graph && networkElement.current) {
      newGraph(graph["nodes"], graph["edges"]);
    }
  }, [debugStatus]);


  return (
    <div
      className={cn(
        "h-full w-full flex flex-col bg-card text-foreground",
        className
      )}
    >
      {/* Debug Panel Header */}
      <div className="h-12 border-b bg-muted/30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Graph Visualizer</h3>
          {debugStatus && (
            <div className="flex items-center gap-1 ml-2">
              <Activity className="h-3 w-3 text-green-500 animate-pulse" />
              <span className="text-xs text-green-500">Running</span>
            </div>
          )}
        </div>
        {/* <div className="flex items-center gap-2">
          {graph && (
            <div className="text-xs text-muted-foreground">
              Nodes: {Array.isArray(graph["nodes"]) ? graph["nodes"].length : 0} | 
              Edges: {Array.isArray(graph["edges"]) ? graph["edges"].length : 0}
            </div>
          )}
        </div> */}
      </div>

      {/* Graph Content */}
      <div className="flex-1 relative overflow-hidden">
        {(!graph || !Array.isArray(graph["nodes"]) || graph["nodes"].length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center bg-muted/20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <GitBranch className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Jac Graph Visualizer
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Execute your Jac code to see the graph visualization. 
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full w-full bg-background">
            <div
              ref={networkElement}
              id="mynetwork"
              className="w-full h-full border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
