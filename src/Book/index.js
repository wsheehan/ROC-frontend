import React, { Component } from 'react';
import Order from '../Order';
import BigNumber from 'bignumber.js';

class Book extends Component {
  constructor(props) {
    super(props);
    this.state = {
      book: {
        asks: [
          { amount: 10, price: 0.03, hash: '024234324vdewrterw324', address: props.provider.eth.accounts[1] }
        ],
        bids: [
          { amount: 8, price: 0.02, hash: '02doq54ohi3johtoimog', address: props.provider.eth.accounts[0] }
        ] 
      }
    }
  }

  componentDidMount() {
    // this.initOrders();
  }

  async initOrders() {
    const contract = this.props.contract;

    const ordersHashes = await contract.orders.call();

    let unsortedOrders = { asks: [], bids: [] };
    for (let i = 0; i < ordersHashes.length; i++) {
      const order = await contract.getInfo(ordersHashes[i]);
      if (order.amount > 0) {
        unsortedOrders.bids.push(order);
      } else {
        unsortedOrders.asks.push(order)
      }
    }

    this.setState({
      book: {
        bids: unsortedOrders.bids.sort((a, b) => b.price - a.price),
        asks: unsortedOrders.asks.sort((a, b) => a.price - b.price)
      }
    });

    const newOrder = contract.NewOrder();
    newOrder.watch((err, res) => {
      if (!err) {
        const realAmount = new BigNumber(res.amount).shiftedBy(-18).toNumber();
        if (realAmount > 0) {
          this.setState((prevState, props) => {
            const bids = prevState.book.bids;
            const index = bids.findIndex((bid) => res.price > bid.price);
            bids.splice(index, 0, res);
            prevState.bids = bids;
            return prevState;
          })
        } else {
          this.setState((prevState, props) => {
            const asks = prevState.book.asks;
            const index = asks.findIndex((ask) => res.price < ask.price);
            asks.splice(index, 0, res);
            prevState.asks = asks;
            return prevState;
          })
        }
      }
    });

    const cancelledOrder = contract.CancelledOrder();
    cancelledOrder.watch((err, res) => {
      if (!err) {
        const side = res.amount > 0;
        this.setState((prevState, props) => {
          const newSide = prevState.book[side].filter(order => order.hash !== res.hash);
          prevState[side] = newSide;
          return prevState;
        });
      }
    });

    const filledOrder = contract.FilledOrder();
    filledOrder.watch((err, res) => {
      if (!err) {
        const side = res.amount > 0;
        this.setState((prevState, props) => {
          const realAmount = res.amount.shiftedBy(-18);
          const newSide = prevState.book[side].reduce((_newSide, order) => {
            if (res.hash === order.hash) {
              if (realAmount !== order.amount) {
                order.amount = order.amount - realAmount;
                _newSide.push(order);
              }
            } else {
              _newSide.push(order);
            }
          }, []);
          prevState[side] = newSide;
          return prevState;
        })
      }
    });
  }

  render() {
    return (
      <div className="Book">
        <div className="asks">
          <div className="Order Order-Header">
            <span>Price</span>
            <span>Amount</span>
          </div>
          {this.state.book.asks.map((ask) => (
            <Order key={ask.hash}
                  order={ask} 
                  type='ask' 
                  contract={this.props.contract} 
                  provider={this.props.provider}
                  address={this.props.address} 
                  quoteToken={this.props.quoteToken.address}
                  baseToken={this.props.baseToken.address} />
          ))}
        </div>
        <div className="bids">
          <div className="Order Order-Header">
            <span>Price</span>
            <span>Amount</span>
          </div>
          {this.state.book.bids.map((bid) => (
            <Order key={bid.hash}
                  order={bid} 
                  type='bid' 
                  contract={this.props.contract} 
                  provider={this.props.provider}
                  address={this.props.address} 
                  quoteToken={this.props.quoteToken.address}
                  baseToken={this.props.baseToken.address} />
          ))}
        </div>
      </div>
    )
  }
}

export default Book;