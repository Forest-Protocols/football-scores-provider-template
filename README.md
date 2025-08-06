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
| PT Smart Contract Address | `0x592483982A67336A742947fC06E36f6d54051AC9` |
| PT Registration Date      | `May-14-2025`   |
| PT Details File CID       | `bagaaieraq7ozqwbguml6at3qmwylzfvrlb2spn24qjqvamj4ytql5pfq6x2q` |
| PT Owner Wallet Address   | `0xA4434214Af80bF856b556053B831596Cf02939d5`  |
| PT Owner Details File CID | `bagaaieras7kbhy57nvnzpvkvgk34kad6tg24iox6sejlajfxagtqlspzbwza` |                                                   |

## ⚙️ Configuration Parameters

This Protocol has the following configuration:

| Config                        | Value   | Enforced by    |
| ----------------------------- | ------- | -------------- |
| Maximum Number of Validators  | `1`     | Smart Contract |
| Maximum Number of Providers   | `10`     | Smart Contract |
| Minimum Collateral            | `100`   | Smart Contract |
| Validator Registration Fee    | `100`   | Smart Contract |
| Provider Registration Fee     | `50`    | Smart Contract |
| Offer Registration Fee        | `50`    | Smart Contract |
| Update Delay for Terms Change | `1000`  | Smart Contract |
| Validators Share of Emissions | `20%`   | Smart Contract |
| Providers Share of Emissions  | `50%`   | Smart Contract |
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
| Prediction Score | Providers must submit probability distributions (p.h, p.d, p.a) for each match outcome. The Ranked Probability Score (RPS) is calculated by comparing these probabilities against the actual outcome (home/draw/away). The final score is calculated as `Math.round((1 - rps) * 100)`, resulting in a score between 0 and 100. |
| Response Time    | Maximum allowed time to generate predictions for a batch of fixtures. Must be under 12 seconds to ensure timely predictions.                                                                                                                                                                                                   |
| Availability     | Service uptime requirement. Providers must maintain 99.9% availability to ensure reliable prediction service.                                                                                                                                                                                                                  |

## 🏆 Scoring System Details

The prediction scoring system uses the Ranked Probability Score (RPS) formula to evaluate the quality of probability predictions:

1. For each match, providers submit three probabilities:

   - p.h: Probability of home win
   - p.d: Probability of draw
   - p.a: Probability of away win

2. The actual outcome is recorded as:

   - o: "home", "draw", or "away"

3. The RPS is calculated and then transformed into a final score:

   ```javascript
   finalScore = Math.round((1 - rps) * 100);
   ```

4. This results in a score between 0 and 100, where:
   - Higher scores indicate better predictions
   - A perfect prediction would score 100
   - A completely incorrect prediction would score 0

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
1. [*streamlined*] **ForestAI runs the Forest Provider Daemon for you**. You just need to expose your model's predictions via API to the Daemon. Here's a repo that has integrated in this way already: [link](https://github.com/score-technologies/predict-template). Then you just contact Forest team via [Discord](https://discord.gg/HWm96wKzWV) and provide them with a hostname and an API key. 
2. [*full integration*] **You run the Daemon yourself**. Take this repo and follow these [instructions](docs/become-a-provider.md). A little longer process but full ownership and control.

## 📊 Data for Your Machine Learning Model
We provide you with daily updated football stats that might be helpful for you when training your models. 
Links: 
 - R2 bucket with data: https://pub-188d55f1c4c34a02a7a2cb79159e1c2d.r2.dev/fixtures/manifest.csv
 - Data schema description: https://ball.forestai.io/join-earn/data-schema
