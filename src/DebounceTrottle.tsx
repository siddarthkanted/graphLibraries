import * as React from 'react';

class DebounceTrottle extends React.Component {
  private timeOut: NodeJS.Timeout;
  private lastExecutedTime: number = 0;
  private delay = 500;

  constructor(props: {}) {
    super(props);
    clearTimeout(this.timeOut);
    this.lastExecutedTime = 0;
    this.delay = 1000;
  }

  public render() {
    return (
      <>
        <button onClick={this.debounce}>debounce button</button>
        <button onClick={this.throttle}>throttle button</button>
      </>
    );
  }

  private onClick = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("button clicked");
  }

  private debounce = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (this.timeOut) {
      console.log("debounce not executed");
      clearTimeout(this.timeOut);
    }
    this.timeOut = setTimeout(() => { console.log("debounce executed"); this.onClick(event) }, this.delay);
  }

  private throttle = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (Date.now() - this.lastExecutedTime >= this.delay) {
      this.lastExecutedTime = Date.now();
      console.log("throttel executed");
      this.onClick(event);
    } else {
      console.log("throttel not executed");
    }
  }
}

export default DebounceTrottle;
