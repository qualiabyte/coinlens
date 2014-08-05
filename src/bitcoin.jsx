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
        <span class="bitcoin-price-value">${this.state.bitcoinPrice}</span>
        <span class="bitcoin-price-label"> BTC/USD</span>
      </div>
    );
  }
});

React.renderComponent(
  <BitcoinPrice />,
  $('.bitcoin-price')[0]
);

React.renderComponent(
  <BitcoinBalance />,
  $('.bitcoin-balance')[0]
);
