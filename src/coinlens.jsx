/** @jsx React.DOM */

(function($) { var main = function() {

if (!$)            return console.log("Waiting for jQuery");
if (!window.React) return console.log("Waiting for React");
if (!window.Chart) return console.log("Waiting for Chart.js");
if (!window.qr)    return console.log("Waiting for QR.js")

var BitcoinPrice = React.createClass({

  getDefaultProps: function() {
    return {
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
    var success = function(data) {
      if (self.isMounted()) {
        self.setTicker(data);
        self.setCurrency(self.state.currency);
      }
    };
    $.ajax(url).done(success);
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
      <div>
        <span className="widget-label">Bitcoin Price</span>
        <span className="price-value">{this.state.symbol}{this.state.bitcoinPrice}</span>
        <div className="price-footer">
          <span className="price-label"> BTC/{this.state.currency}</span>
          <select className="price-menu" name="currency"
              defaultValue="USD"
              onChange={this.handleCurrency}>
            <option value="AUD">AUD (Australian Dollar)</option>
            <option value="BRL">BRL (Brazilian Real)</option>
            <option value="CAD">CAD (Canadian Dollar)</option>
            <option value="CHF">CHF (Swiss Franc)</option>
            <option value="CLP">CLP (Chilean Peso)</option>
            <option value="CNY">CNY (Chinese Yuan)</option>
            <option value="DKK">DKK (Danish Krone)</option>
            <option value="EUR">EUR (Euro)</option>
            <option value="GBP">GBP (Pound Sterling)</option>
            <option value="HKD">HKD (Hong Kong Dollar)</option>
            <option value="ISK">ISK (Icelandic Krona)</option>
            <option value="JPY">JPY (Japanese Yen)</option>
            <option value="KRW">KRW (South Korean Won)</option>
            <option value="NZD">NZD (New Zealand Dollar)</option>
            <option value="PLN">PLN (Polish Zloty)</option>
            <option value="RUB">RUB (Russian Ruble)</option>
            <option value="SEK">SEK (Swedish Krona)</option>
            <option value="SGD">SGD (Singapore Dollar)</option>
            <option value="THB">THB (Thai Baht)</option>
            <option value="TWD">TWD (New Taiwan Dollar)</option>
            <option value="USD">USD (United States Dollar)</option>
          </select>
        </div>
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
      <div>
        <span className="widget-label">Bitcoin Balance History</span>
        <div className="balance-history-chart" ref="chartContainer"></div>
        <span className="bitcoin-address">{this.props.address}</span>
      </div>
    );
  }
});

var BitcoinQRCode = React.createClass({

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
      <div>
        <span className="widget-label">{this.props.title}</span>
        <div className="qr-container" ref="qrContainer"></div>
        <div className="qr-footer">
          <span className="bitcoin-address-short">{this.props.address.slice(0,12)}…</span>
          <span className="bitcoin-address">{this.props.address}</span>
        </div>
      </div>
    );
  }

});

$('.coinlens.bitcoin-price').each(function(index, elem) {
  var $price = $(elem);
  React.renderComponent(
    <BitcoinPrice currency={$price.data('currency')} />,
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
    <BitcoinBalanceHistory address={$history.data('address')}
      count={$history.data('count')}
      height={$history.data('height')}
      uniform={$history.data('uniform')}
      width={$history.data('width')} />,
    $history[0]
  );
});

$('.coinlens.bitcoin-qr-code').each(function(index, elem) {
  var $qrcode = $(elem);
  React.renderComponent(
    <BitcoinQRCode address={$qrcode.data('address')} />,
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
