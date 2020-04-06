import * as React from 'react';
import Graph from "react-graph-vis";


interface IVisState {
    options: number;
    isLoading: Status;
    nodesCount: number;
    nodesSize: number;
    nodesPositionWeight: number;
    edgesCount: number;
    isRendering: boolean;
    nodes: [];
    getNodes: [];
    graph: {};
    filteredGraph: {};
    isPosition: boolean;
    isForceAtlas: boolean;
    isPhysicsEnabled: boolean;
    removeNodes: number;
    scaleFactor: number;
    networkInstance: any;
    startTime: number;
}

enum Status {
    NonStarted = "NonStarted",
    Loading = "Loading",
    Completed = "Completed"
}

class Vis extends React.Component<{}, IVisState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            edgesCount: 20000,
            filteredGraph: {},
            getNodes: [],
            graph: {},
            isForceAtlas: false,
            isLoading: Status.NonStarted,
            isPhysicsEnabled: false,
            isPosition: true,
            isRendering: false,
            networkInstance: null,
            nodes: [],
            nodesCount: 5000,
            nodesPositionWeight: 10000,
            nodesSize: 1000,
            options: 0,
            removeNodes: 0,
            scaleFactor: 0.5,
            startTime: Date.now()
        };
    }

    public nodesComputation = (nodes: any) => {
        this.setState({ nodes: nodes.nodes.splice(0, this.state.nodesCount).map(this.getNode) }, this.edgesComputation);
    }

    public edgesComputation = () => {
        fetch("/edges.json").then(x => x.json().then((edgesData) => {
            const edges = edgesData.edges.filter(this.edgeFilter).splice(0, this.state.edgesCount).map(this.getEdge);
            this.setState({ graph: { nodes: this.state.nodes, edges }, filteredGraph: { nodes: this.state.nodes, edges }, isLoading: Status.Completed });
        }));
    }

    public getNode = (node: any) => {
        return {
            cid: node.id % 5,
            color: this.getRandomColor(),
            id: node.id,
            label: "node" + node.id,
            title: "node" + node.id,
            size: node.size * this.state.nodesSize,
            x: this.state.isPosition ? node.x * this.state.nodesPositionWeight : undefined,
            y: this.state.isPosition ? node.y * this.state.nodesPositionWeight : undefined
        };
    }

    public getRandomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
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
        this.setState({ isLoading: Status.Loading, isRendering: false });
        fetch("/nodes.json").then(x => x.json().then((y) => this.nodesComputation(y)));
    }

    public loadHighlyConnectedGraph = () => {
        this.setState({ isLoading: Status.Loading, isRendering: false });
        fetch("/artic.json").then(x => x.json().then((y) => {
            const nodes = y.nodes.map(this.getNode);
            const edges = y.edges.map(this.getEdge);
            this.setState({ graph: { nodes, edges }, filteredGraph: { nodes, edges }, isLoading: Status.Completed });
        }));
    }

    public render(): JSX.Element {
        return (
            <>
                <h1>react-graph-vis</h1>
                <p>{"Number of nodes"}</p>
                <input type="text" onChange={(event) => this.setState({ nodesCount: Number(event.target.value) })} value={this.state.nodesCount} />
                <p>{"Number of edges"}</p>
                <input type="text" onChange={(event) => this.setState({ edgesCount: Number(event.target.value) })} value={this.state.edgesCount} />
                <p>{"Nodes size multiplier"}</p>
                <input type="text" onChange={(event) => this.setState({ nodesSize: Number(event.target.value) })} value={this.state.nodesSize} />
                <p>{"Nodes positon multiplier"}</p>
                <input type="text" onChange={(event) => this.setState({ nodesPositionWeight: Number(event.target.value) })} value={this.state.nodesPositionWeight} />
                <p>{"Physics"}</p>
                <input type="checkbox" onChange={(event) => this.setState({ isPhysicsEnabled: event.target.checked })} />
                <p>{"Positions"}</p>
                <input type="checkbox" checked={this.state.isPosition} onChange={(event) => this.setState({ isPosition: event.target.checked })} />
                <p>{"forceAtlas2base"}</p>
                <input type="checkbox" checked={this.state.isForceAtlas} onChange={(event) => this.setState({ isForceAtlas: event.target.checked })} />
                <div>
                    <button onClick={this.loadData}>{"Vis Load data to react state"}</button>
                    <button onClick={this.loadHighlyConnectedGraph}>{"Load highly connected graph"}</button>
                </div>
                <p>{"Loading " + this.state.isLoading}</p>
                {this.state.isLoading === Status.Completed && this.afterLoading()}
            </>
        );
    }

    private afterLoading = () => {
        return (
            <>
                {this.renderMetadata()}
                <button onClick={() => this.setState({ isRendering: true, startTime: Date.now() })}>{"Vis Start rendering"}</button>
                <button onClick={() => this.clusterByCid()}>{"cluster nodes id%5"}</button>
                <button onClick={() => this.state.networkInstance.clusterByConnection(1)}>{"cluster nodes with id 1 and its neighbour"}</button>
                <button onClick={() => this.state.networkInstance.clusterOutliers()}>{"cluster nodes with number of edge 1"}</button>
                {this.state.isRendering && this.startRendering()}
                <p>{"Remove/Add all nodes from id 0 to n"}</p>
                <input type="textbox" id="range" onChange={(event) => this.setState({ removeNodes: Number(event.target.value) })} />
                <button onClick={this.filterNodes}>{"refresh"}</button>
            </>
        );
    }

    private filterNodes = () => {
        const nodes = this.state.graph["nodes"].filter((x: any) => x.id >= this.state.removeNodes);
        this.setState({ filteredGraph: { nodes, edges: this.state.graph["edges"] } });
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

    private getForceAtlasOptions = () => {
        return {
            nodes: {
                shape: "dot",
                size: 16,
                scaling: {
                    min: 10,
                    max: 30,
                    label: {
                        enabled: true
                    }
                },
            },
            layout: {
                randomSeed: 34
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -26,
                    centralGravity: 0.005,
                    springLength: 230,
                    springConstant: 0.18
                },
                maxVelocity: 146,
                solver: "forceAtlas2Based",
                timestep: 0.35,
                stabilization: {
                    enabled: true,
                    // 2000 recommended by vis
                    iterations: 100,
                    updateInterval: 25
                }
            }
        };
    }

    private startRendering = () => {
        const options = {
            autoResize: false,
            edges: {
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.5
                    }
                },
                color: "#000000",
                smooth: false,
                width: 0.5,
            },
            scaling: {
                min: 1000,
                max: 2000,
                label: {
                    min: 50,
                    max: 100,
                    drawThreshold: 10,
                    maxVisible: 60
                },
            },
            height: "100%",
            interaction: {
                hover: true,
                keyboard: true,
                navigationButtons: true
            },
            layout: {
                hierarchical: false,
                randomSeed: undefined,
                improvedLayout: false
            },
            nodes: {
                font: {
                    multi: 'html',
                    strokeColor: '#fff',
                    strokeWidth: 2,
                },
                scaling: {
                    min: 10,
                    max: 30,
                    label: {
                        enabled: true
                    }
                },
            },
            physics: {
                enabled: true,
                stabilization: {
                    enabled: true,
                    iterations: 1,
                    updateInterval: 25
                }
            },
            width: "100%"
        };
        const events = {
            selectNode: this.onSelectNode
        };
        return (
            <>
                <p>{"Graph API time duration seconds" + this.state.startTime}</p>
                <Graph
                    getNetwork={this.setNetworkInstance}
                    graph={this.state.filteredGraph}
                    options={this.state.isForceAtlas ? this.getForceAtlasOptions() : options}
                    events={events}
                />
            </>
        );
    }

    private setNetworkInstance = (networkInstance: any) => {
        this.setState({ networkInstance }, () => this.state.networkInstance.once("stabilizationIterationsDone", this.onStabilizationIterationsDone));
    }

    private onStabilizationIterationsDone = () => {
        this.state.networkInstance.physics.physicsEnabled = this.state.isPhysicsEnabled;
        const millis = Date.now() - this.state.startTime;
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        this.setState({ startTime: Number(seconds) });
    }

    private onSelectNode = (params: any) => {
        if (params.nodes.length === 1) {
            if (this.state.networkInstance.isCluster(params.nodes[0]) === true) {
                this.state.networkInstance.openCluster(params.nodes[0]);
            }
        }
    }

    private clusterByCid = () => {
        for (let i = 0; i < 5; i++) {
            const clusterOptionsByData = {
                joinCondition(childOptions: any) {
                    return childOptions.cid === i;
                },
                clusterNodeProperties: {
                    borderWidth: 3,
                    color: this.getRandomColor(),
                    font: {
                        color: this.getRandomColor(),
                        size: 14
                    },
                    id: 'cluster:' + i,
                    label: 'group:' + i,
                    shape: 'database'
                }
            };
            this.state.networkInstance.cluster(clusterOptionsByData);
        }
    }
}

export default Vis;
