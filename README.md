# Q - DoWell Platform

## API Documentation

API documentation for the Q -> DoWell platform, designed for efficient queue management in restaurants.

**Health Check URL:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

### Endpoints

- **Kitchen Sink Services:** [kitchen-sink](http://127.0.0.1:8000/api/v1/kitchen-sink/)
- **User Services:** [user-services](http://127.0.0.1:8000/api/v1/user-services/)
- **Store Services:** [store-services](http://127.0.0.1:8000/api/v1/store-services/)
- **QRCode Services:** [qrcode-services](http://127.0.0.1:8000/api/v1/qrcode-services/)

## Kitchen Sink Services
The Kitchen Sink Services provide various functionalities related to the management of metadata and data databases.

### Endpoints

- **Check Meta Database Status:** 
  ```bash
  curl -X GET \
    'http://127.0.0.1:8000/api/v1/kitchen-sink/?type=check_metedata_database_status&workspace_id=6385c0f18eca0fb652c94558' \
    -H 'Authorization: Bearer <your-token>'
  ```
  
- **Check Data Database Status:** 
  ```bash
  curl -X GET \
    'http://127.0.0.1:8000/api/v1/kitchen-sink/?type=check_data_database_status&workspace_id=6385c0f18eca0fb652c94558' \
    -H 'Authorization: Bearer <your-token>'
  ```

- **Create Collection:** 
  ```bash
  curl -X POST \
    'http://127.0.0.1:8000/api/v1/kitchen-sink/?type=create_collection' \
    -H 'Authorization: Bearer <your-token>' \
    -H 'Content-Type: application/json' \
    -d '{
        "workspace_id":"6385c0f18eca0fb652c94558",
        "database_type": "META DATA"
    }'
  ```

## User Services

The User Services provide functionalities for managing user details.

### Endpoints

- **Retrieve User Details:** 
  ```bash
  curl -X GET \
    'http://127.0.0.1:8000/api/v1/user-services/?type=retrive_user_details&workspace_id=6385c0f18eca0fb652c94558' \
    -H 'Authorization: Bearer <your-token>'
  ```

- **Save User Details:** 
  ```bash
  curl -X POST \
    'http://127.0.0.1:8000/api/v1/user-services/?type=save_user_details' \
    -H 'Authorization: Bearer <your-token>' \
    -H 'Content-Type: application/json' \
    -d '{
        "name": "Manish Dash Sharma",
        "email": "manish@dowellresearch.in",
        "bank_details": {},
        "username": "Manish",
        "workspace_id":"6385c0f18eca0fb652c94558",
        "timezone":"Asia/Calcutta"
    }'
  ```

- **Update User Details:** 
  ```bash
  curl -X POST \
    'http://127.0.0.1:8000/api/v1/user-services/?type=update_user_details' \
    -H 'Authorization: Bearer <your-token>' \
    -H 'Content-Type: application/json' \
    -d '{
        "document_id":"65ddfeededf64420092f29f6",
        "update_data": {
            "address":"India"
        },
        "workspace_id":"6385c0f18eca0fb652c94558",
        "timezone":"Asia/Calcutta"
    }'
  ```

## Store Services

The Store Services provide functionalities for managing store data.

### Endpoints

- **Create Store:** 
  ```bash
  curl -X POST \
    'http://127.0.0.1:8000/api/v1/store-services/?type=create_store' \
    -H 'Authorization: Bearer <your-token>' \
    -H 'Content-Type: application/json' \
    -d '{
        "store_id": "65ddfeea932969c6c483bb4b",
        "workspace_id":"6385c0f18eca0fb652c94558",
        "user_id":"65ddfeededf64420092f29f6",
        "timezone":"Asia/Calcutta"
    }'
  ```

- **Retrieve Store Data:** 
  ```bash


  curl -X GET \
    'http://127.0.0.1:8000/api/v1/store-services/?type=retrive_store_details&workspace_id=6385c0f18eca0fb652c94558&limit=5&offset=0' \
    -H 'Authorization: Bearer <your-token>'
  ```

- **Update Store Data:** 
  ```bash
  curl -X POST \
    'http://127.0.0.1:8000/api/v1/store-services/?type=update_store_data&workspace_id=6385c0f18eca0fb652c94558&store_id=65ddfeea932969c6c483bb4b' \
    -H 'Authorization: Bearer <your-token>' \
    -H 'Content-Type: application/json' \
    -d '{
        "update_data": {
            "image_link":"https://github.com/manishdashsharma"
        },
        "timezone":"Asia/Calcutta"
    }'
  ```

## QRCode Services

The QRCode Services provide functionalities for creating and retrieving QR codes.

### Endpoints

- **Create QRcode:** 
  ```bash
  curl -X POST \
    'http://127.0.0.1:8000/api/v1/qrcode-services/?type=create_qrcode&workspace_id=6385c0f18eca0fb652c94558&user_id=65ddfeededf64420092f29f6&seat_number=1' \
    -H 'Authorization: Bearer <your-token>' \
    -H 'Content-Type: application/json' \
    -d '{
        "link":"https://xvr8nq-5173.csb.app/",
        "timezone":"Asia/Calcutta",
        "username":"Manish"
    }'
  ```

- **Retrieve QRCode Records:** 
  ```bash
  curl -X GET \
    'http://127.0.0.1:8000/api/v1/qrcode-services/?type=retrieve_qrcoderecode_details&workspace_id=6385c0f18eca0fb652c94558&user_id=65ddfeededf64420092f29f6&limit=5&offset=0' \
    -H 'Authorization: Bearer <your-token>'

An overview of the Q -> DoWell platform and detailed API documentation for each endpoint with sample CURL commands.
