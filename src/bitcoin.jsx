/** @jsx React.DOM */

var BitcoinPrice = React.createClass({

  getInitialState: function() {
    return {
      bitcoinPrice: null
    };
  },

  componentDidMount: function() {
    var self = this;
    var url = 'https://blockchain.info/ticker?cors=true';
    var success = function(data) {
      if (self.isMounted()) {
        self.setState({
          bitcoinPrice: data['USD']['15m']
        });
      }
    };
    $.ajax(url).done(success);
  },

  render: function() {
    return (
      <div>
        <span className="widget-label">Bitcoin Price</span>
        <span className="price-value">${this.state.bitcoinPrice}</span>
        <span className="price-label"> BTC/USD</span>
      </div>
    );
  }
});

var BitcoinBalance = React.createClass({

  getInitialState: function() {
    return {
      bitcoinBalance: null
    };
  },

  componentDidMount: function() {
    var self = this;
    var url = 'https://blockchain.info/q/addressbalance/' + self.props.address + '?cors=true';
    var success = function(data) {
      var balance = data / 1E8;
      if (self.isMounted()) {
        self.setState({
          bitcoinBalance: balance.toFixed(2)
        });
      }
    };
    $.ajax(url).done(success);
  },

  render: function() {
    return (
      <div>
        <span className="widget-label">Bitcoin Balance</span>
        <span className="balance">
          <span className="balance-value">{this.state.bitcoinBalance}</span>
          <span className="balance-units"> BTC</span>
        </span>
        <span className="bitcoin-address">{this.props.address}</span>
      </div>
    );
  }
});

$('.coinlens.bitcoin-price').each(function(index, elem) {
  var $price = $(elem);
  React.renderComponent(
    <BitcoinPrice />,
    $price[0]
  );
});

$('.coinlens.bitcoin-balance').each(function(index, elem) {
  var $balance = $(elem);
  React.renderComponent(
    <BitcoinBalance address={$balance.data('address')}/>,
    $balance[0]
  );
});
