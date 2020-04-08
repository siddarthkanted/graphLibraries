import * as _ from 'lodash';
import { cloneDeep } from 'lodash-es';
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
    endTime: number;
    activity: string;
    forceAtlasIteration: number;
    nodesRecolor: number;
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
            startTime: Date.now(),
            endTime: Date.now(),
            forceAtlasIteration: 200,
            nodesRecolor: 0,
            activity: "nothing"
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
            // label: "node" + node.id,
            // title: "node" + node.id,
            size: node.size * this.state.nodesSize,
            x: this.state.isPosition && node.x ? node.x * this.state.nodesPositionWeight : undefined,
            y: this.state.isPosition && node.y ? node.y * this.state.nodesPositionWeight : undefined
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
        return { from: edge.source, to: edge.target, color: { color: this.getRandomColor() } }
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
                <p>{"forceAtlas iteration count"}</p>
                <input type="text" onChange={(event) => this.setState({ forceAtlasIteration: Number(event.target.value) })} value={this.state.forceAtlasIteration} />
                <div>
                    <button onClick={this.loadData}>{"Vis Load data to react state"}</button>
                    <button onClick={this.loadHighlyConnectedGraph}>{"Load highly connected graph"}</button>
                    <button onClick={() => this.loadGplus("nodes_5000.json")}>{"nodes_5000.json"}</button>
                    <button onClick={() => this.loadGplus("nodes_5000_reduced.json")}>{"nodes_5000_reduced.json"}</button>
                    <button onClick={() => this.loadGplus("nodes_10000.json")}>{"nodes_10000.json"}</button>
                    <button onClick={() => this.loadGplus("nodes_1000.json")}>{"nodes_1000.json"}</button>
                    <button onClick={() => this.loadGplus("nodes_1000_reduced.json")}>{"nodes_1000_reduced.json"}</button>
                    <button onClick={() => this.loadGplus("nodes_2000.json")}>{"nodes_2000.json"}</button>
                    <button onClick={() => this.loadGplus("nodes_2000_reduced.json")}>{"nodes_2000_reduced.json"}</button>
                </div>
                <p>{"Loading " + this.state.isLoading}</p>
                {this.state.isLoading === Status.Completed && this.afterLoading()}
            </>
        );
    }

    private loadGplus = (fileName: string) => {
        const filePath = "/gplus/" + fileName;
        const filePathWithPosition = "/gplusWithPosition/" + fileName;
        this.setState({ isLoading: Status.Loading, isRendering: false });
        const edges: never[] = [];
        fetch(filePath).then(x => x.json().then((y) => {
            const nodes = Object.keys(y).map((key, count) => this.gplusNode(key, y[key], edges, count));
            if (!this.state.isPosition) {
                this.setState({ graph: { nodes, edges }, filteredGraph: { nodes, edges }, isLoading: Status.Completed });
            }
            else {
                const nodesDict = _.keyBy(nodes, 'id');
                fetch(filePathWithPosition).then(x1 => x1.json().then((y1) => {
                    y1.forEach((element: any) => {
                        nodesDict[element.id]["x"] = element.x;
                        nodesDict[element.id]["y"] = element.y
                        nodesDict[element.id]["color"] = element.color;
                    });
                    this.setState({ graph: { nodes, edges }, filteredGraph: { nodes, edges }, isLoading: Status.Completed });
                }))
            }
        }));
    }

    private gplusNode = (key: any, value: any, edgesArray: any, count: number) => {
        value["edges"].forEach((element: any) => {
            edgesArray.push({ from: key, to: element, color: { color: this.getRandomColor() } });
        });
        return {
            color: this.getRandomColor(),
            id: key,
            cid: count % 5,
            // label: "node" + key,
            // title: "node" + key,
            size: value.nodeSize ? value.nodeSize : undefined
        };
    }

    private afterLoading = () => {
        return (
            <>
                {this.renderMetadata()}
                <button onClick={() => this.setState({ isRendering: true, startTime: Date.now(), activity: "render clicked" })}>{"Vis Start rendering"}</button>
                <button onClick={() => this.clusterByCid()}>{"cluster nodes id%5"}</button>
                <button onClick={() => this.state.networkInstance.clusterByConnection(1)}>{"cluster nodes with id 1 and its neighbour"}</button>
                <button onClick={() => this.state.networkInstance.clusterOutliers()}>{"cluster nodes with number of edge 1"}</button>
                <p>{"activity " + this.state.activity}</p>
                <p>{"Start time " + new Date (this.state.startTime).toUTCString() }</p>
                <p>{"End time " + new Date (this.state.endTime).toUTCString()}</p>
                <p>{"Time subtract " + this.timeSubtract()}</p>
                <p>{"Remove/Add all nodes from id 0 to n"}</p>
                <input type="textbox" onChange={(event) => this.setState({ removeNodes: Number(event.target.value) })} />
                <button onClick={this.filterNodes}>{"refresh"}</button>
                <p>{"Re-color all nodes from 1 to n"}</p>
                <input type="textbox" onChange={(event) => this.setState({ nodesRecolor: Number(event.target.value) })} />
                <button onClick={this.reColorNodes}>{"refresh"}</button>
                {this.state.isRendering && this.startRendering()}
                {/* <button onClick={this.exportFiles} id="export">{"export nodes and edges"}</button> */}
            </>
        );
    }

    // private exportFiles = () => {
    //     if (this.state.networkInstance) {
    //         const nodes = Object.keys(this.state.networkInstance.body.nodes).map(this.getExportNode);
    //         const dlbtn = document.getElementById("export");
    //         const obj = { nodes };
    //         const file = new Blob([JSON.stringify(obj)], { "type": "text/plain" });
    //         dlbtn!["href"] = URL.createObjectURL(file);
    //         dlbtn!["download"] = name;
    //     }
    // }

    // private getExportNode = (nodeId: any) => {
    //     const node = this.state.networkInstance.body.nodes[nodeId];
    //     return {
    //         id: node.id,
    //         color: node._localColor,
    //         x: node.x,
    //         y: node.y
    //     };
    // }

    private reColorNodes = () => {
        const color: string = this.getRandomColor();
        const nodes = cloneDeep(this.state.graph["nodes"]);
        for (let i = 0; i < this.state.nodesRecolor; i++) {
            nodes[i].color = color;
        }
        this.setState({ startTime: Date.now(),  activity: "reColorNodes clicked", filteredGraph: { nodes, edges: this.state.graph["edges"] } });
    }

    private filterNodes = () => {
        const nodes = this.state.graph["nodes"].filter((x: any, count: number) => count >= this.state.removeNodes);
        this.setState({ startTime: Date.now(), activity: "filter nodes clicked", filteredGraph: { nodes, edges: this.state.graph["edges"] } });
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
                shape: "circle",
                size: this.state.nodesSize,
                scaling: {
                    min: this.state.nodesSize,
                    max: this.state.nodesSize,
                    label: {
                        enabled: false
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
                    iterations: this.state.forceAtlasIteration,
                    updateInterval: 25
                }
            }
        };
    }

    private withPositionOptions = () => {
        return {
            // autoResize: false,
            edges: {
                smooth: {
                    type: 'continuous'
                },
                //     arrows: {
                //         to: {
                //             enabled: true,
                //             scaleFactor: 0.5
                //         }
                //     },
                //     color: "#000000",
                //     smooth: false,
                //     width: 0.5,
                // },
                // scaling: {
                //     min: 1000,
                //     max: 2000,
                //     label: {
                //         min: 50,
                //         max: 100,
                //         drawThreshold: 10,
                //         maxVisible: 60
                //     },
            },
            height: "100%",
            interaction: {
                //     hover: true,
                //     keyboard: true,
                navigationButtons: true,
                hideEdgesOnDrag: true
            },
            layout: {
                hierarchical: false,
                randomSeed: undefined,
                improvedLayout: false
            },
            nodes: {
                shapeProperties: {
                    interpolation: false    // 'true' for intensive zooming
                }
                //     font: {
                //         multi: 'html',
                //         strokeColor: '#fff',
                //         strokeWidth: 2,
                //     },
                //     scaling: {
                //         min: 10,
                //         max: 30,
                //         label: {
                //             enabled: true
                //         }
                //     }
            },
            physics: {
                enabled: this.state.isPhysicsEnabled,
                stabilization: {
                    enabled: true,
                    iterations: 1,
                    updateInterval: 1
                }
            },
            width: "100%"
        };
    }

    private timeSubtract = () => {
        const millis = this.state.endTime - this.state.startTime;
        const seconds = (millis / 1000).toFixed(1);
        return seconds;
    }

    private afterDrawing = () => {
        this.setState({ endTime: Date.now() });
    }

    private startRendering = () => {
        const events = {
            selectNode: this.onSelectNode,
            afterDrawing: this.afterDrawing
        };
        return (
            <>
                <Graph
                    getNetwork={this.setNetworkInstance}
                    graph={this.state.filteredGraph}
                    options={this.state.isForceAtlas ? this.getForceAtlasOptions() : this.withPositionOptions()}
                    events={events}
                />
            </>
        );
    }

    private setNetworkInstance = (networkInstance: any) => {
        // this.setState({ networkInstance }, () => this.state.networkInstance.once("stabilizationIterationsDone", this.onStabilizationIterationsDone));
        this.setState({ networkInstance });
    }

    // private onStabilizationIterationsDone = () => {
    //     // this.state.networkInstance.physics.physicsEnabled = this.state.isPhysicsEnabled;
    //     const millis = Date.now() - this.state.startTime;
    //     const seconds = (millis / 1000).toFixed(1);
    //     this.setState({ startTime: Number(seconds) });
    // }

    private onSelectNode = (params: any) => {
        if (params.nodes.length === 1) {
            if (this.state.networkInstance.isCluster(params.nodes[0]) === true) {
                this.state.networkInstance.openCluster(params.nodes[0]);
            }
        }
    }

    private clusterByCid = () => {
        this.setState({startTime: Date.now(), activity: "clusterNodes clicked"});
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
