/** @jsx React.DOM */

(function($) { var main = function() {

if (!$)            return console.log("Waiting for jQuery");
if (!window.React) return console.log("Waiting for React");
if (!window.Chart) return console.log("Waiting for Chart.js");
if (!window.qr)    return console.log("Waiting for QR.js")

var BitcoinPrice = React.createClass({displayName: 'BitcoinPrice',

  getDefaultProps: function() {
    return {
      currency: 'USD'
    };
  },

  getInitialState: function() {
    return {
      bitcoinPrice: null,
      currency: "USD",
      symbol: null,
      ticker: {}
    };
  },

  componentDidMount: function() {
    var self = this;
    var url = 'https://blockchain.info/ticker?cors=true';
    var currency = self.props.currency;
    var success = function(data) {
      if (self.isMounted()) {
        self.setTicker(data);
        self.setCurrency(currency);
      }
    };
    $.ajax(url).done(success);

    var $menu = $(self.refs.priceMenu.getDOMNode());
    var $label = $(self.refs.priceLabel.getDOMNode());
    var $footer = $(self.refs.priceFooter.getDOMNode());

    var showMenu = function(event) {
      $label.hide();
      $menu.show();
      event.preventDefault();
      event.stopPropagation();
    };
    var hideMenu = function(event) {
      $label.show();
      $menu.hide();
    };
    $label.click(showMenu);
    $menu.change(hideMenu);
  },

  handleCurrency: function(event) {
    var self = this;
    var currency = event.target.value;
    self.setCurrency(currency);
  },

  setTicker: function(data) {
    var self = this;
    self.setState({
      ticker: data
    });
  },

  setCurrency: function(currency) {
    var self = this;
    self.setState({
      currency: currency,
      symbol: self.state.ticker[currency]['symbol'],
      bitcoinPrice: self.state.ticker[currency]['15m']
    });
  },

  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.span({className: "widget-label"}, "Bitcoin Price"), 
        React.DOM.span({className: "price-value"}, this.state.symbol, this.state.bitcoinPrice), 
        React.DOM.div({className: "price-footer", ref: "priceFooter"}, 
          React.DOM.span({className: "price-label", ref: "priceLabel"}, 
            React.DOM.a({href: "#"}, 
              "BTC/", this.state.currency
            )
          ), 
          React.DOM.select({className: "price-menu", name: "currency", ref: "priceMenu", 
              defaultValue: "USD", 
              onChange: this.handleCurrency}, 
            React.DOM.option({value: "AUD"}, "AUD (Australian Dollar)"), 
            React.DOM.option({value: "BRL"}, "BRL (Brazilian Real)"), 
            React.DOM.option({value: "CAD"}, "CAD (Canadian Dollar)"), 
            React.DOM.option({value: "CHF"}, "CHF (Swiss Franc)"), 
            React.DOM.option({value: "CLP"}, "CLP (Chilean Peso)"), 
            React.DOM.option({value: "CNY"}, "CNY (Chinese Yuan)"), 
            React.DOM.option({value: "DKK"}, "DKK (Danish Krone)"), 
            React.DOM.option({value: "EUR"}, "EUR (Euro)"), 
            React.DOM.option({value: "GBP"}, "GBP (Pound Sterling)"), 
            React.DOM.option({value: "HKD"}, "HKD (Hong Kong Dollar)"), 
            React.DOM.option({value: "ISK"}, "ISK (Icelandic Krona)"), 
            React.DOM.option({value: "JPY"}, "JPY (Japanese Yen)"), 
            React.DOM.option({value: "KRW"}, "KRW (South Korean Won)"), 
            React.DOM.option({value: "NZD"}, "NZD (New Zealand Dollar)"), 
            React.DOM.option({value: "PLN"}, "PLN (Polish Zloty)"), 
            React.DOM.option({value: "RUB"}, "RUB (Russian Ruble)"), 
            React.DOM.option({value: "SEK"}, "SEK (Swedish Krona)"), 
            React.DOM.option({value: "SGD"}, "SGD (Singapore Dollar)"), 
            React.DOM.option({value: "THB"}, "THB (Thai Baht)"), 
            React.DOM.option({value: "TWD"}, "TWD (New Taiwan Dollar)"), 
            React.DOM.option({value: "USD"}, "USD (United States Dollar)")
          )
        )
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

var BitcoinQRCode = React.createClass({displayName: 'BitcoinQRCode',

  getDefaultProps: function() {
    return {
      title: "Bitcoin QR Code",
      address: null
    };
  },

  componentDidMount: function() {
    var self = this;
    var $container = $(self.refs.qrContainer.getDOMNode());
    var url = 'bitcoin:' + self.props.address;
    var image = qr.image({
      level: 'M',
      size: 5,
      value: url
    });
    $container.append(image);
  },

  render: function() {
    return(
      React.DOM.div(null, 
        React.DOM.span({className: "widget-label"}, this.props.title), 
        React.DOM.div({className: "qr-container", ref: "qrContainer"}), 
        React.DOM.div({className: "qr-footer"}, 
          React.DOM.span({className: "bitcoin-address-short"}, 
            React.DOM.a({href: "https://blockchain.info/address/" + this.props.address}, 
              this.props.address.slice(0,12), "…"
            )
          )
        )
      )
    );
  }

});

$('.coinlens.bitcoin-price').each(function(index, elem) {
  var $price = $(elem);
  React.renderComponent(
    BitcoinPrice({currency: $price.data('currency')}),
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

$('.coinlens.bitcoin-qr-code').each(function(index, elem) {
  var $qrcode = $(elem);
  React.renderComponent(
    BitcoinQRCode({address: $qrcode.data('address')}),
    $qrcode[0]
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

  var onJQuery = function() {
    $ = window.jQuery.noConflict(true);
    callback();
  };

  style("//qualiabyte.github.io/coinlens/css/coinlens.css");
  script("//code.jquery.com/jquery-1.10.0.min.js", onJQuery);
  script("//cdnjs.cloudflare.com/ajax/libs/react/0.11.1/react.js", callback);
  script("//qualiabyte.github.io/coinlens/lib/chart-new.js", callback);
  script("//qualiabyte.github.io/coinlens/lib/qr.js", callback);

};

// Let's do this!
setup(main);

}());
