import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
interface DebugPanelProps {
  graph: JSON;
  className?: string;
}

declare var vis: any;

export function DebugPanel({ graph, className }: DebugPanelProps) {
  const networkElement = useRef<HTMLDivElement>(null);

  let network = null;
  let nodes = null;
  let edges = null;

  let data_nodes = [];
  let data_edges = [];

  function nodesEqual(node1: any, node2: any) {
    return node1.id === node2.id && node1.label === node2.label;
  }
  function edgesEqual(edge1: any, edge2: any) {
    return edge1.from === edge2.from && edge1.to === edge2.to;
  }
  function nodeExists(node: any) {
    for (let n of data_nodes) {
      if (nodesEqual(n, node)) return true;
    }
    return false;
  }
  function edgeExists(edge: any) {
    for (let e of data_edges) {
      if (edgesEqual(e, edge)) return true;
    }
    return false;
  }

  function hideHome() {
    let home = document.getElementById("home");
    home.style.display = "none";
  }

  function showHome() {
    // let home = document.getElementById("home");
    // home.style.display = "flex";
  }

  function destroyGraph() {
    if (network !== null) {
      network.destroy();
      network = null;
    }
  }

  function newGraph(p_data_nodes, p_data_edges) {
    hideHome();
    destroyGraph();

    nodes = new vis.DataSet(p_data_nodes);
    edges = new vis.DataSet(p_data_edges);

    let container = networkElement.current;

    let options = {};
    let data = { nodes: nodes, edges: edges };
    network = new vis.Network(container, data, options);
  }

  function updateGraph(p_data_nodes, p_data_edges) {
    hideHome();
    if (network === null) {
      newGraph(p_data_nodes, p_data_edges);
    } else {
      for (let node of p_data_nodes) {
        if (!nodeExists(node)) {
          data_nodes.push(node);
          nodes.add([node]);
        }
      }
      for (let edge of p_data_edges) {
        if (!edgeExists(edge)) {
          data_edges.push(edge);
          edges.add([edge]);
        }
      }
      network.setOptions({ physics: { enabled: true } });
      network.stablize();
    }

  }


  useEffect(() => {
    if (networkElement.current && graph != null && Array.isArray(graph['nodes']) && Array.isArray(graph['edges'])) {
      newGraph(graph['nodes'], graph['edges']);
    }
  }, [graph]);

  // window.addEventListener('message', event => {
  //   const message = event.data;
  //   if (message['command'] == 'init') {
  //     const data = message['data'];
  //     newGraph(data['nodes'], data['edges']);
  //   } else if (message['command'] == 'update') {
  //     const data = message['data'];
  //     updateGraph(data['nodes'], data['edges']);
  //   } else if (message['command'] == 'clear') {
  //     destroyGraph();
  //     showHome();
  //   }
  // });


  return (
    <div className={cn(
      "h-full w-full flex items-center justify-center bg-card text-foreground",
      className
    )}>

      <div className="flex flex-col items-center gap-2">
        <p id="home" style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "2em",
          fontWeight: "bold",
          color: "#f1982a"
        }}>Jaclang Graph Visualizer</p>

        <div ref={networkElement} id="mynetwork" className="w-full h-[80vh] border border-gray-300"></div>
      </div>
    </div>
  );
}