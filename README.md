# Protocol: Football Scores Prediction

## Table of Contents
- [⚽️ Description](#-description)
- [📋 Basic Info](#-basic-info)
- [⚙️ Configuration Parameters](#-configuration-parameters)
- [⏱️ Performance Requirements](#-performance-requirements)
- [🏆 Scoring System Details](#-scoring-system-details)
- [🔗 Communication Schemas](#-communication-schemas)
- [🚀 Become a Provider](#-become-a-provider-in-this-protocol) 👈👈👈
- [📊 Data for Your Machine Learning Model](#-data-for-your-machine-learning-model)

## ⚽️ Description

**Predict Football Match Outcomes and Earn Tokens!**

This protocol enables Providers to offer football match score prediction services. Providers can predict outcomes of upcoming football fixtures across various leagues, with predictions made at different time intervals before the match (`T7D`, `T36H`, `T12H`, `T1H`, `T1M`). The protocol supports `1X2` market predictions (Home Win/Draw/Away Win).

List of supported leagues: `Premier League`, `La Liga`, `Bundesliga`, `Serie A`, `Ligue 1`, `Primeira Liga`, `EFL Championship` and `MLS` 

## 📋 Basic Info

| Name                      | Value                      |
| ------------------------- | -------------------------- |
| PT Smart Contract Address | `0x2c21F0c457088814a3696Cd7B238Cb18b2e69e73` |
| PT Registration Date      | `May-14-2025`   |
| PT Details File CID       | `bagaaieraq7ozqwbguml6at3qmwylzfvrlb2spn24qjqvamj4ytql5pfq6x2q` |
| PT Owner Wallet Address   | `0xA4434214Af80bF856b556053B831596Cf02939d5`  |
| PT Owner Details File CID | `bagaaieras7kbhy57nvnzpvkvgk34kad6tg24iox6sejlajfxagtqlspzbwza` |                                                   |

## ⚙️ Configuration Parameters

This Protocol has the following configuration:

| Config                        | Value   | Enforced by    |
| ----------------------------- | ------- | -------------- |
| Maximum Number of Validators  | `5`     | Smart Contract |
| Maximum Number of Providers   | `15`     | Smart Contract |
| Minimum Collateral            | `100`   | Smart Contract |
| Validator Registration Fee    | `200`   | Smart Contract |
| Provider Registration Fee     | `100`    | Smart Contract |
| Offer Registration Fee        | `150`    | Smart Contract |
| Update Delay for Terms Change | `500`  | Smart Contract |
| Validators Share of Emissions | `10%`   | Smart Contract |
| Providers Share of Emissions  | `60%`   | Smart Contract |
| PT Owner Share of Emissions   | `30%`   | Smart Contract |
| CID of the Details File       | `bagaaieraq7ozqwbguml6at3qmwylzfvrlb2spn24qjqvamj4ytql5pfq6x2q` | Smart Contract |

You can always double-check the on-chain values e.g. [here](https://sepolia.basescan.org/address/0x592483982A67336A742947fC06E36f6d54051AC9)

## ⏱️ Performance Requirements

The Validators are performing a number of tests on Resources to ensure quality across the board. Below is a list of checked benchmarks:

| Name             | Units  | Threshold Value | Min / Max |
| ---------------- | ------ | --------------- | --------- |
| Prediction Score | Points | 0              | Min       |
| Response Time    | ms     | 12000           | Max       |
| Availability     | %      | 99.9%           | Min       |

More in-depth descriptions of the Tests:

| Name             | Description                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prediction Score | Providers submit probability distributions for match outcomes. Score combines RPS (prediction accuracy) with EV (market efficiency), scaled by match difficulty. Formula: `(0.5 * Normalized_RPS * (1 + difficulty)) + Normalized_EV`. |
| Response Time    | Maximum allowed time to generate predictions for a batch of fixtures. Must be under 12 seconds to ensure timely predictions.                                                                                                                                                                                                   |
| Availability     | Service uptime requirement. Providers must maintain 99.9% availability to ensure reliable prediction service.                                                                                                                                                                                                                  |

## 🏆 Scoring System Details

The scoring system combines Ranked Probability Score (RPS) with Expected Value (EV) to evaluate both prediction accuracy and market efficiency:

1. **RPS Calculation**: Measures prediction accuracy against actual outcomes
   - Normalized to 0-100: `Math.round((1 - rps) * 100)`


2. **EV Calculation**: Measures market value of predictions
   - `EV = (provider_probability_on_predicted_outcome * market_odds_on_this_outcome) - 1`
   - Normalized if outcome matches prediction: `Math.round(min(EV/0.8, 1) * 100)`, else 0

3. **Final Score**: Combines both metrics with difficulty scaling
   ```javascript
   finalScore = (0.5 * Normalized_RPS * (1 + difficulty)) + Normalized_EV
   ```

This system rewards both accurate predictions and market-beating insights, with higher difficulty matches providing greater scoring potential.

## 🔗 Communication Schemas

### Challenge Object Structure

```json
[
  {
    "challengeId": "1985c4e9-aaf3-4848-bdb7-6fccfc2628e2",
    "homeTeam": "Chelsea",
    "awayTeam": "Manchester United",
    "venue": "Stamford Bridge",
    "league": "Premier League",
    "fixtureId": 19135033,
    "kickoffTime": "2025-05-16T19:15:00Z",
    "challengePhaseMinutes": 10080,
    "targetMarket": "1X2",
    "phaseIdentifier": "T7D",
    "difficulty": 0.875
  }
]
```

### Response Body Object Structure

```json
[
  {
    "challengeId": "1985c4e9-aaf3-4848-bdb7-6fccfc2628e2",
    "prediction": {
      "1X2": {
        "home": 0.45,
        "draw": 0.3,
        "away": 0.25
      }
    }
  }
]
```

## 🚀 Become a Provider in this Protocol

In order to compete in Forest you need a Forest Provider Daemon running and serving predictions when a Validator asks for them. There are two ways to integrate:
1. [*streamlined*] **You expose an API and use one of the Gateway Providers** First step: expose your model's predictions via an API compatible with this Protocol's schema. Second step: Register yourself as a Virtual Provider using ForestAI's CLI. Instructions available here: [link](docs/become-a-virtual-provider.md). 
2. [*full integration*] **You run the Daemon yourself**. Take this repo and follow these [instructions](docs/become-a-provider.md). A little longer process but full ownership and control.

## 📊 Data for Your Machine Learning Model
We provide you with daily updated football stats that might be helpful for you when training your models. 
Links: 
 - R2 bucket with data: https://pub-188d55f1c4c34a02a7a2cb79159e1c2d.r2.dev/fixtures/manifest.csv
 - Data schema description: https://ball.forestai.io/join-earn/data-schema
