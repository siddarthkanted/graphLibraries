import * as React from 'react';
import { ReactCytoscape } from 'react-cytoscape';

interface ICytoscapeState {
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

class Cytoscape extends React.Component<{}, ICytoscapeState> {
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
        fetch("/edges.json").then(x => x.json().then((edgesData) => {
            const nodes = this.state.nodes.map(this.getNode);
            const edges = edgesData.edges.splice(0, this.state.edgesCount).filter(this.edgeFilter).map(this.getEdge);
            this.setState({ graph: { nodes, edges }, isLoading: Status.Completed });
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

    public getEdge = (edge: any) => {
        return { data: { id: "edge"+edge.id, source: edge.source, target: edge.target } }
    }

    public getNode = (node: any) => {
        return {
            data: {
                id: node.id,
                name: node.id,
                weight: node.size
            },
            position: { x: node.x, y: node.y }
        };
    }

    public loadData = () => {
        this.setState({ isLoading: Status.Loading, isRendering: false, isRandomizeNodePositions: false, isForceAtlas: false });
        fetch("/nodes.json").then(x => x.json().then((y) => this.nodesComputation(y)));
    }

    public render(): JSX.Element {
        return (
            <>
                <h1>Cytoscape</h1>
                <p>{"Number of nodes"}</p>
                <input type="text" onChange={(event) => this.setState({ nodesCount: Number(event.target.value) })} value={this.state.nodesCount} />
                <p>{"Number of edges"}</p>
                <input type="text" onChange={(event) => this.setState({ edgesCount: Number(event.target.value) })} value={this.state.edgesCount} />
                <div>
                    <button onClick={this.loadData}>{"Cytoscape Load data to react state"}</button>
                    {this.state.isLoading === Status.Completed && <button onClick={() => this.setState({ isRendering: true })}>{"Cytoscape Start rendering without random position"}</button>}
                    {this.state.isLoading === Status.Completed && <button onClick={() => this.setState({ isRandomizeNodePositions: true })}>{"Sigma Start rendering with random position"}</button>}
                    {this.state.isLoading === Status.Completed && <button onClick={() => this.setState({ isForceAtlas: true })}>{"Sigma Start rendering with Force Atlas"}</button>}
                </div>
                <p>{"Loading " + this.state.isLoading}</p>
                <div style={{ height: '840px', position: 'relative' }}>
                    {this.state.isRendering && this.startRendering()}
                    {this.state.isRandomizeNodePositions && this.RandomizeNodePositions()}
                    {this.state.isForceAtlas && this.ForceAtlas()}
                </div>
            </>
        );
    }

    private startRendering = () => {
        return (
            <ReactCytoscape containerID="cy"
                elements={this.state.graph}
                layout={{ name: 'dagre' }} />
        );
    }

    private RandomizeNodePositions = () => {
        return (
            <>

            </>
        );
    }

    private ForceAtlas = () => {
        return (
            <>
            </>
        );
    }
}

export default Cytoscape;
