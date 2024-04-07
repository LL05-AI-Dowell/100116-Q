from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .serializers import *
from .utils.helper import *
from .utils.datacube_helper import * 
from .utils.authorization import *
from .utils.linkshortener_helper import *
import jwt

@method_decorator(csrf_exempt, name='dispatch')
class health_check(APIView):
    def get(self, request ):
        
        return Response("if your are seeing this then , server is !down",status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class kitchen_sink_services(APIView):
    def post(self, request):
        type_request = request.GET.get('type')

        if type_request == "create_collection":
            return self.create_collection(request)
        else:
            return self.handle_error(request)
        
    def get(self, request): 
        type_request = request.GET.get('type')

        if type_request == "check_metedata_database_status":
            return self.check_metedata_database_status(request)
        elif type_request == "check_data_database_status":
            return self.check_data_database_status(request)
        else: 
            return self.handle_error(request)
    
    def create_collection(self,request):
        
        database_type = request.data.get('database_type')
        workspace_id = request.data.get('workspace_id')
        collection_name = request.data.get('collection_name')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = CreateCollectionSerializer(data= request.data)

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        if database_type == 'META DATA':
            database = f'{workspace_id}_meta_data_q' 
        if database_type == 'DATA':
            database = f'{workspace_id}_data_q'   

        response = json.loads(datacube_create_collection(
            api_key,
            database,
            collection_name
        ))

        if not response["success"]:
            return CustomResponse(False, "Falied to create collection, kindly contact the administrator.",response, status.HTTP_400_BAD_REQUEST)

        return CustomResponse(True,"Collection has been created successfully", None, status.HTTP_200_OK)

    def check_metedata_database_status(self, request):
        
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
            
        workspace_id = request.GET.get('workspace_id')
        meta_data_database = f'{workspace_id}_meta_data_q'

        response_meta_data = json.loads(datacube_collection_retrieval(api_key, meta_data_database))
        print(response_meta_data)

        if not response_meta_data["success"]:
            return CustomResponse(False,"Meta Data is not yet available, kindly contact the administrator.", None, status.HTTP_501_NOT_IMPLEMENTED )

        list_of_meta_data_collection = [
            f'{workspace_id}_user_details',
            f'{workspace_id}_qrcode_record',
            f'{workspace_id}_store_details',
            f'{workspace_id}_menu_card',
        ]

        missing_collections = []
        for collection in list_of_meta_data_collection:
            if collection not in response_meta_data["data"][0]:
                missing_collections.append(collection)

        if missing_collections:
            missing_collections_str = ', '.join(missing_collections)
            return CustomResponse(False, f"The following collections are missing: {missing_collections_str}", missing_collections, status.HTTP_404_NOT_FOUND)

        return CustomResponse(True,"Meta Data are available to be used", None, status.HTTP_200_OK )
    
    def check_data_database_status(self, request):
        
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
            
        workspace_id = request.GET.get('workspace_id')
        date = request.GET.get('date')

        data_database = f'{workspace_id}_data_q'

        response_data = json.loads(datacube_collection_retrieval(api_key, data_database))

        print(response_data)
        if not response_data["success"]:
            return CustomResponse(False,"Database is not yet available, kindly contact the administrator", None, status.HTTP_501_NOT_IMPLEMENTED )

        list_of_data_collection = [f'{workspace_id}_{date}_q']

        missing_collections = []
        for collection in list_of_data_collection:
            if collection not in response_data["data"][0]:
                missing_collections.append(collection)

        if missing_collections:
            missing_collections_str = ', '.join(missing_collections)
            return CustomResponse(False, f"The following collections are missing: {missing_collections_str}", missing_collections, status.HTTP_404_NOT_FOUND)

        return CustomResponse(True,"Databases are available to be used", None, status.HTTP_200_OK )
        
    def handle_error(self, request): 
       
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class user_details_services(APIView):
    
    def post(self, request):
        type_request = request.GET.get('type')

        if type_request == "save_user_details":
            return self.save_user_details(request)
        elif type_request == "update_user_details":
            return self.update_user_details(request)
        elif type_request == "user_auth":
            return self.user_auth(request)
        else:
            return self.handle_error(request)
        
    def get(self, request): 
        type_request = request.GET.get('type')

        if type_request == "retrieve_user_details":
            return self.retrieve_user_details(request)
        if type_request == "retrieve_user":
            return self.retrieve_user(request)
        else: 
            return self.handle_error(request)

    def save_user_details(self, request):
        
        name = request.data.get('name')
        email = request.data.get('email')  
        username = request.data.get('username')
        workspace_id = request.data.get('workspace_id')
        timezone = request.data.get('timezone')
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = UserDetailsSerializer(data=request.data)

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        user_data = {
            "store_ids":[generate_store_id(), generate_store_id()],
            "name": name,
            "email":email,
            "bank_details":{},
            "username":username,
            "workspace_id":workspace_id,
            "default_store_type": "ONLINE",
            "ticket_link":"",
            "product_name":"",
            "is_paid": False,
            "is_active": True,
            "address":"",
            "updated_at":"",
            "created_at": dowell_time(timezone)["current_time"],
            "records": [{"record": "1", "type": "overall"}]
        }

        response = json.loads(datacube_data_insertion(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_user_details',
            user_data,
        ))

        if not response["success"]:
            return CustomResponse(True,"Failed to save user details", None, status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True, "User details saved successfully",user_data, status.HTTP_201_CREATED)

    def retrieve_user_details(self, request):
        
        workspace_id = request.GET.get('workspace_id')
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        response = json.loads(datacube_data_retrieval(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_user_details',
            {
                "workspace_id":workspace_id
            },
            1,
            0,
            False
        ))

        if not response.get("data"):
            return CustomResponse(False,"User details not found", None,status.HTTP_404_NOT_FOUND)
        
        return CustomResponse(True,"User details retrieved successfully",response["data"], status.HTTP_302_FOUND)
    
    def update_user_details(self, request):
        
        document_id = request.data.get('document_id')
        update_data = request.data.get('update_data')
        workspace_id = request.data.get('workspace_id')
        timezone = request.data.get('timezone')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
    
        serializer = UpdateUserDetailsSerializer(data=request.data)
        if not serializer.is_valid():
            return CustomResponse(False,"Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        update_data["updated_at"] = dowell_time(timezone)["current_time"]
        
        response = json.loads(datacube_data_update(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_user_details',
            {
                "_id": document_id,
            },
            update_data
        ))

        if not response["success"] :
            return CustomResponse(False, "Failed to update user details", None, status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True,"User details updated successfully",None,status.HTTP_200_OK)
    
    def user_auth(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        if username and password is None:
            return CustomResponse(False, "Provide username or password", None, status.HTTP_401_UNAUTHORIZED)
        
        response = json.loads(user_login(username, password))

        if not response.get('success'):
            return CustomResponse(False, "User login failed", None, status.HTTP_401_UNAUTHORIZED)
        
        return CustomResponse(True,"User logged in successfully",None,status.HTTP_200_OK)
    
    def retrieve_user(self, request):
        
        workspace_id = request.GET.get('workspace_id')
        
        response = json.loads(datacube_data_retrieval(
            "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_user_details',
            {
                "workspace_id":workspace_id
            },
            1,
            0,
            False
        ))

        if not response.get("data"):
            return CustomResponse(False,"User details not found", None,status.HTTP_404_NOT_FOUND)
        
        return CustomResponse(True,"User details retrieved successfully",response["data"], status.HTTP_302_FOUND)
@method_decorator(csrf_exempt, name='dispatch')
class store_services(APIView):
    
    def post(self, request):
        type_request = request.GET.get('type')

        if type_request == "create_store":
            return self.create_store(request)
        if type_request == "create_menu":
            return self.create_menu(request)
        elif type_request == "update_store_data":
            return self.update_store_data(request)
        else:
            return self.handle_error(request)
        
    def get(self, request): 
        type_request = request.GET.get('type')

        if type_request == "retrieve_store_details":
            return self.retrieve_store_details(request)
        elif type_request == "retrieve_menu_details":
            return self.retrieve_menu_details(request)
        else: 
            return self.handle_error(request)
        
    def create_store(self,request):
        
        store_ids = request.data.get("store_id")
        workspace_id = request.data.get("workspace_id")
        timezone = request.data.get('timezone')
        user_id = request.data.get('user_id')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)

        if not isinstance(store_ids, list) or len(store_ids) != 2:
            return CustomResponse(False, "Invalid store IDs provided", None, status.HTTP_400_BAD_REQUEST)

        stores_data = [
            generate_store_data(store_ids[0], workspace_id, user_id, timezone, "OFFLINE"),
            generate_store_data(store_ids[1], workspace_id, user_id, timezone, "ONLINE")
        ]

        for store_data in stores_data:
            response = json.loads(datacube_data_insertion(
                api_key,
                f'{workspace_id}_meta_data_q',
                f'{workspace_id}_store_details',
                store_data
            ))
            
            if not response["success"]:
                return CustomResponse(False, f"Failed to create {store_data['store_type']} store", None, status.HTTP_400_BAD_REQUEST)

        return CustomResponse(True, "Stores created successfully", stores_data, status.HTTP_201_CREATED)

    def retrieve_store_details(self, request):
        
        workspace_id = request.GET.get('workspace_id')
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')
        store_type = request.GET.get('store_type', None)
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = RetrieveStoreSerializer(data=request.GET)
        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        response= json.loads(datacube_data_retrieval(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_store_details',
            {
                "workspace_id": workspace_id,
            },
            limit,
            offset,
            False
        ))

        if not response["success"]:
            return CustomResponse(False,"Failed to retrieve store details", None, status.HTTP_404_NOT_FOUND)
        
        data = response.get("data",[])
        
        if store_type is not None:
            store = [store for store in data if store.get('store_type') == store_type]
            return CustomResponse(True,f"Store details for {store_type}", store, status.HTTP_200_OK)
        
        return CustomResponse(True, "Store details retrieved successfully", data, status.HTTP_200_OK)
        
    def update_store_data(self, request):
        
        store_id = request.GET.get('store_id')
        user_id = request.GET.get('user_id')
        update_data = request.data.get('update_data')
        workspace_id = request.GET.get('workspace_id')
        timezone = request.data.get('timezone')
        store_type = request.data.get('store_type')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)

        serializer = UpdateStoreDataSerializer(data={"store_id": store_id,"update_data": update_data,"workspace_id":workspace_id,"timezone":timezone,'user_id':user_id,"store_type":store_type})
        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        update_data["updated_at"] = dowell_time(timezone)["current_time"]

        response = json.loads(datacube_data_update(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_store_details',
            {
                # "id": store_id, # UNCOMMENT WHEN DATACUBE SOLVE THE ISSUE
                "store_type": store_type,
                "user_id": user_id
            },
            update_data
            
        ))
        if not response["success"]:
            return CustomResponse(False,"Failed to update Store data",None,status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True, "Store data updated successfully", None, status.HTTP_200_OK)

    def create_menu(self , request):
        
        workspace_id = request.GET.get('workspace_id')
        store_id = request.GET.get('store_id')
        menu_data = request.data.get('menu_data')
        timezone = request.data.get('timezone')
        user_id = request.GET.get('user_id')
        store_type = request.data.get('store_type')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = CreateMenuSerializer(data={"store_id": store_id,"menu_data": menu_data,"workspace_id":workspace_id,"timezone":timezone,"user_id":user_id,"store_type":store_type})

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        menu_data_insert = {
            "workspace_id":workspace_id,
            "store_id":store_id,
            "user_id":user_id,
            "store_type":store_type,
            "created_at": dowell_time(timezone)["current_time"],                                          
            "updated_at":"",
            "menu_data": menu_data,
            "records": [{"record": "1", "type": "overall"}]
        }
        
        response = json.loads(datacube_data_insertion(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_menu_card',
            menu_data_insert
            )
        )

        if not response["success"]:
            return CustomResponse(False,"Failed to create a menu",None,status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True,"Menu Created Successfully", None,status.HTTP_201_CREATED)

    def retrieve_menu_details(self, request):
        
        workspace_id = request.GET.get("workspace_id")
        store_id = request.GET.get("store_id", None)
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')
        store_type = request.GET.get('store_type', None)
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        print(store_type)
        if store_id is None and store_type is None:
            print("here 1")
            data_to_query = {
                "workspace_id": workspace_id
            }
        elif store_id is not None and store_type is None:
            print("here 2")
            data_to_query = {
                "workspace_id": workspace_id,
                "store_id": store_id
            }
        elif store_id is not None and store_type is not None:
            print("here 3")
            data_to_query = {
                "workspace_id": workspace_id,
                "store_id": store_id,
                "store_type": store_type
            }
        elif store_id is None and store_type is not None:
            print("here 4")
            data_to_query = {
                "workspace_id": workspace_id,
                "store_type": store_type
            }


        response = json.loads(datacube_data_retrieval(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_menu_card',
            data_to_query,
            limit,
            offset,
            False
        ))

        if not response["success"]:
            return CustomResponse(False,"Failed to retrieve menu details", None, status.HTTP_404_NOT_FOUND)
        
        return CustomResponse(True,"Menu retrived succefully", response["data"],status.HTTP_200_OK)
    
    def handle_error(self, request): 
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class qrcode_services(APIView):
    
    def post(self, request):
        type_request = request.GET.get('type')

        if type_request == "create_qrcode":
            return self.create_qrcode(request)
        elif type_request == "create_master_qrcode":
            return self.create_master_qrcode(request)
        else:
            return self.handle_error(request)
        
    def get(self, request): 
        type_request = request.GET.get('type')

        if type_request == "retrieve_qrcoderecode_details":
            return self.retrieve_qrcoderecode_details(request)
        elif type_request == "retrieve_seat_details":
            return self.retrieve_seat_details(request)
        elif type_request == "activate_seat":
            return self.activate_seat(request)
        elif type_request == "get_master_qrcode_record":
            return self.get_master_qrcode_record(request)
        else: 
            return self.handle_error(request)
        
    def create_qrcode(self,request):
        
        workspace_id = request.GET.get("workspace_id")
        user_id = request.GET.get("user_id")
        store_id = request.GET.get('store_id')
        link = request.data.get("link")
        timezone = request.data.get('timezone')
        username = request.data.get('username')
        seat_number = request.GET.get('seat_number') 
        store_type = request.data.get('store_type') 

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = CreateQrCodeSerializer(
            data={
                "workspace_id": workspace_id,
                "user_id": user_id,
                "timezone": timezone,
                "link": link,
                "username":username,
                "seat_number":seat_number,
                "store_id":store_id,
                "store_type":store_type
            })

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        generated_link = f'{link}&type={store_type}&workspace_id={workspace_id}&store_id={store_id}&seat_number={seat_number}'
        
        qrcode = json.loads(generate_qrcode(
            workspace_id, 
            user_id,
            generated_link,
            f'Qrcode_seat_{seat_number}'
        ))

        generate_qrcode_data = qrcode.get('qrcode',[])
        

        if not generate_qrcode_data:
            return CustomResponse(False, "Failed to update the create qrcode in qrcode server", None, status.HTTP_400_BAD_REQUEST)

        update_qr_code_data = json.loads(update_qr_code(
            generate_qrcode_data["qrcode_id"],
            generated_link,
            f'Qrcode_seat_{seat_number}',
            workspace_id,
            store_id,
            f'seat_number_{seat_number}',
        ))

        generate_updated_qr_code_data = update_qr_code_data.get('response',[])
        # print(generate_updated_qr_code_data)

        if not generate_updated_qr_code_data:
            return CustomResponse(False, "Failed to update the links in qrcode server", None, status.HTTP_400_BAD_REQUEST)

        
        qrcode_data = {
            "qrcode_name": f'Qrcode_seat_{seat_number}',
            "qrcode_id": generate_qrcode_data["qrcode_id"],
            "is_active": False,
            "store_id": store_id,
            "shorthand_url":generate_updated_qr_code_data["link"],
            "qrcode_image_url": generate_updated_qr_code_data["qrcode_image_url"],
            "workspace_id": workspace_id,
            "user_id":user_id,
            "store_type": store_type,
            "seat_number":f'seat_number_{seat_number}',
            "created_at": dowell_time(timezone)["current_time"],
            "updated_at":"",
            "records": [{"record": "1", "type": "overall"}]
        }
        response = json.loads(datacube_data_insertion(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_qrcode_record',
            qrcode_data
        ))
        if not response["success"]:
            return CustomResponse(False,"Failed to create save qrcode data",None,status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True,"Qrcode created successfully",qrcode_data,status.HTTP_201_CREATED)

    def create_master_qrcode(self, request):

        workspace_id = request.GET.get("workspace_id")
        user_id = request.GET.get("user_id")
        store_id = request.GET.get('store_id')
        link = request.data.get("link")
        timezone = request.data.get('timezone')
        username = request.data.get('username')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = CreateMasterQrCodeSerializer(
            data={
                "workspace_id": workspace_id,
                "user_id": user_id,
                "timezone": timezone,
                "link": link,
                "username":username,
                "store_id":store_id
            })

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        generated_link = f'{link}&workspace_id={workspace_id}&store_id={store_id}'
        
        qrcode = json.loads(generate_qrcode(
            workspace_id, 
            user_id,
            generated_link,
            f'{workspace_id}_master_qrcode'
        ))

        generate_qrcode_data = qrcode.get('qrcode',[])
        

        if not generate_qrcode_data:
            return CustomResponse(False, "Failed to update the create qrcode in qrcode server", None, status.HTTP_400_BAD_REQUEST)

        update_qr_code_data = json.loads(update_qr_code(
            generate_qrcode_data["qrcode_id"],
            generated_link,
            f'{workspace_id}_master_qrcode',
            workspace_id,
            username,
            f'{workspace_id}_master_qrcode',
        ))

        generate_updated_qr_code_data = update_qr_code_data.get('response',[])
        print(generate_updated_qr_code_data)

        if not generate_updated_qr_code_data:
            return CustomResponse(False, "Failed to update the links in qrcode server", None, status.HTTP_400_BAD_REQUEST)

        
        qrcode_data = {
            "qrcode_name": f'{workspace_id}_master_qrcode',
            "qrcode_id": generate_qrcode_data["qrcode_id"],
            "is_active": False,
            "store_id": store_id,
            "shorthand_url":generate_updated_qr_code_data["link"],
            "qrcode_image_url": generate_updated_qr_code_data["qrcode_image_url"],
            "workspace_id": workspace_id,
            "user_id":user_id,
            "created_at": dowell_time(timezone)["current_time"],
            "updated_at":"",
            "records": [{"record": "1", "type": "overall"}]
        }
        response = json.loads(datacube_data_insertion(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_qrcode_record',
            qrcode_data
        ))
        if not response["success"]:
            return CustomResponse(False,"Failed to create save qrcode data",None,status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True,"Qrcode created successfully",qrcode_data,status.HTTP_201_CREATED)
    def retrieve_qrcoderecode_details(self, request):
        
        workspace_id = request.GET.get('workspace_id')
        user_id = request.GET.get('user_id')
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')
        store_type = request.GET.get('store_type')
        
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = RetrieveQRcodeRecordSerializer(data={"workspace_id": workspace_id,"user_id": user_id,"limit": limit,"offset": offset})

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)

        response = json.loads(datacube_data_retrieval(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_qrcode_record',
            {
               "workspace_id":workspace_id,
               "user_id" : user_id,
               "store_type": store_type,
            },
            limit,
            offset,
            False
        ))

        if not response["success"]:
            return CustomResponse(False, "Failed to retrieve data from QRCode Record",None, status.HTTP_400_BAD_REQUEST) 
        
        return CustomResponse(True, "Successfully retrieved data from QRCode Record",response["data"],status.HTTP_200_OK)

    def retrieve_seat_details(self, request):
        
        workspace_id = request.GET.get("workspace_id")
        seat_number = request.GET.get("seat_number")

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        if workspace_id is None and seat_number is None:
            return CustomResponse(False, "Posting wrong data to API",None, status.HTTP_400_BAD_REQUEST)
         
        response = json.loads(datacube_data_retrieval(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_qrcode_record',
            {
                "workspace_id":workspace_id,
                "seat_number":f'seat_number_{seat_number}'
            },
            1,0,False
        ))

        if not response["success"]:
           return CustomResponse(False,"Failed to retrieve data",None,status.HTTP_400_BAD_REQUEST)
        data = response.get("data",[])[0]
        
        if not data["is_active"]:
            return CustomResponse(False,"The seat is not active for today",None,status.HTTP_400_BAD_REQUEST)

        return CustomResponse(True,"Successfully retrieved data",data["qrcode_id"],status.HTTP_200_OK)
    
    def activate_seat(self, request):
       
        workspace_id = request.GET.get("workspace_id")
        document_id = request.GET.get("document_id")
        seat_status = request.GET.get("seat_status")
        
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        if workspace_id is None or document_id is None or seat_status is None:
            return CustomResponse(False, "Posting wrong data to API",None, status.HTTP_400_BAD_REQUEST)
        
        seat_status = seat_status.lower() == 'true'
        
        response= json.loads(datacube_data_update(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_qrcode_record',
            {
                "_id": document_id,
            },
            {
                "is_active": seat_status
            }           
        ))

        if not response["success"]:
            return CustomResponse(False,"Failed to perform the activate operation",None, status.HTTP_400_BAD_REQUEST)
        seat_status_msg = "activated" if seat_status else "deactivated"

        return CustomResponse(True,f"Seat {seat_status_msg} successfully",None, status_code=status.HTTP_200_OK)

    def get_master_qrcode_record(self,request):
        
        workspace_id = request.GET.get('workspace_id')
        user_id = request.GET.get('user_id')
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')
        
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        response = json.loads(datacube_data_retrieval(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_qrcode_record',
            {
                "workspace_id":workspace_id,
                "user_id" : user_id,
                "qrcode_name": f'{workspace_id}_master_qrcode'
            },
            limit,
            offset,
            False
        ))

        if not response["success"]:
            return CustomResponse(False, "Failed to retrieve data from QRCode Record",None, status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True, "Successfully retrieved data from QRCode Record",response["data"],status.HTTP_200_OK)
    def handle_error(self, request): 
        
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)
    
