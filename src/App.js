import React, { Component } from 'react';
import Web3 from 'web3';
import Book from './Book';
import NewOrder from './NewOrder';
import './App.css';

const contractAddress = '0x1234';

const provider = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const abi = [];
// const contract = new web3.eth.Contract(abi, contractAddress);
const contract = null;

const baseToken = {
  address: '',
  name: 'ZRX'
}
const quoteToken = {
  address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  name: 'WETH'
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      address: provider.eth.accounts[0]
    }
  }

  approveQuoteToken() {}

  approveBaseToken() {}

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Exchange {baseToken.name} for {quoteToken.name}</h1>
        </header>
        <button onClick={this.approveQuoteToken}>Approve {quoteToken.name}</button>
        <button onClick={this.approveBaseToken}>Approve {baseToken.name}</button>
        <NewOrder quoteToken={quoteToken}
                  baseToken={baseToken} 
                  contract={contract}
                  provider={provider}
                  address={this.state.address} />

        <Book contract={contract} 
              provider={provider} 
              address={this.state.address}
              quoteToken={quoteToken}
              baseToken={baseToken} />
      </div>
    );
  }
}

export default App;
