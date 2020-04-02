import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
// import Cytoscape from './Cytoscape';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import Regraph from './Regraph';
import Vis from './Vis';

// Sigma
ReactDOM.render(
  <App />,
  document.getElementById('sigmaDiv') as HTMLElement
);

// // cytoscapeDiv
// ReactDOM.render(
//   <Cytoscape />,
//   document.getElementById('cytoscapeDiv') as HTMLElement
// );

ReactDOM.render(
  <Vis />,
  document.getElementById('visDiv') as HTMLElement
);


ReactDOM.render(
  <Regraph />,
  document.getElementById('regraphDiv') as HTMLElement
);

// ReactDOM.render(
//   <ReactVis />,
//   document.getElementById('reactVisDiv') as HTMLElement
// );


// visDiv



registerServiceWorker();
