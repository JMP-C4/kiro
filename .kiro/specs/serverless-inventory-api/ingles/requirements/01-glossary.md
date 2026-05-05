# Glossary

| Term | Definition |
|------|-----------|
| **API** | REST application programming interface exposed via API Gateway. |
| **Lambda** | AWS Lambda function in Node.js 20.x that executes business logic. |
| **Product** | Entity representing an inventory item with name, category, price, and stock. |
| **Customer** | Entity representing a registered buyer in the system. |
| **Charge** | Payment transaction associated with one or more products purchased by a customer. |
| **Credit** | Balance in favor granted to a customer, applicable to future charges. |
| **Category** | Thematic classification to which a product belongs. |
| **Stock** | Available quantity of a product in inventory. |
| **Validator** | Component responsible for validating the structure and values of input data. |
| **Repository** | Component responsible for persistence and retrieval of domain entities. |
| **Health_Checker** | Component responsible for verifying the operational status of the system. |
| **Stats_Engine** | Component responsible for calculating inventory metrics and statistics. |
| **POS** | Point of Sale. Module that integrates inventory with the billing system to manage in-person sales at the register. |
| **Cash_Session** | Period of operation of a cash register, delimited by an opening with an initial amount and a closing with a final amount. |
| **Ticket** | Digital document generated upon completing a POS sale, summarizing products, amounts, payment method, and session data. |
| **Payment_Method** | How the customer settles a sale; can be cash, card, or customer credit. |
| **POS_Manager** | Component responsible for managing cash sessions, sales, and ticket generation in the POS module. |
