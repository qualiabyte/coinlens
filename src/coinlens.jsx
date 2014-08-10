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

var BitcoinBalanceHistory = React.createClass({

  getInitialState: function() {
    return {
      balanceHistory: null
    };
  },

  componentDidMount: function() {
    var self = this;
    var address = self.props.address;
    var getBalance = function(callback) {
      $.ajax({
        url: 'https://api.biteasy.com/blockchain/v1/addresses/' + self.props.address,
        success: function(json, status, xhr) {
          return callback(json.data.balance);
        }
      });
    };
    var getTxs = function(callback) {
      $.ajax({
        url: 'https://api.biteasy.com/blockchain/v1/transactions?address='
          + self.props.address
          + '&per_page=100',
        success: function(json, status, xhr) {
          return callback(json.data.transactions);
        }
      });
    };
    var getHistory = function(callback) {
      getBalance(function(balance) {
        getTxs(function(txs) {
          var history = [];
          for (var i = 0; i < txs.length; i++) {
            var tx = txs[i];
            var out = 0;
            var inn = 0;

            for (var j in tx.outputs)
              if (tx.outputs[j].to_address == address)
                out += tx.outputs[j].value;

            for (var j in tx.inputs)
              if (tx.inputs[j].from_address == address)
                inn += tx.inputs[j].outpoint_value;

            history[i] = {
              balance: (i == 0)
                ? balance
                : history[i-1].balance + history[i-1].in - history[i-1].out,
              date: txs[i].created_at,
              out: out,
              in: inn
            };
          }
          return callback(history, balance, txs);
        });
      });
    };
    getHistory(function(history, balance, txs) {
      if (self.isMounted()) {
        self.setState({
          balance: balance,
          balanceHistory: history,
          transactions: txs
        });
      }
    });
  },

  render: function() {
    return (
      <div>
        <span className="widget-label">Bitcoin Balance History</span>
        <span className="balance-history">
          <pre>{JSON.stringify(this.state.balanceHistory, null, '  ')}</pre>
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

$('.coinlens.bitcoin-balance-history').each(function(index, elem) {
  var $history = $(elem);
  React.renderComponent(
    <BitcoinBalanceHistory address={$history.data('address')}/>,
    $history[0]
  );
});
