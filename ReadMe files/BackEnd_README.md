\# Smart Multi-Canteen Pre-Order Management System for SLIIT Kandy Uni



\## Project Overview

This system is designed to reduce long queues in SLIIT canteens by allowing users to pre-order food from multiple canteens before break time or whatever user needs. The platform supports three main roles: Users, Owners, and Admins. Users can browse menus, place orders, make payments, and submit feedback. Owners can manage canteens, food items, orders, and promotions. Admins can monitor the overall system and manage platform-level activities.



*## User Roles*



*### 1. User*

*Students and lecturers who use the system to:*

*- view canteens*

*- browse food items*

*- place pre-orders*

*- make payments*

*- submit feedback*

*- view promotions*



*### 2. Owner*

*Canteen owners or staff who use the system to:*

*- manage canteen details*

*- manage food items*

*- process orders*

*- review feedback*

*- create promotions*



*### 3. Admin*

*System administrator who can:*

*- monitor all canteens*

*- manage users and owners*

*- view reports*

*- monitor payments and activities*



\---



**# Core Functional Modules**



\## **1. Canteen Management**



\### Description

Handles creation and management of canteen details in the system.



\### Main Functions

\- add new canteen

\- view all canteens

\- view single canteen details

\- update canteen information

\- delete canteen

\- upload canteen image or logo



\### CRUD Operations

\- \*\*Create\*\*: Add new canteen

\- \*\*Read\*\*: View all canteens / view one canteen

\- \*\*Update\*\*: Edit canteen name, location, opening hours, image

\- \*\*Delete\*\*: Remove canteen



\### Example Data

\- canteen name

\- location

\- contact details

\- owner details

\- opening and closing times

\- canteen image



\---



\## **2. Food Item Management**



\### Description

Handles management of food items available in each canteen.



\### Main Functions

\- add food items

\- view food items

\- update food item details

\- delete food items

\- manage price

\- manage quantity

\- manage availability

\- upload food item images



\### CRUD Operations

\- \*\*Create\*\*: Add new food item

\- \*\*Read\*\*: View all food items / view one food item

\- \*\*Update\*\*: Edit name, price, image, quantity, description

\- \*\*Delete\*\*: Remove food item



\### Example Data

\- food item name

\- category

\- price

\- available quantity

\- description

\- food image

\- canteen ID



\---



\## **3. Order Management**



\### Description

Handles pre-ordering and order processing workflow.



\### Main Functions

\- browse food items by canteen

\- add items to cart

\- place pre-order

\- view order details

\- view order history

\- update order status

\- cancel order

\- manage pickup process

\- optional special request upload



\### CRUD Operations

\- \*\*Create\*\*: Place new order

\- \*\*Read\*\*: View all orders / user orders / single order

\- \*\*Update\*\*: Update order status, pickup status, special notes

\- \*\*Delete\*\*: Cancel or remove order



\### Order Status Examples

\- pending

\- confirmed

\- preparing

\- ready

\- completed

\- cancelled



\### Example Data

\- user ID

\- canteen ID

\- ordered items

\- total price

\- pickup time

\- status

\- special notes

\- request image (optional)



\---



\## **4. Payment Management**



\### Description

Handles payment processing and transaction tracking.



\### Main Functions

\- make payment

\- view payment details

\- confirm payment

\- update payment status

\- upload payment proof

\- view payment history

\- monitor transactions



\### CRUD Operations

\- \*\*Create\*\*: Add new payment record

\- \*\*Read\*\*: View all payments / user payments / one payment

\- \*\*Update\*\*: Update payment status or proof

\- \*\*Delete\*\*: Remove invalid payment record if needed



\### Payment Status Examples

\- pending

\- paid

\- failed

\- refunded



\### Example Data

\- order ID

\- payment method

\- amount

\- payment date

\- payment status

\- transaction reference

\- payment proof image



\---



\## **5. Feedback Management**



\### Description

Handles ratings, feedback, and complaints submitted by users.



\### Main Functions

\- submit feedback

\- submit rating

\- submit complaint

\- upload complaint image

\- view feedback

\- update feedback status

\- reply to complaint

\- resolve complaints



\### CRUD Operations

\- \*\*Create\*\*: Add new feedback or complaint

\- \*\*Read\*\*: View all feedback / one feedback / canteen feedback

\- \*\*Update\*\*: Update complaint status, owner/admin response

\- \*\*Delete\*\*: Remove feedback if needed



\### Example Data

\- user ID

\- canteen ID

\- order ID

\- rating

\- feedback message

\- complaint type

\- complaint image

\- response

\- status



\---



\## **6. Promotions \& Discounts Management**



\### Description

Handles promotional offers, discounts, and advertising content for canteens and food items.



\### Main Functions

\- create promotions

\- create discounts

\- create meal deals

\- assign promotion to food item or canteen

\- set start and end dates

\- activate or deactivate promotion

\- upload promotion banners or posters

\- view promotions



\### CRUD Operations

\- \*\*Create\*\*: Add new promotion or discount

\- \*\*Read\*\*: View all promotions / one promotion

\- \*\*Update\*\*: Edit title, discount, dates, image, target item

\- \*\*Delete\*\*: Remove promotion



\### Example Data

\- promotion title

\- description

\- banner image

\- discount percentage

\- start date

\- end date

\- target canteen or food item

\- active status



\---



\# Shared Features



\## Authentication and Authorization

The system should support:

\- user registration

\- user login

\- owner login

\- admin login

\- role-based access control

\- password encryption

\- secure authentication



\## File Upload Support

File upload is integrated into all modules:

\- canteen image upload

\- food image upload

\- order-related upload

\- payment proof upload

\- complaint image upload

\- promotion banner upload



\## Search and Filter Features

The system can include:

\- search canteens

\- search food items

\- filter by canteen

\- filter by category

\- filter orders by status

\- filter promotions by date or active state



\---



\# Suggested MongoDB Collections



\- users

\- canteens

\- foodItems

\- orders

\- payments

\- feedbacks

\- promotions



\---



\# Suggested Backend Folder Structure



```bash

server/

&#x20;├── config/

&#x20;├── controllers/

&#x20;├── models/

&#x20;├── routes/

&#x20;├── middleware/

&#x20;├── uploads/

&#x20;├── .env

&#x20;├── server.js

&#x20;└── package.json

