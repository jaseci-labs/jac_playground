import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

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

  function hideHome() {
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
    hideHome();

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

      setTimeout(() => {
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
      }, 2000);
    }
  }

  function newGraph(newNodes: any[], newEdges: any[]) {
    hideHome();
    destroyGraph();

    dataNodesRef.current = [...newNodes];
    dataEdgesRef.current = [...newEdges];

    nodesRef.current = new vis.DataSet(newNodes);
    edgesRef.current = new vis.DataSet(newEdges);

    const container = networkElement.current;
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
      if (container) {
        networkRef.current = new vis.Network(container, data, options);
        networkRef.current.stabilize();
      }
    }, 50);
  }

  useEffect(() => {
    if (graph && networkElement.current) {
      updateGraph(graph["nodes"], graph["edges"]);
    }
  }, [graph]);


  useEffect(() => {
    if (debugStatus) {
      destroyGraph();
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    } else if (graph && networkElement.current) {
      newGraph(graph["nodes"], graph["edges"]);
    }
  }, [debugStatus]);


  return (
    <div
      className={cn(
        "h-full w-full flex flex-col items-center justify-center bg-card text-foreground p-4",
        className
      )}
    >
      {!isGraphVisible && (
        <p className="flex justify-center items-center text-[2em] font-bold text-[#f1982a]">
          Jaclang Graph Visualizer
        </p>
      )}
      <div
        ref={networkElement}
        id="mynetwork"
        className={cn(
          "w-full h-[80vh]",
          isGraphVisible ? "block" : "hidden"
        )}
      ></div>
    </div>
  );
}
