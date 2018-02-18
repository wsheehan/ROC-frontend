import React, { Component } from 'react';
import { ZeroEx } from '0x.js';
import BigNumber from 'bignumber.js';

class Order extends Component {
  constructor() {
    super();
    this.state = {
      takeAmount: 0
    }

    this.unfoldOrder = this.unfoldOrder.bind(this);
    this.updateTakeAmount = this.updateTakeAmount.bind(this);
    this.takeOrder = this.takeOrder.bind(this);
    this.cancelOrder = this.cancelOrder.bind(this);
  }

  unfoldOrder() {
    document.getElementById(this.props.order.hash).style.display = 'block';
  }

  updateTakeAmount(e) {
    this.setState({ takeAmount: Number(e.target.value) });
  }

  takeOrder(e) {
    const amount = new BigNumber(this.state.takeAmount).shiftedBy(18);
    return this.props.contract.takeOrder(this.state.order.hash, amount);
  }

  cancelOrder(e) {
    return this.props.contract.cancelLimit(this.props.order.hash);
  }

  render() {
    const order = this.props.order;
    if (order.address === this.props.address) {
      return (
        <div className="Order">
          <span>{order.price}</span>
          <span>{order.amount}</span>
          <span onClick={this.cancelOrder}>Cancel Order</span>
        </div>
      )
    } else {
      return (
        <div className="Order">
          <span>{order.price}</span>
          <span>{order.amount}</span>
          <span onClick={this.unfoldOrder}>Take Order</span>
          <div id={order.hash} style={{ display: 'none' }}>
            <input type='text' onChange={this.updateTakeAmount} />
            <input type='submit' value="Take Order" onClick={this.takeOrder} />
          </div>
        </div>
      )
    }
  }
}

function takeOrder({ hash, amount }, contract) {

}

export default Order;