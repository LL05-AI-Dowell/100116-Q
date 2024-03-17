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
    """
    Kitchen sink services to interact with the database.

    This class provides endpoints for handling various database-related operations,
    such as checking the existence of a database and creating a collection.

    :get request to check the existence of the database
    :post request to create collection
    """
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
        """
        Create a new collection from the given database

        This method helps to create a new collection in the specified database.

        :param database_type: The type of the database, which can be META DATA or DATA.
        :param workspace_id: The ID of the workspace where the collection will be created.
        :param collection_name: The name of the collection to be created.
        """
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
            return CustomResponse(False, "Falied to create collection, kindly contact the administrator.",None, status.HTTP_400_BAD_REQUEST)

        return CustomResponse(True,"Collection has been created successfully", None, status.HTTP_200_OK)

    def check_metedata_database_status(self, request):
        """
        Check the existence of the metadata database.

        This method checks if the specified databases (meta data and data) are available for a given workspace.
        
        :param request: The HTTP request object.
        :param api_key: The API key for authorization.
        :param workspace_id: The ID of the workspace.
        """
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
        """
        Check the existence of the data database.

        This method checks if the specified databases (meta data and data) are available for a given workspace.
        
        :param request: The HTTP request object.
        :param api_key: The API key for authorization.
        :param workspace_id: The ID of the workspace.
        """
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
        """
        Handle invalid request type.

        This method is called when the requested type is not recognized or supported.

        :param request: The HTTP request object.
        :type request: HttpRequest

        :return: Response indicating failure due to an invalid request type.
        :rtype: Response
        """
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class user_details_services(APIView):
    """
    User details services for managing user information.

    This class provides endpoints for saving, retrieving, and updating user details.

    :post to save user details
    :get to get user details
    :update to update user details
    """
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
        else: 
            return self.handle_error(request)

    def save_user_details(self, request):
        """
        Saves user details.

        :param request: The request object containing user details.
        :return: A custom error response if the data posted to the API is invalid, or a success response if the user details are saved successfully.
        """
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
        
        store_id = generate_store_id()
        user_data = {
            "store_ids":[store_id],
            "name": name,
            "email":email,
            "bank_details":{},
            "username":username,
            "workspace_id":workspace_id,
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
        """
        Retrieve user details.

        This method retrieves user details for the specified workspace ID.

        :param request: The HTTP request object.
        :param workspace_id: The ID of the workspace.
        :param api_key: The API key for authorization.
        """
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
            2,
            0,
            False
        ))

        if not response.get("data"):
            return CustomResponse(False,"User details not found", None,status.HTTP_404_NOT_FOUND)
        
        return CustomResponse(True,"User details retrieved successfully",response["data"], status.HTTP_302_FOUND)
    
    def update_user_details(self, request):
        """
        Update user details.

        This method updates user details for the specified document ID and workspace ID.

        :param request: The HTTP request object.
        :param document_id: The ID of the document to be updated.
        :param update_data: The data containing the updates to be applied.
        :param workspace_id: The ID of the workspace.
        :param timezone: The timezone to be used for updating the timestamp.
        :param api_key: The API key for authorization.
        """
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
@method_decorator(csrf_exempt, name='dispatch')
class store_services(APIView):
    """
    Store services for managing store information.

    This class provides endpoints for creating, updating, and retrieving store details.

    :post to create store
    :post to update store data
    :get to retrieve store details
    """
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
        """
        Create a store.

        This method creates a new store based on the provided request data.

        :param request: The HTTP request object.
        :param store_id: The ID of the store (optional).
        :param workspace_id: The ID of the workspace associated with the store.
        :param timezone: The timezone to be used for timestamp.
        :param user_id: The ID of the user associated with the store.
        :param api_key: The API key for authorization.
        """
        store_id = request.data.get("store_id",generate_store_id())
        workspace_id = request.data.get("workspace_id")
        timezone = request.data.get('timezone')
        user_id= request.data.get('user_id')
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)

        serializer = CreateStoreSerializer(data={"store_id": store_id,"workspace_id": workspace_id,"timezone": timezone,"user_id": user_id})

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        store_data = {
            "_id": store_id,
            "store_name": "",
            "workspace_id": workspace_id,
            "user_id":user_id,
            "image_link":"",
            "is_active":True,
            "bill_genration_by": "MANAGER",
            "session_starts_by": "PHONE_NUMBER",
            "PAYMENT_METHOD":"PHONEPAY" ,
            "tables": [
                {
                    "table_id": generate_store_id(),
                    "table_name": "Table 1",
                    "is_active": True,
                    "seat_data": [],
                    "created_at": dowell_time(timezone)["current_time"],
                    "updated_at":"",
                },
                {
                    "table_id": generate_store_id(),
                    "table_name": "Table 2",
                    "is_active": True,
                    "seat_data": [],
                    "created_at": dowell_time(timezone)["current_time"],
                    "updated_at":"",
                }
            ],
            "created_at": dowell_time(timezone)["current_time"],
            "updated_at":"",
            "records": [{"record": "1", "type": "overall"}]
        }
        
        response = json.loads(datacube_data_insertion(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_store_details',
            store_data
        ))

        if not response["success"]:
            return CustomResponse(False,"Failed to create a store",None,status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True,"Store created successfully",store_data,status.HTTP_201_CREATED)

    def retrieve_store_details(self, request):
        """
        Retrieve store details.

        This method retrieves store details for the specified workspace ID.

        :param request: The HTTP request object.
        :param workspace_id: The ID of the workspace.
        :param limit: The maximum number of records to retrieve.
        :param offset: The offset for pagination.
        :param api_key: The API key for authorization.
        """
        workspace_id = request.GET.get('workspace_id')
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')
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
        
        return CustomResponse(True, "Store details retrieved successfully", response["data"], status.HTTP_200_OK)
        
    def update_store_data(self, request):
        """
        Update store data.

        This method updates store data for the specified store ID and workspace ID.

        :param request: The HTTP request object.
        :param store_id: The ID of the store to be updated.
        :param update_data: The data containing the updates to be applied.
        :param workspace_id: The ID of the workspace.
        :param timezone: The timezone to be used for updating the timestamp.
        :param api_key: The API key for authorization.
        """
        store_id = request.GET.get('store_id')
        user_id = request.GET.get('user_id')
        update_data = request.data.get('update_data')
        workspace_id = request.GET.get('workspace_id')
        timezone = request.data.get('timezone')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)

        serializer = UpdateStoreDataSerializer(data={"store_id": store_id,"update_data": update_data,"workspace_id":workspace_id,"timezone":timezone,'user_id':user_id})
        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        update_data["updated_at"] = dowell_time(timezone)["current_time"]

        response = json.loads(datacube_data_update(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_store_details',
            {
                "user_id": user_id
            },
            update_data
            
        ))
        print(f'{workspace_id}_meta_data_q')
        if not response["success"]:
            return CustomResponse(False,"Failed to update Store data",None,status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True, "Store data updated successfully", None, status.HTTP_200_OK)

    def create_menu(self , request):
        """
        Create a menu for a specific store in a workspace.

        :param request: The HTTP request containing data for creating the menu.
        :type request: HttpRequest

        :return: Response indicating the success or failure of the menu creation process.
        :rtype: CustomResponse
        """
        workspace_id = request.GET.get('workspace_id')
        store_id = request.GET.get('store_id')
        menu_data = request.data.get('menu_data')
        timezone = request.data.get('timezone')
        user_id = request.GET.get('user_id')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = CreateMenuSerializer(data={"store_id": store_id,"menu_data": menu_data,"workspace_id":workspace_id,"timezone":timezone,"user_id":user_id})

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        menu_data_insert = {
            "workspace_id":workspace_id,
            "store_id":store_id,
            "user_id":user_id,
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
        """
        Retrieve menu details for a specific store in a workspace.

        :param request: The HTTP request containing parameters for retrieving menu details.
        :type request: HttpRequest

        :return: Response containing menu details for the specified store.
        :rtype: CustomResponse
        """
        workspace_id = request.GET.get("workspace_id")
        store_id = request.GET.get("store_id")
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        response = json.loads(datacube_data_retrieval(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_menu_card',
            {
                "workspace_id": workspace_id,
                "store_id": store_id
            },
            limit,
            offset,
            False
        ))

        if not response["success"]:
            return CustomResponse(False,"Failed to retrieve menu details", None, status.HTTP_404_NOT_FOUND)
        
        return CustomResponse(True,"Menu retrived succefully", response["data"],status.HTTP_200_OK)
    def handle_error(self, request): 
        """
        Handle invalid request type.

        This method is called when the requested type is not recognized or supported.

        :param request: The HTTP request object.
        :type request: HttpRequest

        :return: Response indicating failure due to an invalid request type.
        :rtype: Response
        """
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class qrcode_services(APIView):
    """
    QRCode services for managing Qrcode information.

    This class provides endpoints for creating, updating, and retrieving qrcode details.

    :post to create qrcode
    :get to retrieve qrcode details
    """
    def post(self, request):
        type_request = request.GET.get('type')

        if type_request == "create_qrcode":
            return self.create_qrcode(request)
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
        else: 
            return self.handle_error(request)
        
    def create_qrcode(self,request):
        """
        Create a QR code.

        This method creates a QR code based on the provided request data.

        :param request: The HTTP request object.
        :param workspace_id: The ID of the workspace.
        :param user_id: The ID of the user.
        :param link: The link associated with the QR code.
        :param timezone: The timezone to be used for timestamp.
        :param username: The username associated with the QR code.
        :param seat_number: The seat number associated with the QR code.
        :param api_key: The API key for authorization.
        """
        workspace_id = request.GET.get("workspace_id")
        user_id = request.GET.get("user_id")
        store_id = request.GET.get('store_id')
        link = request.data.get("link")
        timezone = request.data.get('timezone')
        username = request.data.get('username')
        seat_number = request.GET.get('seat_number')
        print(workspace_id)

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = CreateQrCodeSerializer(data={"workspace_id": workspace_id,"user_id": user_id,"timezone": timezone,"link": link,"username":username,"seat_number":seat_number,"store_id":store_id})

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        generated_link = f'{link}&workspace_id={workspace_id}&store_id={store_id}&seat_number={seat_number}'
        
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
            username,
            f'seat_number_{seat_number}',
        ))

        generate_updated_qr_code_data = update_qr_code_data.get('response',[])
        print(generate_updated_qr_code_data)

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

    def retrieve_qrcoderecode_details(self, request):
        """
        Retrieve QR code record details.

        This method retrieves QR code record details for the specified workspace ID and user ID.

        :param request: The HTTP request object.
        :param workspace_id: The ID of the workspace.
        :param user_id: The ID of the user.
        :param limit: The maximum number of records to retrieve.
        :param offset: The offset for pagination.
        :param api_key: The API key for authorization.
        """
        workspace_id = request.GET.get('workspace_id')
        user_id = request.GET.get('user_id')
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')
        
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
               "user_id" : user_id
            },
            limit,
            offset,
            False
        ))

        if not response["success"]:
            return CustomResponse(False, "Failed to retrieve data from QRCode Record",None, status.HTTP_400_BAD_REQUEST) 
        
        return CustomResponse(True, "Successfully retrieved data from QRCode Record",response["data"],status.HTTP_200_OK)

    def retrieve_seat_details(self, request):
        """
        Retrieve details about a specific seat within a workspace.
        :param workspace_id 
        :param seat_number
        """
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
        """
        Activate or deactivate a seat.

        :param workspace_id: The ID of the workspace.
        :param document_id: The MongoDB ID of the document representing the seat.
        :param seat_status: A boolean indicating whether to activate (True) or deactivate (False) the seat.
        """
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

    def handle_error(self, request): 
        """
        Handle invalid request type.

        This method is called when the requested type is not recognized or supported.

        :param request: The HTTP request object.
        :type request: HttpRequest

        :return: Response indicating failure due to an invalid request type.
        :rtype: Response
        """
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)
    
