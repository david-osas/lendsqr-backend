# Wallet Service
This project contains code for a dummy wallet service. The wallet service functionalities are exposed through a REST API, and support basic actions like creating a wallet account, funding a wallet account, making a wallet transfer, withdrawing from a wallet, and get wallet balance. The application is built using NestJS, Typescript, MySQL, NodeJS, and the Yarn package manager.

## Documentation
You can use this link to access the postman collection documentation for this application: https://documenter.getpostman.com/view/10840074/2s83znogEi

## Deployed
You can use this link to access the deployed application: https://osarumense-lendsqr-be-test.herokuapp.com/ 

## Local Setup
### Prerequisites
To setup the application locally, you will need to have the following installed on your computer. Follow the hyperlinks listed below for installation guides.
- [NodeJS download](https://nodejs.org/en/download/)
- [Yarn installation](https://classic.yarnpkg.com/lang/en/docs/install/)
- [NestJS installation](https://docs.nestjs.com/#installation)
- [MySQL setup](https://www.javatpoint.com/how-to-install-mysql)
- [RabbitMQ download](https://www.rabbitmq.com/download.html)

### Getting The Source Files
After installing the prerequisites, make sure your MySQL and RabbitMQ services are running properly. You need to perform some steps to get the source code files up and running on your computer.
- Clone the GitHub repo into a folder of your choice
- Open your terminal and navigate to the project directory for the application
- Install the packages. Use the command listed below to get all application packages installed.
```
yarn install
```
- Run the database migration files.
```
yarn db:migrate
```
- Start the application in development mode.
```
yarn start:dev
```

## Wallet Actions
The current actions supported by the wallet service are:
- Creating of wallet accounts
- Funding of wallets
- Withdrawing from wallets
- Making fund transfers beteen wallets
- Getting wallet balance

### Outflows
All wallet actions are implemented to give the desired responses on request except wallet withdrawals and wallet fund transfers, such actions are called **Outflows**. 
Outflows are actions that require money to leave a wallet, due to various reasons. When outflows occur at the same time, that could cause race conditions, which could lead to errorneous outputs. An example is a user trying to withdraw 500 units, while making a wallet transfer of 400 units at the same time, with a real wallet balance of 500 units. Such a situation could get a successful processing if outflows are processed synchronously since both outflow amounts are not greater than the wallet balance. But logically, both operations cannot be allowed, as one would have to fail. To combat this situation, outflow actions are processed using a queue. When an outflow action is created it is added to an outflow queue for processing and the user is told theck their wallet balance after some time (in a full application the user would receive a notification of the final processing output). Each outflow request is then processed from the queue in a first come first serve, **FIFO**, manner. This technique helps prevent the errorneous example mentioned above, thus, making sure valid outflow actions are allowed to occur.
RabiitMQ is the service used for the processing of outflows in this application, although other message brokers can be used.

## Technologies Used
- TypeScript
- NestJS
- MySQL 8
- RabbitMQ (for processing of outflow requests)
- NodeJS
- Yarn

## Testing
The Jest package was used to implement unit tests for the application. To run tests execute 
```
yarn test
```
in project directory in your terminal
