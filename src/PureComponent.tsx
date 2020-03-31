import * as React from 'react';

interface IPureComponentState {
    score: number;
}

class PureComponent extends React.PureComponent<{}, IPureComponentState> {
  public componentDidMount() {
    setInterval(() => {
        this.setState({score: 1});
    }, 2000);
  }  

  public render() {
    // tslint:disable-next-line:no-console
    console.log("render");  
    return (
      <div>
          PureComponent
      </div>
    );
  }
}

export default PureComponent;
