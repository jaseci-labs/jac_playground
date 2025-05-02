import React, { useEffect, useRef, useState } from 'react';
import { Network, DataSet, Node, Edge, Options } from 'vis-network';

interface NetworkData {
  nodes: Node[];
  edges: Edge[];
}

interface GraphMessage {
  command: 'init' | 'update' | 'clear';
  data?: {
    nodes: Node[];
    edges: Edge[];
  };
}

const JacVis: React.FC = () => {
  const networkRef = useRef<HTMLDivElement>(null);
  const [showHome, setShowHome] = useState<boolean>(true);
  const [network, setNetwork] = useState<Network | null>(null);
  const [dataNodes, setDataNodes] = useState<Node[]>([]);
  const [dataEdges, setDataEdges] = useState<Edge[]>([]);
  
  const nodesEqual = (node1: Node, node2: Node): boolean => {
    return node1.id === node2.id && node1.label === node2.label;
  };
  
  const edgesEqual = (edge1: Edge, edge2: Edge): boolean => {
    return edge1.from === edge2.from && edge1.to === edge2.to;
  };
  
  const nodeExists = (node: Node): boolean => {
    return dataNodes.some(n => nodesEqual(n, node));
  };
  
  const edgeExists = (edge: Edge): boolean => {
    return dataEdges.some(e => edgesEqual(e, edge));
  };
  
  const destroyGraph = () => {
    if (network !== null) {
      network.destroy();
      setNetwork(null);
    }
  };
  
  const newGraph = (newNodes: Node[], newEdges: Edge[]) => {
    setShowHome(false);
    destroyGraph();
    
    if (networkRef.current) {
    //   const nodes = new DataSet(newNodes);
    //   const edges = new DataSet(newEdges);
    //   const data = { nodes, edges };
    //   const options: Options = {};
      
    //   const newNetwork = new Network(networkRef.current, data, options);
    //   setNetwork(newNetwork);
    //   setDataNodes(newNodes);
    //   setDataEdges(newEdges);
    }
  };
  
  const updateGraph = (newNodes: Node[], newEdges: Edge[]) => {
    setShowHome(false);
    
    if (network === null) {
      newGraph(newNodes, newEdges);
    } else {
      // Create copies of the current data arrays
      const updatedNodes = [...dataNodes];
      const updatedEdges = [...dataEdges];
    //   let nodesDataSet = new DataSet(updatedNodes);
    //   let edgesDataSet = new DataSet(updatedEdges);
      
      // Add new nodes
      for (let node of newNodes) {
        if (!nodeExists(node)) {
          updatedNodes.push(node);
        //   nodesDataSet.add(node);
        }
      }
      
      // Add new edges
      for (let edge of newEdges) {
        if (!edgeExists(edge)) {
          updatedEdges.push(edge);
        //   edgesDataSet.add(edge);
        }
      }
      
      // Update state
      setDataNodes(updatedNodes);
      setDataEdges(updatedEdges);
      
      // Update network
      if (network) {
        network.setOptions({ physics: { enabled: true } });
        network.stabilize();
      }
    }
  };
  
  useEffect(() => {
    // Event listener for messages (equivalent to window.addEventListener)
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as GraphMessage;
      
      if (message.command === 'init' && message.data) {
        newGraph(message.data.nodes, message.data.edges);
      } else if (message.command === 'update' && message.data) {
        updateGraph(message.data.nodes, message.data.edges);
      } else if (message.command === 'clear') {
        destroyGraph();
        setShowHome(true);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      destroyGraph();
    };
  }, [network, dataNodes, dataEdges]);
  
  return (
    <>
      {showHome && (
        <div className="w-screen h-screen flex justify-center items-center">
          <p className="text-4xl font-bold text-orange-500">Jaclang Graph Visualizer</p>
        </div>
      )}
      <div 
        ref={networkRef} 
        className="w-screen h-screen overflow-hidden"
        style={{ display: showHome ? 'none' : 'block' }}
      />
    </>
  );
};

export default JacVis;