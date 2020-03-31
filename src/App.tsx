import * as React from 'react';
import { EdgeShapes, ForceAtlas2, NodeShapes, RandomizeNodePositions, RelativeSize, Sigma } from "react-sigma";

interface IAppState {
  options: number;
  isLoading: Status;
  nodesCount: number;
  edgesCount: number;
  isRendering: boolean;
  nodes: [];
  graph: {};
  isRandomizeNodePositions: boolean;
  isForceAtlas: boolean;
}

enum Status {
  NonStarted = "NonStarted",
  Loading = "Loading",
  Completed = "Completed"
}

class App extends React.Component<{}, IAppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      edgesCount: 250000,
      graph: {},
      isForceAtlas: false,
      isLoading: Status.NonStarted,
      isRandomizeNodePositions: false,
      isRendering: false,
      nodes: [],
      nodesCount: 50000,
      options: 0
    };
  }

  public nodesComputation = (nodes: any) => {
    this.setState({ nodes: nodes.nodes.splice(0, this.state.nodesCount) }, this.edgesComputation);
  }

  public edgesComputation = () => {
    fetch("/edges.json").then(x => x.json().then((edges) => {
      this.setState({ graph: { nodes: this.state.nodes, edges: edges.edges.filter(this.edgeFilter).splice(0, this.state.edgesCount) }, isLoading: Status.Completed });
    }));
  }

  public edgeFilter = (edge: any) => {
    if (edge.source === "" || Number(edge.source) >= Number(this.state.nodesCount)) {
      return false;
    }
    if (edge.target === "" || Number(edge.target) >= Number(this.state.nodesCount)) {
      return false;
    }
    return true;
  }

  public loadData = () => {
    this.setState({ isLoading: Status.Loading, isRendering: false, isRandomizeNodePositions: false, isForceAtlas: false });
    fetch("/nodes.json").then(x => x.json().then((y) => this.nodesComputation(y)));
  }

  public loadHighlyConnectedGraph = () => {
    this.setState({ isLoading: Status.Loading, isRendering: false, isRandomizeNodePositions: false, isForceAtlas: false });
    fetch("/artic.json").then(x => x.json().then((y) =>  this.setState({ graph: y, isLoading: Status.Completed })));
  }

  public render(): JSX.Element {
    return (
      <>
        <h1>React Sigma</h1>
        <p>{"Number of nodes"}</p>
        <input type="text" onChange={(event) => this.setState({ nodesCount: Number(event.target.value) })} value={this.state.nodesCount} />
        <p>{"Number of edges"}</p>
        <input type="text" onChange={(event) => this.setState({ edgesCount: Number(event.target.value) })} value={this.state.edgesCount} />
        <div>
          <button onClick={this.loadData}>{"Sigma Load data to react state"}</button>
          <button onClick={this.loadHighlyConnectedGraph}>{"Load highly connected graph"}</button>
          {this.state.isLoading === Status.Completed && <button onClick={() => this.setState({ isRendering: true })}>{"Sigma Start rendering without random position"}</button>}
          {this.state.isLoading === Status.Completed && <button onClick={() => this.setState({ isRandomizeNodePositions: true })}>{"Sigma Start rendering with random position"}</button>}
          {this.state.isLoading === Status.Completed && <button onClick={() => this.setState({ isForceAtlas: true })}>{"Sigma Start rendering with Force Atlas"}</button>}
        </div>
        <p>{"Loading " + this.state.isLoading}</p>
        {this.state.isLoading === Status.Completed && this.renderMetadata()}
        {this.state.isRendering && this.startRendering()}
        {this.state.isRandomizeNodePositions && this.RandomizeNodePositions()}
        {this.state.isForceAtlas && this.ForceAtlas()}
      </>
    );
  }

  private renderMetadata = () => {
    return (
      <>
        <p>{"metadata"}</p>
        <p>{"nodes length " + this.state.graph["nodes"]!.length}</p>
        <p>{"edges length " + this.state.graph["edges"]!.length}</p>
      </>
    )
  }

  private startRendering = () => {
    return (
      <>
        <Sigma
          graph={this.state.graph}
          style={{ maxWidth: "inherit", height: "900px" }}
          settings={{ drawEdges: true, clone: false, defaultNodeColor: "#FFC0CB" }}
        />
      </>
    );
  }

  private RandomizeNodePositions = () => {
    return (
      <>
        <Sigma
          graph={this.state.graph}
          style={{ maxWidth: "inherit", height: "900px" }}
          settings={{ drawEdges: true, clone: false, defaultNodeColor: "#FFC0CB" }}
        >
          <RandomizeNodePositions />
        </Sigma>
      </>
    );
  }

  private ForceAtlas = () => {
    return (
      <Sigma renderer="canvas" graph={this.state.graph}
        style={{ maxWidth: "inherit", height: "900px" }}
      >
        <EdgeShapes default="tapered" />
        <NodeShapes default="star" />
        <ForceAtlas2 worker={true} barnesHutOptimize={true} barnesHutTheta={0.6} iterationsPerRender={10} linLogMode={true} timeout={3000} />
        <RelativeSize initialSize={15} />
      </Sigma>
    );
  }
}

export default App;
