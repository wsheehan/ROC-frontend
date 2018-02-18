import React, { Component } from 'react';
import { ZeroEx } from '0x.js';
import BigNumber from 'bignumber.js';

class NewOrder extends Component {
  constructor(props) {
    super()
    this.state = {}
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(e) {
    e.preventDefault();

    const ZRX_ADDRESS = await this.props.contract.zeroX_address.call();
    const WETH_ADDRESS = await this.props.contract.wrapped_ether_address.call();
    const TOKEN_ADDRESS = await this.props.contract.token_address.call();
    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

    const MAKER = this.props.address;

    const orderHash = await this.props.web3.sha3(
      ZRX_ADDRESS, // ZRX address
      MAKER, // maker address
      NULL_ADDRESS,  // taker address
      WETH_ADDRESS, // maker token
      TOKEN_ADDRESS, // taker token
      NULL_ADDRESS, // feeRecipient
      new BigNumber(10.5), // maker token amount
      new BigNumber(50), // taker token amount
      new BigNumber(0), //maker fee
      new BigNumber(0), // taker fee
      new BigNumber(2**256 - 1), // expiration time
      new BigNumber(Math.random() * 100000000000000000) // salt
    );
    const ecSignature = this.props.web3.eth.sign(this.props.address, orderHash);

    const r = ecSignature.slice(0, 64);
    const s = ecSignature.slice(64, 128);
    const v = ecSignature.slice(128, 130); 

    if (this.state.side === 'buy') {
      const amountAsInt = this.props.order.amount.shiftedBy(18).toNumber();
      this.props.contract.placeLimit(amountAsInt, this.props.order.price, v, r, s, { 
        from: this.props.address,
        value: amountAsInt 
      });
    } else {
      const amountAsInt = this.props.order.amount.shiftedBy(18).negated().toNumber();
      this.props.contract.placeLimit(amountAsInt, this.props.order.price, v, r, s, { 
        from: this.props.address 
      });
    }
  }

  render() {
    return (
      <div className="NewOrder">
        <form onSubmit={this.handleSubmit}>
          <select value={this.state.side}>
            <option value='buy' selected>Buy</option>
            <option value='sell'>Sell</option>
          </select><br />
          <label>Amount</label>
          <input value={this.state.amount} /><br />

          <label>Price</label>
          <input value={this.state.price} /><br />
          <input type='submit' value='Place Order' />
        </form>
      </div>
    )
  }
}

export default NewOrder;