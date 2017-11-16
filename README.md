
# CoinLens

A suite of minimalist Bitcoin widgets

![CoinLens Widgets](http://qualiabyte.github.io/coinlens/images/coinlens.png)

## Example

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <div class="coinlens bitcoin-price"></div>
    <div class="coinlens bitcoin-balance" data-address="36PrZ1KHYMpqSyAQXSG8VwbUiq2EogxLo2"></div>
    <div class="coinlens bitcoin-balance-history" data-uniform="true" data-count="25" data-address="36PrZ1KHYMpqSyAQXSG8VwbUiq2EogxLo2"></div>
    <script src="//qualiabyte.github.io/coinlens/coinlens.js"></script>
  </body>
</html>
```

Try the [live demo](http://qualiabyte.github.io/coinlens)!

## Widgets

### Bitcoin-Price

![Price Widget](http://qualiabyte.github.io/coinlens/images/bitcoin-price.png)

```html
<div class="coinlens bitcoin-price" data-currency="USD"></div>
```

**Options**

+ `currency` *String* The currency code for the price to display (Default: "USD")

### Bitcoin-Balance

![Balance Widget](http://qualiabyte.github.io/coinlens/images/bitcoin-balance.png)

```html
<div class="coinlens bitcoin-balance" data-address="36PrZ1KHYMpqSyAQXSG8VwbUiq2EogxLo2"></div>
```

**Options**

+ `address` *String* The bitcoin address (**Required**)

### Bitcoin-Balance-History

![Balance History Widget](http://qualiabyte.github.io/coinlens/images/bitcoin-balance-history.png)

```html
<div class="coinlens bitcoin-balance-history" data-uniform="true" data-count="25" data-address="36PrZ1KHYMpqSyAQXSG8VwbUiq2EogxLo2"></div>
```

**Options**

+ `address` *String* The bitcoin address (**Required**)
+ `count` *Number* The number of transactions to display (Default: 25)
+ `height` *Number* The height in pixels (Default: 300)
+ `uniform` *Boolean* Whether to space transactions evenly (Default: false)
+ `width` *Number* The width in pixels (Default: 400)

### Bitcoin-QR-Code

![QR Code Widget](http://qualiabyte.github.io/coinlens/images/bitcoin-qr-code.png)

```html
<div class="coinlens bitcoin-qr-code" data-address="36PrZ1KHYMpqSyAQXSG8VwbUiq2EogxLo2"></div>
```

**Options**

+ `address` *String* The bitcoin address (**Required**)

## Credits

Thanks to [BlockChain](https://blockchain.info) and [BlockCypher](http://www.blockcypher.com/) for the API data!  
Built with [React](http://facebook.github.io/react/), [jQuery](https://jquery.com), and [ChartNew.js](https://github.com/FVANCOP/ChartNew.js).  

## License

MIT
