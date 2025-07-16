# Protocol: Football Scores Prediction

## Description

This protocol enables providers to offer football match score prediction services. Providers can predict outcomes of upcoming football fixtures across various leagues, with predictions made at different time intervals before the match (`T7D`, `T36H`, `T12H`, `T1H`, `T1M`). The protocol supports `1X2` market predictions (Home Win/Draw/Away Win).

## Basic Info

| Name                      | Value                      |
| ------------------------- | -------------------------- |
| PT Smart Contract Address | `0x592483982A67336A742947fC06E36f6d54051AC9` |
| PT Registration Date      | `May-14-2025`   |
| PT Details File CID       | `bagaaieraq7ozqwbguml6at3qmwylzfvrlb2spn24qjqvamj4ytql5pfq6x2q` |
| PT Owner Wallet Address   | `0xA4434214Af80bF856b556053B831596Cf02939d5`  |
| PT Owner Details File CID | `bagaaieras7kbhy57nvnzpvkvgk34kad6tg24iox6sejlajfxagtqlspzbwza` |

## Supported Actions (Endpoints)

| Method-Path                    | Params/Body                                               | Response                                                   | Description                                                                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /details`                 | `body: string[]`                                          | `string[]`                                                 | Retrieves the contents of detail files for the given CIDs. If one CID is given and corresponding file is not found, returns 404/Not Found. Otherwise returns an array of contents of the files |
| `GET /resources`               | `params: { id?: number, pt?: Address }`                   | `Resource[] \| Resource`                                   | If `id` and `pt` is given, retrieves one resource information. Otherwise returns all resources of the requester                                                                                |
| `GET /predict-fixture-results` | `body: { id: number, pt: Address, challenges: string, providerId: Address }` | `{ body: string, code: "OK" \| "ERROR" }` | Predicts the results of upcoming football fixtures. `challenges` object must be a JSON string with a array of challenges to predict. The response body is also a JSON string with an array of predictions.                                                       |

### Challenge Object Structure

```json
[
  {
    "challengeId": "match_001",
    "homeTeam": "Arsenal",
    "awayTeam": "Chelsea",
    "league": "Premier League",
    "venue": "Emirates Stadium",
    "fixtureId": 12345,
    "kickoffTime": "2024-01-15T15:00:00Z",
    "challengePhaseMinutes": 90,
    "targetMarket": "1X2",
    "phaseIdentifier": "FT",
    "difficulty": 0.5
  }
]
```

### Response Body Object Structure

```json
[
  {
    "challengeId": "match_001",
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

## Configuration Parameters

This Protocol has the following configuration. Some of them are enforced by the logic of the on-chain smart contracts and the others are part of the Validator code hence enforced by the Validator consensus.

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

## Performance Requirements

The Validators are performing a number of tests on Resources to ensure quality across the board. Below is a list of checked Benchmarks:

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

### Scoring System Details

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

## Become a Provider in this Protocol

If you want to start providing services in this Protocol follow this tutorial: [link](docs/become-a-provider.md)
