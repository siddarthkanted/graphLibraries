import * as React from 'react';
import {LineSeriesCanvas, MarkSeriesCanvas, XYPlot} from 'react-vis';

interface IReactVisState {
    options: number;
    isLoading: Status;
    nodesCount: number;
    edgesCount: number;
    isRendering: boolean;
    nodes: [];
    graph: {};
    isPosition: boolean;
    isForceAtlas: boolean;
    isPhysicsEnabled: boolean;
}

enum Status {
    NonStarted = "NonStarted",
    Loading = "Loading",
    Completed = "Completed"
}

class ReactVis extends React.Component<{}, IReactVisState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            edgesCount: 250000,
            graph: {},
            isForceAtlas: false,
            isLoading: Status.NonStarted,
            isPhysicsEnabled: false,
            isPosition: false,
            isRendering: false,
            nodes: [],
            nodesCount: 50000,
            options: 0
        };
    }

    public nodesComputation = (nodes: any) => {
        this.setState({ nodes: nodes.nodes.splice(0, this.state.nodesCount).map(this.getNode) }, this.edgesComputation);
    }

    public edgesComputation = () => {
        fetch("/edges.json").then(x => x.json().then((edgesData) => {
            const edges = edgesData.edges.filter(this.edgeFilter).splice(0, this.state.edgesCount).map(this.getEdge);
            this.setState({ graph: { nodes: this.state.nodes, edges }, isLoading: Status.Completed });
        }));
    }

    public getNode = (node: any) => {
        return {
            id: node.id,
            size: node.size,
            x: this.state.isPosition ? node.x : undefined,
            y: this.state.isPosition ? node.y : undefined
        };
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
        return { from: edge.source, to: edge.target }
    }

    public loadData = () => {
        this.setState({ isLoading: Status.Loading, isRendering: false, isForceAtlas: false });
        fetch("/nodes.json").then(x => x.json().then((y) => this.nodesComputation(y)));
    }

    public loadHighlyConnectedGraph = () => {
        this.setState({ isLoading: Status.Loading, isRendering: false, isForceAtlas: false });
        fetch("/artic.json").then(x => x.json().then((y) => {
            const nodes = y.nodes.map(this.getNode);
            const edges = y.edges.map(this.getEdge);
            this.setState({ graph: { nodes, edges }, isLoading: Status.Completed });
        }));
    }

    public render(): JSX.Element {
        return (
            <>
                <h1>react-ReactVis</h1>
                <p>{"Number of nodes"}</p>
                <input type="text" onChange={(event) => this.setState({ nodesCount: Number(event.target.value) })} value={this.state.nodesCount} />
                <p>{"Number of edges"}</p>
                <input type="text" onChange={(event) => this.setState({ edgesCount: Number(event.target.value) })} value={this.state.edgesCount} />
                <p>{"Physics"}</p>
                <input type="checkbox" onChange={(event) => this.setState({ isPhysicsEnabled: event.target.checked })} />
                <p>{"Positions"}</p>
                <input type="checkbox" onChange={(event) => this.setState({ isPosition: event.target.checked })} />
                <div>
                    <button onClick={this.loadData}>{"ReactVis Load data to react state"}</button>
                    <button onClick={this.loadHighlyConnectedGraph}>{"Load highly connected graph"}</button>
                    {this.state.isLoading === Status.Completed && <button onClick={() => this.setState({ isRendering: true })}>{"ReactVis Start rendering"}</button>}
                </div>
                <p>{"Loading " + this.state.isLoading}</p>
                {this.state.isLoading === Status.Completed && this.renderMetadata()}
                {this.state.isRendering && this.startRendering()}
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
            <XYPlot>
                {this.state.graph["edges"].map((edge: any) => {
                    return (
                        <LineSeriesCanvas
                            color={'#B3AD9E'}
                            key={`link-${edge.id}`}
                            opacity={0.3}
                            data={[{ ...edge.source, color: null }, { ...edge.target, color: null }]}
                        />
                    );
                })}
                <MarkSeriesCanvas
                    data={this.state.graph["nodes"]}
                    colorType={'category'}
                    stroke={'#ddd'}
                    strokeWidth={2}
                />
            </XYPlot>
        );
    }
}

export default ReactVis;
