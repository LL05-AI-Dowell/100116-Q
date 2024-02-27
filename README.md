# Q - DoWell Product to manage Local shop

# API Documentation

## Table of Contents

1. [Health Check](#health-check)
2. [Kitchen Sink Services](#kitchen-sink-services)
    - [Check Database Status](#check-database-status)
3. [User Services](#user-services)
    - [Retrieve User Details](#retrieve-user-details)
    - [Save User Details](#save-user-details)
    - [Update User Details](#update-user-details)
4. [Store Services](#store-services)
    - [Create Store](#create-store)
    - [Retrieve Store Data](#retrieve-store-data)
    - [Update Store Data](#update-store-data)
5. [QRCode Services](#qrcode-services)
    - [Create QRcode](#create-qrcode)
    - [Retrieve QRCode Records](#retrieve-qrcode-records)

## Health Check
[![Health Check](http://img.shields.io/badge/Health_Check-Click_Here-blue.svg)](http://127.0.0.1:8000/)

## Kitchen Sink Services

### Check Database Status
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/kitchen-sink/?type=check_database_status&workspace_id=6385c0f18eca0fb652c94558" \
     -H "Authorization: Bearer ************"
```

## User Services

### Retrieve User Details
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/user-services/?type=retrive_user_details&workspace_id=6385c0f18eca0fb652c94558" \
     -H "Authorization: Bearer ************"
```

### Save User Details
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/user-services/?type=save_user_details" \
     -H "Authorization: Bearer ************" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Manish Dash Sharma",
           "email": "manish@dowellresearch.in",
           "bank_details": {},
           "username": "Manish",
           "workspace_id": "6385c0f18eca0fb652c94558",
           "timezone": "Asia/Calcutta"
         }'
```

### Update User Details
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/user-services/?type=update_user_details" \
     -H "Authorization: Bearer ************" \
     -H "Content-Type: application/json" \
     -d '{
           "document_id": "65ddfeededf64420092f29f6",
           "update_data": {
               "address": "India"
           },
           "workspace_id": "6385c0f18eca0fb652c94558",
           "timezone": "Asia/Calcutta"
        }'
```

## Store Services

### Create Store
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/store-services/?type=create_store" \
     -H "Authorization: Bearer ************" \
     -H "Content-Type: application/json" \
     -d '{
           "store_id": "65ddfeea932969c6c483bb4b",
           "workspace_id": "6385c0f18eca0fb652c94558",
           "user_id": "65ddfeededf64420092f29f6",
           "timezone": "Asia/Calcutta"
         }'
```

### Retrieve Store Data
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/store-services/?type=retrive_store_details&workspace_id=6385c0f18eca0fb652c94558&limit=5&offset=0" \
     -H "Authorization: Bearer ************"
```

### Update Store Data
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/store-services/?type=update_store_data&workspace_id=6385c0f18eca0fb652c94558&store_id=65ddfeea932969c6c483bb4b" \
     -H "Authorization: Bearer ************" \
     -H "Content-Type: application/json" \
     -d '{
           "update_data": {
               "image_link": "https://github.com/manishdashsharma"
           },
           "timezone": "Asia/Calcutta"
         }'
```

## QRCode Services

### Create QRcode
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/qrcode-services/?type=create_qrcode&workspace_id=6385c0f18eca0fb652c94558&user_id=65ddfeededf64420092f29f6&seat_number=1" \
     -H "Authorization: Bearer ************" \
     -H "Content-Type: application/json" \
     -d '{
           "link": "https://xvr8nq-5173.csb.app/",
           "timezone": "Asia/Calcutta",
           "username": "Manish"
         }'
```



### Retrieve QRCode Records
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/qrcode-services/?type=retrieve_qrcoderecode_details&workspace_id=6385c0f18eca0fb652c94558&user_id=65ddfeededf64420092f29f6&limit=5&offset=0" \
     -H "Authorization: Bearer ************"
```

---

Replace `************` with your actual Bearer token.

