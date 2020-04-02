import * as React from 'react';
import { Chart } from "regraph";

enum layout {
    'standard',
    'organic',
    'structural',
    'radial',
    'lens',
    'hierarchy',
    'sequential',
    'tweak'
}

enum ViewValues {
    fit ="fit"
}

interface IRegraphState {
    options: number;
    isLoading: Status;
    nodesCount: number;
    edgesCount: number;
    isRendering: boolean;
    nodes: [];
    positions: {};
    graph: {};
    isRandomizeNodePositions: boolean;
    isForceAtlas: boolean;
    layout: string;
    size: number;
}

enum Status {
    NonStarted = "NonStarted",
    Loading = "Loading",
    Completed = "Completed"
}

class Regraph extends React.Component<{}, IRegraphState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            edgesCount: 20000,
            graph: {},
            isForceAtlas: false,
            isLoading: Status.NonStarted,
            isRandomizeNodePositions: false,
            isRendering: false,
            layout: "organic",
            nodes: [],
            nodesCount: 5000,
            options: 0,
            positions: {},
            size: 7
        };
    }

    public nodesComputation = (nodes: any) => {
        this.setState({ nodes: nodes.nodes.splice(0, this.state.nodesCount) }, this.edgesComputation);
    }

    public edgesComputation = () => {
        fetch("/edges.json").then(x => x.json().then((edges) => {
            const items = {};
            const positions = {};
            this.state.nodes.forEach(i => {
                items["nodes" + i["id"]] = {
                    color: "teal",
                    size: i["size"] * this.state.size,
                };
                positions["nodes" + i["id"]] = {
                    x: i["x"] * 10000,
                    y: i["y"] * 10000
                };
            });
            edges.edges.filter(this.edgeFilter).splice(0, this.state.edgesCount).forEach(
                (j: { id: string; source: string; target: string; }) =>
                    (items["edges" + j.id] = {
                        id1: "nodes" + j.source,
                        id2: "nodes" + j.target
                    })
            );
            this.setState({ graph: items, positions, isLoading: Status.Completed });
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
        fetch("/artic.json").then(x => x.json().then((y) => {
            const items = {};
            const positions = {};
            y.nodes.forEach((i: { [x: string]: any; }) => {
                items["nodes" + i["id"]] = {
                    color: "teal",
                    size: i["size"] / 40,
                };
                positions["nodes" + i["id"]] = {
                    x: i["x"],
                    y: i["y"]
                };
            });
            y.edges.forEach(
                (j: { id: string; source: string; target: string; }) =>
                    (items["edges" + j.id] = {
                        id1: "nodes" + j.source,
                        id2: "nodes" + j.target
                    })
            );
            this.setState({ graph: items, positions, isLoading: Status.Completed });
        }));
    }

    public render(): JSX.Element {
        return (
            <>
                <h1>regraph</h1>
                <p>{"Number of nodes"}</p>
                <input type="text" onChange={(event) => this.setState({ nodesCount: Number(event.target.value) })} value={this.state.nodesCount} />
                <p>{"Number of edges"}</p>
                <input type="text" onChange={(event) => this.setState({ edgesCount: Number(event.target.value) })} value={this.state.edgesCount} />
                <p>{"Size of node"}</p>
                <input type="text" onChange={(event) => this.setState({ size: Number(event.target.value) })} value={this.state.size} />
                <p>{"Layout"}</p>
                <select onChange={(event) => this.setState({ layout: event.target.innerText })}>
                    <option>standard</option>
                    <option>structural</option>
                    <option>organic</option>
                    <option>lens</option>
                    <option>tweak</option>
                    <option>hierarchy</option>
                    <option>tadial</option>
                    <option>sequential</option>
                </select>
                <div>
                    <button onClick={this.loadData}>{"Regraph Load data to react state"}</button>
                    <button onClick={this.loadHighlyConnectedGraph}>{"Load highly connected graph"}</button>
                    {this.state.isLoading === Status.Completed && <button onClick={() => this.setState({ isRendering: true })}>{"Regraph Start rendering without random position"}</button>}
                    {this.state.isLoading === Status.Completed && <button onClick={() => this.setState({ isRandomizeNodePositions: true })}>{"Regraph Start rendering with random position"}</button>}
                </div>
                <p>{"Loading " + this.state.isLoading}</p>
                {this.state.isLoading === Status.Completed && this.renderMetadata()}
                <div style={{ height: '840px', position: 'relative' }}>
                    {this.state.isRendering && this.startRendering(false)}
                    {this.state.isRandomizeNodePositions && this.startRendering(true)}
                </div>
            </>
        );
    }

    private renderMetadata = () => {
        return (
            <>
                <p>{"metadata"}</p>
                <p>{"nodes length " + Object.keys(this.state.graph).filter(x => x.includes("nodes")).length}</p>
                <p>{"edges length " + Object.keys(this.state.graph).filter(x => x.includes("edges")).length}</p>
            </>
        )
    }

    private startRendering = (isOrganic: boolean) => {
        const settings = {
            options: {
                navigation: false,
                overview: false
            }
        };
        const props = {
            items: this.state.graph,
            ...settings,
            animation: { animate: true, time: 750 },
            view: ViewValues[ViewValues.fit]
        }
        if (isOrganic) {
            const layoutName = { name: layout[this.state.layout] };
            return (
                <>
                    <Chart {...props} layout={layoutName} />
                </>
            );
        }
        return (
            <>
                <Chart {...props} positions={this.state.positions} />
            </>
        );
    }
}

export default Regraph;
