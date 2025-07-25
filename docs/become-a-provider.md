# Become a Provider in this Protocol

If you want to start providing services in this Protocol, follow the steps below.

1. [Register in the Network](#1-register-in-the-network)
2. [Register in this Protocol](#2-register-in-this-protocol)
3. [Register Offers](#3-register-offers)
4. [Fork and Implement This Repository](#4-fork-and-implement-this-repository)
5. [Run the Provider Daemon](#5-run-the-provider-daemon)

### Step-by-step instructions

#### 0. Prerequisites

Install:
- Node.js (min version 22.12.0): [official](https://nodejs.org/en/download) or via (Optional) Node Version Manager: [link](https://github.com/nvm-sh/nvm)
- ForestAI CLI: [official](https://www.npmjs.com/package/@forest-protocols/cli)
- PostgreSQL (min version 16):
  * If you want to run Postgres natively: [official](https://www.postgresql.org/download/)
  * If you want to run Postgres dockerized: [PG Docker image](https://hub.docker.com/_/postgres)

#### 1. Register in the Network

> You can skip this part if you are already registered in the Network as a Provider.

1. Create a JSON detail file in the following schema and save it somewhere:

```json
{
  "name": "<Name, will be visible to users>",
  "description": "<[Optional] Description>",
  "homepage": "<[Optional] Homepage address>"
}
```

2. Create a set of pub / priv keys using an EVM-compatible wallet.
3. Take that account's private key and save it to a file.
4. Put the JSON file and that private key file into the same folder.
5. Open up a terminal in that folder.
   > If you are planning to use different accounts for billing and operating, you need to pass additional flags: `--billing <address>` and `--operator <address>`. This separation increases security of your configuration. Setting a billing address allows for having a separate address / identity for claiming your earnings and rewards while setting an operator allows you to delegate the operational work of running a daemon and servicing user requests to a third-party or a hotkey. If you don't need that, just skip those flags and the logic of the Protocol will use your main address as your billing and operator address.
6. Run the following command to register in the Protocol to be allowed to interact with Protocol's resources:
   ```sh
    forest register provider \
        --details <JSON file name> \
        --account <private key file>
   ```
   TESTNET NOTE: if you need testnet tokens reach out to the Forest Protocols team on [Discord](https://discord.gg/HWm96wKzWV).
7. Save your detail file somewhere. Later you'll place this file into `data/details` folder.

#### 2. Register in this Protocol

You can take part in many Protocols. In order to join this one run the following command:

```shell
forest provider register-in \
  --account <private key file path OR private key itself of the Provider account> \
  --protocol <Protocol Smart Contract Address> \
  --collateral <Minimum Collateral>
```

#### 3. Register Offers

Now that you are registered in the Network and this Protocol, the next step is to register your Offers.

First, create files that contain details for each Offer you plan to register.

##### 3.1 Creating the Offer details file

An example JSON file based Offer:

```json
{
    "name": "Football Fixtures Offer from <Provider Name>",
    "params": {
        "Number of Predictions": {
            "unit": "item",
            "value": 1500
        }
    }
}
```

> `-1` in `value` for unlimited allowance on number of predictions made each month.

##### 3.2 Saving the file

After creating the Offer details file, save it in an accessible location.

##### 3.3 Registering the Offer on-chain

Now register your Offer using the following command:

```shell
forest provider register-offer \
    --account <private key file path OR private key itself of the PROV account> \
    --protocol <Protocol Smart Contract Address> \
    --details <path of the details file> \
    --fee 1 \
    --stock 100
```

- `--fee`: The per-second price of the Offer in USDC. 1 unit of fee = 2.60 USDC per month.
- `--stock`: The maximum number of Agreements that can exist simultaneously for this Offer.

#### 4. Fork and Implement This Repository

Fork this repository, then clone it locally.

Open the `src/protocol/provider.ts` file and implement all of the following methods;

| Method                                                                                          | Description                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `create(agreement: Agreement, offer: DetailedOffer): Promise<*Details>`                         | This method is triggered when a user enters an Agreement. It provisions the actual resource based on the Agreement and Offer, returning resource details. If provisioning takes time, it returns a `Deploying` status. The daemon process then tracks the deployment using `getDetails` until the resource reaches `Running` status. |
| `getDetails(agreement: Agreement, offer: DetailedOffer, resource: Resource): Promise<*Details>` | Called periodically if the resource is not in `Running` status after `create()`. It retrieves current details about the resource from the actual source. The daemon process saves the returned details to the database after each call.                                                                                              |
| `delete(agreement: Agreement, offer: DetailedOffer, resource: Resource): Promise<void>`         | Called when a user closes an Agreement, ensuring the actual resource is deleted.                                                                                                                                                                                                                                                     |
| `predictFixtureResults(agreement: Agreement, resource: Resource, challenges: string): Promise<{ predictions: string; responseCode: PipeResponseCode }>`                                                                           | Predicts the results of upcoming football fixtures. `challenges` object must be a JSON string with an array of challenges to predict. The response is also a JSON string with an array of predictions. |

Once implementation is complete, place your Provider and Offer detail files into the `data/details` folder.

> You can create subdirectories to better organize detail files.

Now, create a `.env` file based on the example (`.env.example`) and configure the necessary variables.

As the last step, don't forget to put detail files of the Provider, Protocol and Offers into `data/details` folder.

#### 5. Run the Provider Daemon

You can run the daemon process with or without a container.

##### 5.1 Without a Container

> Ensure you have a running PostgreSQL database before proceeding.

Run the following commands in the daemon directory:

```sh
npm i
npm run build
npm run db:migrate
npm run start
```

##### 5.2 With a Container

If you prefer to use containers, build the container image and run it with Docker Compose. First, update the `DATABASE_URL` host to point to the database container:

```dotenv
...
# Update the host to "db"
# Database credentials are defined in "docker-compose.yaml";
# update the compose file if you change them.
DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres

# If using a local Foundry blockchain, update the RPC_HOST variable.
# RPC_HOST=172.17.0.1:8545
...
```

Now run the compose file:

```shell
docker compose up # Add "-d" to run in detached mode
```

That's all folks!
