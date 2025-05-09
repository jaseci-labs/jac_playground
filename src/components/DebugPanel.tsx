import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
interface DebugPanelProps {
  graph: JSON;
  className?: string;
}

declare var vis: any;

export function DebugPanel({ graph, className }: DebugPanelProps) {
  const networkElement = useRef<HTMLDivElement>(null);
  const [isGraphVisible, setGraphVisible] = useState(false);

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
    setGraphVisible(true);
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

    setTimeout(() => {
      network = new vis.Network(container, data, options);
      network.stabilize();
    }, 50);
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
    <div
      className={cn(
        "h-full w-full flex flex-col items-center justify-center bg-card text-foreground p-4",
        className
      )}
    >
      {!isGraphVisible && (
        <p
          id="home"
          className="flex justify-center items-center text-[2em] font-bold text-[#f1982a]"
        >
          Jaclang Graph Visualizer
        </p>
      )}

      <div
        ref={networkElement}
        id="mynetwork"
        className={cn(
          "w-full h-[80vh] border border-gray-300",
          isGraphVisible ? "block" : "hidden"
        )}
      ></div>
    </div>
  );
}