# Hillsight Exchange
This is a library for interacting with supported exchange APIs.

## Installation

```ts
import { binance, ... } from "https://deno.land/x/hillsight/exchange/mod.ts";
```

## Usage

```ts
const exchange = binance({
  api_key: "...",
  secret_key: "...",
})
```

Read more about the [Provider API](./PROVIDER.md).

## Supported Exchanges

- [x] [Binance](https://www.binance.com/)
- [ ] [Kucoin](https://www.kucoin.com/)
- [ ] [Coinbase](https://www.coinbase.com/)
- [ ] [Kraken](https://www.kraken.com/)

### Binance

#### Credentials

You will be able to get a API key and secret key with the guide from [Binance FAQ](https://www.binance.com/en/support/faq/360002502072).

> Remember to enable `Enable Spot & Margin Trading` if you want to perform live trades.

```ts
{
  // API key from Binance
  api_key: "...",
  // Secret key from Binance
  secret_key: "...",
}
```

#### Options

```ts
{
  // No options available
}
```

### Kucoin

#### Credentials

You will be able to get a API key and secret key with the guide from [Kucoin](https://www.kucoin.com/support/360015102174-How-to-Create-an-API).

> Remember to check `Trade` if you want to perform live trades.

```ts
{
  // API key from Kucoin
  api_key: "...",
  // Secret key from Kucoin
  secret_key: "...",
}
```

#### Options

```ts
{
  // No options available
}
```

### Coinbase

#### Credentials

You will be able to get a API key and secret key with the guide from [Coinbase Help](https://help.coinbase.com/en/exchange/managing-my-account/how-to-create-an-api-key).

```ts
{
  // API key from Coinbase
  api_key: "...",
  // Secret key from Coinbase
  secret_key: "...",
}
```

#### Options

```ts
{
  // No options available
}
```

### Kraken

#### Credentials

You will be able to get a API key and secret key with the guide from [Kraken Support](https://support.kraken.com/hc/en-us/articles/360000919966-How-to-generate-an-API-key-pair-).

```ts
{
  // API key from Kraken
  api_key: "...",
  // Secret key from Kraken
  secret_key: "...",
}
```

#### Options

```ts
{
  // No options available
}
```

## Contributing

Please submit any issues or feature requests using the [github issue tracker](https://github.com/hillsight/exchange/issues).