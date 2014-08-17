/** @jsx React.DOM */

(function() { var main = function() {

if (!window.$)     return console.log("Waiting for jQuery");
if (!window.React) return console.log("Waiting for React");
if (!window.Chart) return console.log("Waiting for Chart.js");

var BitcoinPrice = React.createClass({displayName: 'BitcoinPrice',

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
      React.DOM.div(null, 
        React.DOM.span({className: "widget-label"}, "Bitcoin Price"), 
        React.DOM.span({className: "price-value"}, "$", this.state.bitcoinPrice), 
        React.DOM.span({className: "price-label"}, " BTC/USD")
      )
    );
  }
});

var BitcoinBalance = React.createClass({displayName: 'BitcoinBalance',

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
      React.DOM.div(null, 
        React.DOM.span({className: "widget-label"}, "Bitcoin Balance"), 
        React.DOM.span({className: "balance"}, 
          React.DOM.span({className: "balance-value"}, this.state.bitcoinBalance), 
          React.DOM.span({className: "balance-units"}, " BTC")
        ), 
        React.DOM.span({className: "bitcoin-address"}, this.props.address)
      )
    );
  }
});

var BitcoinBalanceHistory = React.createClass({displayName: 'BitcoinBalanceHistory',

  getDefaultProps: function() {
    return {
      count: 25,
      height: 300,
      uniform: false,
      width: 400
    };
  },

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
          + '&per_page=' + self.props.count,
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
        self.updateChart();
      }
    });
  },

  updateChart: function() {
    var self = this;
    var $container = $(self.refs.chartContainer.getDOMNode());
    var $canvas = $('<canvas>').attr({
      width: self.props.width,
      height: self.props.height
    });
    var ctx = $canvas[0].getContext('2d');
    var history = self.state.balanceHistory.concat().reverse();
    var dates = history.map(function(h, i) {
      return new Date(h.date);
    });
    var labels = history.map(function(h, i) {
      return (i == 0 || i == history.length - 1)
        ? new Date(h.date).toISOString().split(/T/)[0]
        : '';
    });
    var values = history.map(function(h) {
      return (h.balance / 1e8).toFixed(2);
    });
    var set = {
      fillColor: "rgba(0, 128, 255, 0.5)",
      strokeColor: "rgba(0, 128, 255, 0.8)",
      xPos: dates,
      data: values
    };
    var data = {
      labels: labels,
      xBegin: (self.props.uniform) ? null : dates[0],
      xEnd: (self.props.uniform) ? null : dates[dates.length-1],
      datasets: [ set ]
    };
    var options = {
      annotateDisplay: true,
      annotateClassName: 'coinlens-tooltip',
      annotateLabel:
        "<%= v3 + ' ' + 'BTC' + '<br>'" +
        " + v2.toString().split(' ')[0] + ' '" +
        " + v2.toISOString().slice(0,19).replace(/T/,' ') %>",
      fullWidthGraph: true,
      pointDot: true,
      pointDotRadius: 4,
      pointDotStrokeWidth: 2,
      rotateLabels: 0
    };
    var chart = new Chart(ctx).Line(data, options);
    $container.append($canvas);
  },

  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.span({className: "widget-label"}, "Bitcoin Balance History"), 
        React.DOM.div({className: "balance-history-chart", ref: "chartContainer"}), 
        React.DOM.span({className: "bitcoin-address"}, this.props.address)
      )
    );
  }
});

$('.coinlens.bitcoin-price').each(function(index, elem) {
  var $price = $(elem);
  React.renderComponent(
    BitcoinPrice(null),
    $price[0]
  );
});

$('.coinlens.bitcoin-balance').each(function(index, elem) {
  var $balance = $(elem);
  React.renderComponent(
    BitcoinBalance({address: $balance.data('address')}),
    $balance[0]
  );
});

$('.coinlens.bitcoin-balance-history').each(function(index, elem) {
  var $history = $(elem);
  React.renderComponent(
    BitcoinBalanceHistory({address: $history.data('address'), 
      count: $history.data('count'), 
      height: $history.data('height'), 
      uniform: $history.data('uniform'), 
      width: $history.data('width')}),
    $history[0]
  );
});

}; // end main

var setup = function(callback) {

  var script = function(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = script.onreadystatechange = callback;
    head.appendChild(script);
  };

  var style = function(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = link.onreadystatechange = callback;
    head.appendChild(link);
  };

  // style("http://qualiabyte.github.io/coinlens/src/coinlens.css");
  // script("http://qualiabyte.github.io/coinlens/lib/chart-new.js", callback);

  style("/src/coinlens.css");
  script("http://code.jquery.com/jquery-1.10.0.min.js", callback);
  script("http://fb.me/react-0.11.1.min.js", callback);
  script("/lib/chart-new.js", callback);

};

// Let's do this!
setup(main);

}());