@method_decorator(csrf_exempt, name='dispatch')
class customer_services_offline_store(APIView):
    
    def post(self, request):
        
        type_request = request.GET.get('type')

        if type_request == "create_order":
            return self.create_order(request)
        elif type_request == "initiate_order":
            return self.initiate_order(request)
        elif type_request =="old_order":
            return self.old_order(request)
        elif type_request == "initiate_online_order":
            return self.initiate_online_order(request)
        else:
            return self.handle_error(request)
    
    def get(self, request):
        
        type_request = request.GET.get('type')

        if type_request == "update_payment_status":
            return self.update_payment_status(request)
        elif type_request == "retrieve_orders_by_seat":
            return self.retrieve_orders_by_seat(request)
        elif type_request == "retrive_initiated_order":
            return self.retrive_initiated_order(request)
        
        else:
            return self.handle_error(request)   
        
    def initiate_order(self,request):
        seat_number = request.data.get('seat_number')
        workspace_id = request.data.get('workspace_id')
        timezone = request.data.get('timezone')
        date= request.data.get('date')
        store_id= request.data.get('store_id')
        phone_number = request.data.get('phone_number')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = OrderInitiateSerializer(data={
            "workspace_id": workspace_id,
            "timezone": timezone,
            "seat_number":seat_number,
            "date":date,
            "store_id":store_id,
            "phone_number":phone_number
        })
       
        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        seat_number = f'seat_number_{seat_number}'
        
        session_token = generate_jwt_token({"workspace_id":workspace_id,"store_id":store_id,"seat_number":seat_number,"date":date})

        data_to_insert = {
            "seat_number":seat_number,
            "qrcode_id": "",
            "is_paid": False,
            "payment_status": "not_paid",
            "order_status": "order_initiated",
            "store_id": store_id,
            "workspace_id": workspace_id,
            "payment_link": "",
            "date_customer_visited": date,
            "phone_number": phone_number,
            "store_type": "OFFLINE",
            "amount":None,
            "payment_receipt_id":"",
            "receipt_id": "",
            "payment_details": None,
            "session_token": session_token,
            "created_at": dowell_time(timezone)["current_time"],
            "updated_at": "",
            "records": [{"record": "1", "type": "overall"}]
        }

        database_name = f'{workspace_id}_data_q'
        collection_name = f'{workspace_id}_{date}_q'

        response = json.loads(datacube_data_insertion(
            api_key,
            database_name,
            collection_name,
            data_to_insert
        ))
        
        if not response["success"]:
            return CustomResponse(False, "Failed to initiate order",None, status.HTTP_400_BAD_REQUEST)

        return CustomResponse(True,"Order initiated successfully", response["data"]["inserted_id"],status.HTTP_201_CREATED)
    
    def retrieve_orders_by_seat(self,request):
        workspace_id = request.GET.get('workspace_id')
        date= request.GET.get('date')
        store_id= request.GET.get('store_id')
        seat_number = request.GET.get('seat_number')
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        database_name = f'{workspace_id}_data_q'
        collection_name = f'{workspace_id}_{date}_q'

        response = json.loads(datacube_data_retrieval(
            api_key,
            database_name,
            collection_name,
            {
                "workspace_id":workspace_id,
                "date_customer_visited":date,
                "seat_number":f"seat_number_{seat_number}",
                "store_id":store_id,
                "store_type":"OFFLINE",
            },
            limit,
            offset,
            False
        ))

        if not response["success"]:
            return CustomResponse(False, "Failed to initiate order",None, status.HTTP_400_BAD_REQUEST)

        return CustomResponse(True,"Retrieve initiated ordered",response["data"],status.HTTP_200_OK)
    
    def retrive_initiated_order(self,request):
        workspace_id = request.GET.get('workspace_id')
        date= request.GET.get('date')
        store_id= request.GET.get('store_id')
        seat_number = request.GET.get('seat_number')
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        database_name = f'{workspace_id}_data_q'
        collection_name = f'{workspace_id}_{date}_q'

        response = json.loads(datacube_data_retrieval(
            api_key,
            database_name,
            collection_name,
            {
                "workspace_id":workspace_id,
                "date_customer_visited":date,
                "seat_number":f"seat_number_{seat_number}",
                "store_id":store_id
            },
            limit,
            offset,
            False
        ))

        if not response["success"]:
            return CustomResponse(False, "Failed to initiate order",None, status.HTTP_400_BAD_REQUEST)
        
        data = response["data"]
        response = [{"order_initiated_id": entry["_id"], "qrcode_id": entry["qrcode_id"], "order_status": entry["order_status"], "phone_number": entry["phone_number"]} for entry in data if entry["order_status"] == "order_initiated"]

        return CustomResponse(True,"Retrieve initiated ordered",response,status.HTTP_200_OK)

    def create_order(self,request):
    
        seat_number = request.data.get('seat_number')
        qrcode_id = request.data.get('qrcode_id')
        workspace_id = request.data.get('workspace_id')
        timezone = request.data.get('timezone')
        date= request.data.get('date')
        store_id= request.data.get('store_id')
        amount = request.data.get('amount')
        orderId = request.data.get('order_intiated_id')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = SaveSeatDetailsSerializer(data={"workspace_id": workspace_id,"qrcode_id": qrcode_id,"timezone": timezone,"seat_number":seat_number,"date":date,"store_id":store_id,"amount":amount,"orderId":orderId})
       
        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        payment_receipt_id = generate_store_id()
        # callback_url =f"http://localhost:5173/success/?view=success&payment_receipt_id={payment_receipt_id}&date={date}&workspace_id={workspace_id}&qrcode_id={qrcode_id}&seat_number={seat_number}"
        callback_url =f"https://www.q.uxlivinglab.online/success/?view=success&payment_receipt_id={payment_receipt_id}&date={date}&workspace_id={workspace_id}&qrcode_id={qrcode_id}&seat_number={seat_number}&store_id={store_id}"
        
        # payment information will be changed later
        
        payment_response = generate_payment(amount, callback_url)
        print(callback_url)
        if payment_response.status_code != 200:
            return CustomResponse(False, "Failed to initiate payment for the customer", status.HTTP_401_UNAUTHORIZED)
        
        create_payment = payment_response.json()

        database_name = f'{workspace_id}_data_q'
        collection_name = f'{workspace_id}_{date}_q'
        
        qrcode_updation_response = update_qr_code_link(
            qrcode_id,
            create_payment["approval_url"],
            f'seat_number_{seat_number}'
        )
       
        if not qrcode_updation_response:
            return CustomResponse(False, "Failed to update payment link to qr code server",None, status.HTTP_400_BAD_REQUEST)
        

        data_to_update = {
            "order_status":"payment_generated",
            "qrcode_id": qrcode_id,
            "payment_link": create_payment["approval_url"],
            "amount":amount,
            "payment_receipt_id":payment_receipt_id,
            "receipt_id": create_payment["payment_id"],
            "payment_details": None,
            "updated_at": dowell_time(timezone)["current_time"]
        }

        response= json.loads(datacube_data_update(
            api_key,
            database_name,
            collection_name,
            {
                "_id":orderId
            },
            data_to_update
        ))

        if not response["success"]:
            return CustomResponse(False, "Failed to generate payment",None, status.HTTP_400_BAD_REQUEST)
         
        return CustomResponse(True,"The payment process has started, QRCode is ready to scan by customer",None, status.HTTP_201_CREATED)

    def old_order(self, request):
        workspace_id = request.data.get('workspace_id')
        store_id= request.data.get('store_id')
        phone_number = request.data.get('phone_number')
        date = request.data.get('date')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = OldOrdersSerializer(data={"workspace_id": workspace_id,"store_id": store_id,"date":date,"store_id":store_id,"phone_number":phone_number})
       
        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        database_name = f'{workspace_id}_data_q'
        collection_name = f'{workspace_id}_{date}_q'

        response = json.loads(datacube_data_retrieval(
            api_key,
            database_name,
            collection_name,
            {
                "workspace_id": workspace_id,
                "store_id": store_id,
                "phone_number": phone_number,
                "date_customer_visited": date
            },
            1,
            0,
            False
        ))

        if not response["success"]:
            return CustomResponse(False, "Failed to retrieve customer data",None, status.HTTP_400_BAD_REQUEST)
        
        if response["data"] is None or len(response["data"]) == 0:
            return CustomResponse(False, "No customer data found",None, status.HTTP_404_NOT_FOUND)
        
        data = response.get('data',[])[0]
        if len(data) == 0:
            return CustomResponse(False, "Kindly initiate a new order",None, status.HTTP_404_NOT_FOUND)
        
        if not data["is_paid"] and data["payment_status"] == "paid":
            return CustomResponse(False, "Kindly initiate a new order, You have already paid the bill",None, status.HTTP_200_OK)

        if data["order_status"] == "payment_generated":
            return CustomResponse(False, "The bill is generated ,Kindly pay the bill",data, status.HTTP_402_PAYMENT_REQUIRED)

        if data["order_status"] == "order_initiated":
            return CustomResponse(False, "The bill is not yet generated ,Kindly wait for the bill",None, status.HTTP_200_OK)
        
        print(data["is_paid"])
        print(data["payment_status"])
        print(data["order_status"])
        if data["is_paid"] and data["payment_status"] == "paid" and data["order_status"] == "order_paid":
            return CustomResponse(True, "Thank you for dining with us, visit next time again",None, status.HTTP_200_OK)
        
        check_session = decode_jwt_token(data["session_token"])
        if check_session is None:
            return CustomResponse(False, "Session has expired, Kindly initiate new order", None, status.HTTP_401_UNAUTHORIZED)
        
        return CustomResponse(True, "Customer Data retrieved" ,data, status.HTTP_200_OK)
        
    def update_payment_status(self,request):
        
        payment_receipt_id = request.GET.get('payment_receipt_id')
        date = request.GET.get('date')
        workspace_id = request.GET.get('workspace_id')
        qrcode_id = request.GET.get('qrcode_id')
        seat_number = request.GET.get('seat_number')
        store_id = request.GET.get('store_id')

        
        if not qrcode_id and not payment_receipt_id and not workspace_id and not date:
            return CustomResponse(False, "Payment Details are missing",None, status.HTTP_400_BAD_REQUEST)
        
        generated_link = f'https://www.q.uxlivinglab.online/qrlink/?view=qrlinks&workspace_id={workspace_id}&store_id={store_id}&seat_number={seat_number}'
        update_qr_code = update_qr_code_link(
            qrcode_id,
            generated_link,
            f'seat_number_{seat_number}'
        )


        if not update_qr_code:
            return CustomResponse(False, "Failed to update the qrcode link contact to administrator",None, status.HTTP_400_BAD_REQUEST)
        
        response = json.loads(datacube_data_update(
            "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
            f'{workspace_id}_data_q',
            f'{workspace_id}_{date}_q',
            {
                "payment_receipt_id": payment_receipt_id,
                "date_customer_visited": date,
                "qrcode_id": qrcode_id,
            },
            {
                "is_paid": True,
                "payment_status": "paid",
                "order_status": "order_paid",
            }
        ))

        if not response["success"]:
            return CustomResponse(False,"Failed to update the payment status",None, status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True, "Payment successfully updated",None, status.HTTP_200_OK)   
        
    def handle_error(self, request): 
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class customer_services_online_store(APIView):
    
    def post(self, request):
        type_request = request.GET.get('type')

        if type_request == "create_online_order":
            return self.create_online_order(request)
        elif type_request == "initiate_online_order":
            return self.initiate_online_order(request)
        elif type_request == "retrieve_old_order":
            return self.retrieve_old_order(request)
        else:
            return self.handle_error(request)
    
    def get(self, request):
        
        type_request = request.GET.get('type')

        if type_request == "retieve_online_initiated_order":
            return self.retieve_online_initiated_order(request)
        elif type_request == "retrieve_online_orders_by_seat":
            return self.retrieve_online_orders_by_seat(request)
        
        
        else:
            return self.handle_error(request)   
        
    def initiate_online_order(self,request):
        workspace_id = request.data.get('workspace_id')
        store_id= request.data.get('store_id')
        customer_user_id = request.data.get('customer_user_id')
        ticket_id = request.data.get('ticket_id')
        timezone = request.data.get('timezone')
        date = request.data.get('date') 

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = OnlineOrderInitiateSerializer(data={
            "workspace_id": workspace_id,
            "timezone": timezone,
            "customer_user_id":customer_user_id,
            "date":date,
            "store_id":store_id,
            "ticket_id":ticket_id
        })

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        session_token = generate_jwt_token({"workspace_id":workspace_id,"store_id":store_id,"ticket_id":ticket_id,"date":date})

        data_to_insert = {
            "seat_number":"",
            "qrcode_id": "",
            "is_paid": False,
            "payment_status": "not_paid",
            "order_status": "order_initiated",
            "store_id": store_id,
            "workspace_id": workspace_id,
            "payment_link": "",
            "date_customer_visited": date,
            "ticket_id": ticket_id,
            "customer_user_id":customer_user_id,
            "store_type": "ONLINE",
            "amount":None,
            "payment_receipt_id":"",
            "receipt_id": "",
            "payment_details": None,
            "session_token": session_token,
            "created_at": dowell_time(timezone)["current_time"],
            "updated_at": "",
            "records": [{"record": "1", "type": "overall"}]
        }
        
        database_name = f'{workspace_id}_data_q'
        collection_name = f'{workspace_id}_{date}_q'

        response = json.loads(datacube_data_insertion(
            api_key,
            database_name,
            collection_name,
            data_to_insert
        ))
        
        if not response["success"]:
            return CustomResponse(False, "Failed to initiate order",None, status.HTTP_400_BAD_REQUEST)

        return CustomResponse(True,"Order initiated successfully", response["data"]["inserted_id"],status.HTTP_201_CREATED)
    
    def create_online_order(self,request):
        seat_number = request.data.get('seat_number')
        qrcode_id = request.data.get('qrcode_id')
        workspace_id = request.data.get('workspace_id')
        timezone = request.data.get('timezone')
        date= request.data.get('date')
        store_id= request.data.get('store_id')
        amount = request.data.get('amount')
        orderId = request.data.get('order_intiated_id')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = SaveSeatDetailsSerializer(data={"workspace_id": workspace_id,"qrcode_id": qrcode_id,"timezone": timezone,"seat_number":seat_number,"date":date,"store_id":store_id,"amount":amount,"orderId":orderId})
       
        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        payment_receipt_id = generate_store_id()
        # callback_url =f"http://localhost:5173/success/?view=success&payment_receipt_id={payment_receipt_id}&date={date}&workspace_id={workspace_id}&qrcode_id={qrcode_id}&seat_number={seat_number}"
        callback_url =f"https://www.q.uxlivinglab.online/success/?view=success&payment_receipt_id={payment_receipt_id}&date={date}&workspace_id={workspace_id}&qrcode_id={qrcode_id}&seat_number={seat_number}&store_id={store_id}"
        
        # payment information will be changed later
        
        payment_response = generate_payment(amount, callback_url)
        print(callback_url)
        if payment_response.status_code != 200:
            return CustomResponse(False, "Failed to initiate payment for the customer", status.HTTP_401_UNAUTHORIZED)
        
        create_payment = payment_response.json()
       
        database_name = f'{workspace_id}_data_q'
        collection_name = f'{workspace_id}_{date}_q'
        
        qrcode_updation_response = update_qr_code_link(
            qrcode_id,
            create_payment["approval_url"],
            f'seat_number_{seat_number}'
        )
       
        if not qrcode_updation_response:
            return CustomResponse(False, "Failed to update payment link to qr code server",None, status.HTTP_400_BAD_REQUEST)
        

        data_to_update = {
            "seat_number":f'seat_number_{seat_number}',
            "order_status":"payment_generated",
            "qrcode_id": qrcode_id,
            "payment_link": create_payment["approval_url"],
            "amount":amount,
            "payment_receipt_id":payment_receipt_id,
            "receipt_id": create_payment["payment_id"],
            "payment_details": None,
            "updated_at": dowell_time(timezone)["current_time"]
        }

        response= json.loads(datacube_data_update(
            api_key,
            database_name,
            collection_name,
            {
                "_id":orderId
            },
            data_to_update
        ))

        if not response["success"]:
            return CustomResponse(False, "Failed to generate payment",None, status.HTTP_400_BAD_REQUEST)
         
        return CustomResponse(True,"The payment process has started, QRCode is ready to scan by customer",None, status.HTTP_201_CREATED)

    def retieve_online_initiated_order(self,request):
        workspace_id = request.GET.get('workspace_id')
        date= request.GET.get('date')
        store_id= request.GET.get('store_id')
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        database_name = f'{workspace_id}_data_q'
        collection_name = f'{workspace_id}_{date}_q'

        response = json.loads(datacube_data_retrieval(
            api_key,
            database_name,
            collection_name,
            {
                "workspace_id":workspace_id,
                "date_customer_visited":date,
                "store_id":store_id,
                "store_type":"ONLINE", 
            },
            limit,
            offset,
            False
        ))

        if not response["success"]:
            return CustomResponse(False, "Failed to initiate order",None, status.HTTP_400_BAD_REQUEST)
        
        data = response["data"]
        response = [{"order_initiated_id": entry["_id"], "order_status": entry["order_status"], "customer_user_id": entry["customer_user_id"]} for entry in data if entry["order_status"] == "order_initiated"]

        return CustomResponse(True,"Retrieve initiated ordered",response,status.HTTP_200_OK)
    
    def retrieve_online_orders_by_seat(self,request):
        workspace_id = request.GET.get('workspace_id')
        date= request.GET.get('date')
        store_id= request.GET.get('store_id')
        seat_number = request.GET.get('seat_number')
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        database_name = f'{workspace_id}_data_q'
        collection_name = f'{workspace_id}_{date}_q'

        response = json.loads(datacube_data_retrieval(
            api_key,
            database_name,
            collection_name,
            {
                "workspace_id":workspace_id,
                "date_customer_visited":date,
                "seat_number":f"seat_number_{seat_number}",
                "store_id":store_id,
                "store_type":"ONLINE"
            },
            limit,
            offset,
            False
        ))

        if not response["success"]:
            return CustomResponse(False, "Failed to initiate order",None, status.HTTP_400_BAD_REQUEST)

        return CustomResponse(True,"Retrieve initiated ordered",response["data"],status.HTTP_200_OK)
    
    def retrieve_old_order(self, request):
        workspace_id = request.data.get('workspace_id')
        store_id= request.data.get('store_id')
        customer_user_id = request.data.get('customer_user_id',None)
        order_intiated_id = request.data.get('order_intiated_id',None)
        date = request.data.get('date')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = OldOnlineOrdersSerializer(data={"workspace_id": workspace_id,"store_id": store_id,"date":date,"store_id":store_id,"customer_user_id":customer_user_id,"order_intiated_id":order_intiated_id})
       
        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        database_name = f'{workspace_id}_data_q'
        collection_name = f'{workspace_id}_{date}_q'

        response = json.loads(datacube_data_retrieval(
            api_key,
            database_name,
            collection_name,
            {
                "workspace_id": workspace_id,
                "store_id": store_id,
                "customer_user_id": customer_user_id,
                "date_customer_visited": date
            },
            1,
            0,
            False
        ))

        if not response["success"]:
            return CustomResponse(False, "Failed to retrieve customer data",None, status.HTTP_400_BAD_REQUEST)
        
        if response["data"] is None or len(response["data"]) == 0:
            return CustomResponse(False, "No customer data found",None, status.HTTP_404_NOT_FOUND)
        
        data = response.get('data',[])[0]
        if len(data) == 0:
            return CustomResponse(False, "Kindly initiate a new order",None, status.HTTP_404_NOT_FOUND)
        
        if not data["is_paid"] and data["payment_status"] == "paid":
            return CustomResponse(False, "Kindly initiate a new order, You have already paid the bill",None, status.HTTP_200_OK)

        if data["order_status"] == "payment_generated":
            return CustomResponse(False, "The bill is generated ,Kindly pay the bill",data, status.HTTP_402_PAYMENT_REQUIRED)

        if data["order_status"] == "order_initiated":
            return CustomResponse(False, "The bill is not yet generated ,Kindly wait for the bill",None, status.HTTP_200_OK)
        
        
        if data["is_paid"] and data["payment_status"] == "paid" and data["order_status"] == "order_paid":
            return CustomResponse(True, "Thank you for dining with us, visit next time again",None, status.HTTP_200_OK)
        
        check_session = decode_jwt_token(data["session_token"])
        if check_session is None:
            return CustomResponse(False, "Session has expired, Kindly initiate new order", None, status.HTTP_401_UNAUTHORIZED)
        
        return CustomResponse(True, "Customer Data retrieved" ,data, status.HTTP_200_OK)
    

    def handle_error(self, request): 
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)

