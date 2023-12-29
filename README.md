# SoulBound Token Project
This project provide the smart contract and backend to enable deploying and minting simple ERC721 SoulBound Tokens NFTs.

The proejct is built with soldiity smart contracts based on OpenZeppelin ERC721 implementation and NestJS for the backend.

## Smart Contract
The SBT contract is built using ERC721 OZ implementation with disabling transfer of tokens and enabling only burning by the SBT holder which is acheived by overriding the _update hook so that any transfer of assets from Zero Address (Mint) or transfer to Zero Address (Burn) is allowed. Otherwise, for wallet to wallet transfer the transaction will revert with NonTransferableToken error. 

The SoulBoundToken contract also supports Access Control with two roles, DEFAULT_ADMIN and MINTER. This was used to allow to role based approach so that there can be two wallets associated to using the contract one is the default admin and owner of the contract and one wallet only submitting the minting requests. Though, worth noting that when we handle that in the backend later we are using the same account wallet for both for simplicity. Yet, the constructor allows to specify two addresses one to act as the default admin and one as the minter.

For multiple instances deployment, the design was based on Factory contract to limit gas usage for deployment. The Factory contract uses CREATE2 so that the same address for the SBT contract can be guranteed in multiple chains. The Factory contract includes the deployContract function which require the parameter needed to create the SBT token contract in addition to the salt value. Upon successful deployment of the new SBT token contract instance and event is emitted with the owner address and the new contract address to help in the backend to get those values and use it for saving a record in the DB with the contract details.

For deplying the Factory contract, hardhat xdeployer plugin was used which allows also to have same Factory contract address across multiple chains. This can also help with backend since there will be a single Factory contract address to maintain even with multiple chains supported.

For the steps on how to deploy the Factory contract and running tests and scripts for testing deploying and minting SBTs check the [README file in hardhat folder] (./hardhat/README.md).

## SBT-API Backend
The backend system is built using NestJS is framework to build scalable backend applications using Node.js and Express as the core engine but built in typescript with lots of features for modualrity and wide support for different backend architectures with many built-in features to easily build REST API, GraphQL and websocker applications.

The SBT-API backend provides four endpoints, two for user registation and login and two for contract deployment and token minting. The backend app uses Prisma as ORM and Sqlite as database (for simple deployment locally and testing).

### Database
For simplicity, the app is using Sqlite since it can just store records in a file, however it is used with Prisma which allows easily to change that to use PostgreSQL. 

To prepare the database the migration scripts need to be applied

```
npx prisma migrate deploy
```

Two tables exist in the database schema, these two tables are for users and contracts with a one-to-many relationship. The user table holds user email, password (hashed), default createdat and updated fields and fields for the user custodial wallet generated and encrypted using AWS-KMS.

Possible alternative for users wallets is to utilize Smart Contract Accounts (SCA) instead of EOA with the use of Account Abstraction, such that each user will be provided with a SCA that gets created for each account to enable for example gas-sponsoring of minting transactions.

The contract table includes the contract address, the chain and network, in addition to name and symbol. The foriegn key of userId as well and the wallet address of the deployer/owner wallet. A unique combination key of chain, network, contractAddress is used.

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  createdAt DateTime   @default(now())
  updatedAt DateTime   @default(now()) @updatedAt
  password  String
  address   String     @unique
  key       String     @unique
  contracts Contract[]
}

model Contract {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @default(now()) @updatedAt
  name            String
  symbol          String
  chain           String
  network         String
  contractAddress String

  deployerAddress String
  userId          String
  User            User   @relation(fields: [userId], references: [id])

  @@unique([chain, network, contractAddress])
}
```

### User Authnetication
The backend app uses JWT tokens to authorize access to calling the contract deploy and mint tokens. This is done by exending NEstJS passport-jwt so that once a user logs in, the user is provided with a JWT token that need to be embedded in other calls as Bearer token.

The endpoints for deploy contract and mint token are protected with AuthGuard that will ensure a valid JWT and authorized access. The mint token also has another validation perfromed to ensure that when calling to mint a token that the call is made to a contract that is owned by the user. While this will still fail since the contract has the onlyMinter modifier for the mint functions but it is used as an early validation to submitting contract calls that is known to be reverting and enhance the user expereince.

### Backend endpoints

- `POST auth/register` , which is an endoint for users to register an account using an email and password. The endpoint generates an EOA for the user using AWS-KMS and encrypts the private key. The user record is created and returned stripped of the hashed password and encrypted private key
```
Response:

{
  "id": "string",
  "createdAt": "Date String ISO Format",
  "updatedAt": "Date String ISO Format",
  "email": "string",
  "address": "string"
}
```

- `POST auth/login` , this endpoint will accept the user name and password and use the auth guard to validate and upon success returns a JWT token. This token is now set to expire in one hour.
```
Response:

{
  "email": "string",
  "jwtToken": "string"
}
```

- `POST contract` , this endpoint is used to request deploying a new SBT token contract instance. The request body will include the contract name and symbol and the targeted chain and network. Currently, supporting Ethereum and Polygon, mainnets and testnets (Mumbai and Sepolia). Once a contract deployed, this endpoint will return the contract object.

```
Response:

{
  "id": "string",
  "createdAt": "Date String ISO Format",
  "updatedAt": "Date String ISO Format",
  "contractAddress": "string",
  "deployerAddress": "string",
  "userId": "string",
  "chain": "string",
  "network": "string",
  "name": "string",
  "symbol": "string"
}
```

- `POST contract/mint` , this endppoint will issue a call to the contract safeMint function to mint a new SBT token to the provided wallet address. Once successful this will return the transaction hash and block number

```
Response:

{
  "hash": "string",
  "block": "string",
  "address": "string"
}
```

## Docker section
The app is dockerized to enable running it as a container. The dockerfile icluded builds stages to enable building the docker image to target local development or build for production.

Also, included is a docker-compose file that will allow to build and run the app behind an nginx proxy.

To run the backend app as a docker container, be in the sbt-api folder and then run the docker-compose file, which will first build the docker image if not built and start two containers one for nginx, running at port 8080 and the other is the sbt-api NestJS app.

```
docker-compose up -d
```

## Swagger
The backend app uses Swagger so once the app is running, you can visit http://localhost:8080/api to test the different endpoints.