@method_decorator(csrf_exempt, name='dispatch')
class customer_services(APIView):
    """
    API view to handle various customer service operations.

    This class defines API endpoints to handle different types of customer service operations.
    It includes methods to create customer payments, retrieve seat customers, and update payment statuses.
    """
    def post(self, request):
        """
        Handle POST requests.

        This method is called to handle POST requests.
        It determines the type of request and routes it to the appropriate method.
        Supported request types:
            - create_customer_payment
            - retrieve_seat_customers

        :param request: The HTTP request object.
        :type request: HttpRequest

        :return: Response based on the type of request.
        :rtype: Response
        """
        type_request = request.GET.get('type')

        if type_request == "create_order":
            return self.create_order(request)
        elif type_request == "initiate_order":
            return self.initiate_order(request)
        elif type_request =="old_order":
            return self.old_order(request)
        else:
            return self.handle_error(request)
    
    def get(self, request):
        """
        Handle GET requests.

        This method is called to handle GET requests.
        It determines the type of request and routes it to the appropriate method.
        Supported request type:
            - update_payment_status

        :param request: The HTTP request object.
        :type request: HttpRequest

        :return: Response based on the type of request.
        :rtype: Response
        """
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
        """
        Initiate an order for a seat in a store workspace.

        :param request: The HTTP request containing data for initiating the order.
        :type request: HttpRequest

        :return: Response indicating the success or failure of the order initiation process.
        :rtype: CustomResponse
        """
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

        return CustomResponse(True,"Order initiated successfully", session_token,status.HTTP_201_CREATED)
    
    def retrieve_orders_by_seat(self,request):
        """
        Retrieve orders for a specific store workspace.

        :param request: The HTTP request containing parameters for retrieving orders.
        :type request: HttpRequest

        :return: Response containing retrieved orders for the specified workspace.
        :rtype: CustomResponse
        """
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

        return CustomResponse(True,"Retrieve initiated ordered",response["data"],status.HTTP_200_OK)
    
    def retrive_initiated_order(self,request):
        """
        Retrieve orders for a specific store workspace.

        :param request: The HTTP request containing parameters for retrieving orders.
        :type request: HttpRequest

        :return: Response containing retrieved orders for the specified workspace.
        :rtype: CustomResponse
        """
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
        """
        Create an order for a seat in a store workspace.

        :param request: The HTTP request containing data for creating the order.
        :type request: HttpRequest

        :return: Response indicating the success or failure of the order creation process.
        :rtype: CustomResponse
        """
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
        callback_url =f"http://localhost:5173/success/?view=success&payment_receipt_id={payment_receipt_id}&date={date}&workspace_id={workspace_id}&qrcode_id={qrcode_id}&seat_number={seat_number}"
        # callback_url =f"https://www.q.uxlivinglab.online/success/?view=success&payment_receipt_id={payment_receipt_id}&date={date}&workspace_id={workspace_id}&qrcode_id={qrcode_id}&seat_number={seat_number}"
        
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
        """
        Retrieve information about an old order.

        :param request: The HTTP request containing data for retrieving an old order.
        :type request: HttpRequest

        :return: Response containing information about the old order.
        :rtype: CustomResponse
        """
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
        
        data = response.get('data',[])[0]
        if len(data) == 0:
            return CustomResponse(False, "Kindly initiate a new order",None, status.HTTP_404_NOT_FOUND)
        
        if not data["is_paid"] and data["payment_status"] == "paid":
            return CustomResponse(False, "Kindly initiate a new order, You have already paid the bill",None, status.HTTP_200_OK)

        if data["order_status"] == "payment_generated":
            return CustomResponse(False, "The bill is generated ,Kindly pay the bill",None, status.HTTP_402_PAYMENT_REQUIRED)

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
        
        return CustomResponse(True, "Customer Data retrieved" ,None, status.HTTP_200_OK)
        
    def update_payment_status(self,request):
        """
        Update the payment status for a specific order.

        :param request: The HTTP request containing payment details.
        :type request: HttpRequest

        :return: Response indicating the success or failure of the payment status update.
        :rtype: CustomResponse
        """
        payment_receipt_id = request.GET.get('payment_receipt_id')
        date = request.GET.get('date')
        workspace_id = request.GET.get('workspace_id')
        qrcode_id = request.GET.get('qrcode_id')
        seat_number = request.GET.get('seat_number')

        
        if not qrcode_id and not payment_receipt_id and not workspace_id and not date:
            return CustomResponse(False, "Payment Details are missing",None, status.HTTP_400_BAD_REQUEST)
        
        update_qr_code = update_qr_code_link(
            qrcode_id,
            "https://xvr8nq-5173.csb.app/",
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
        """
        Handle invalid request type.

        This method is called when the requested type is not recognized or supported.

        :param request: The HTTP request object.
        :type request: HttpRequest

        :return: Response indicating failure due to an invalid request type.
        :rtype: Response
        """
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)





