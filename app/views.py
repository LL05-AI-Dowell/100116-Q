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
            return CustomResponse(False,"Meta Data Database is not yet available, kindly contact the administrator.", None, status.HTTP_501_NOT_IMPLEMENTED )

        list_of_meta_data_collection = [
            f'{workspace_id}_user_details',
            f'{workspace_id}_qrcode_record',
            f'{workspace_id}_store_details',
        ]

        missing_collections = []
        for collection in list_of_meta_data_collection:
            if collection not in response_meta_data["data"][0]:
                missing_collections.append(collection)

        if missing_collections:
            missing_collections_str = ', '.join(missing_collections)
            return CustomResponse(False, f"The following collections are missing: {missing_collections_str}", missing_collections, status.HTTP_404_NOT_FOUND)

        return CustomResponse(True,"Metadata databases are available to be used", None, status.HTTP_200_OK )
    
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
            return CustomResponse(False,"Data Database is not yet available, kindly contact the administrator.", None, status.HTTP_501_NOT_IMPLEMENTED )

        list_of_data_collection = [f'{workspace_id}_{date}_q']

        missing_collections = []
        for collection in list_of_data_collection:
            if collection not in response_data["data"][0]:
                missing_collections.append(collection)

        if missing_collections:
            missing_collections_str = ', '.join(missing_collections)
            return CustomResponse(False, f"The following collections are missing: {missing_collections_str}", missing_collections, status.HTTP_404_NOT_FOUND)

        return CustomResponse(True,"Data databases are available to be used", None, status.HTTP_200_OK )
        
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
        elif type_request == "update_store_data":
            return self.update_store_data(request)
        else:
            return self.handle_error(request)
        
    def get(self, request): 
        type_request = request.GET.get('type')

        if type_request == "retrieve_store_details":
            return self.retrieve_store_details(request)
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
        update_data = request.data.get('update_data')
        workspace_id = request.GET.get('workspace_id')
        timezone = request.data.get('timezone')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)

        serializer = UpdateStoreDataSerializer(data={"store_id": store_id,"update_data": update_data,"workspace_id":workspace_id,"timezone":timezone})
        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        update_data["updated_at"] = dowell_time(timezone)["current_time"]

        response = json.loads(datacube_data_update(
            api_key,
            f'{workspace_id}_meta_data_q',
            f'{workspace_id}_store_details',
            {
                "_id":"65ddfeea932969c6c483bb4b"
            },
            update_data
            
        ))
        print(f'{workspace_id}_meta_data_q')
        if not response["success"]:
            return CustomResponse(False,"Failed to update Store data",None,status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True, "Store data updated successfully", None, status.HTTP_200_OK)


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
        link = request.data.get("link")
        timezone = request.data.get('timezone')
        username = request.data.get('username')
        seat_number = request.GET.get('seat_number')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = CreateQrCodeSerializer(data={"workspace_id": workspace_id,"user_id": user_id,"timezone": timezone,"link": link,"username":username,"seat_number":seat_number})

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        qrcode = json.loads(generate_qrcode(
            workspace_id, 
            user_id,
            link,
            f'Qrcode_seat_{seat_number}'
        ))

        generate_qrcode_data = qrcode.get('qrcode',[])
        

        if not generate_qrcode_data:
            return CustomResponse(False, "Failed to update the create qrcode in qrcode server", None, status.HTTP_400_BAD_REQUEST)

        update_qr_code_data = json.loads(update_qr_code(
            generate_qrcode_data["qrcode_id"],
            link,
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
    Customer services to manage customers and activate QR codes.

    :type request: POST to create customer payment.
    :type request: POST to retrieve customer payment information by seat number.
    """
    def post(self, request):
        type_request = request.GET.get('type')

        if type_request == "create_customer_payment":
            return self.create_customer_payment(request)
        elif type_request =="retrieve_seat_customers":
            return self.retrieve_seat_customers(request)
        else:
            return self.handle_error(request)
    
    
    def create_customer_payment(self,request):
        """
        Create a new customer payment record and generate a payment link for the QR code.

        :param request: The HTTP request containing data for creating the customer payment.
        :type request: HttpRequest

        :return: Response indicating the success or failure of the payment creation process.
        :rtype: CustomResponse
        """
        seat_number = request.data.get('seat_number')
        qrcode_id = request.data.get('qrcode_id')
        workspace_id = request.data.get('workspace_id')
        timezone = request.data.get('timezone')
        date= request.data.get('date')
        store_id= request.data.get('store_id')
        amount = request.data.get('amount')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = SaveSeatDetailsSerializer(data={"workspace_id": workspace_id,"qrcode_id": qrcode_id,"timezone": timezone,"seat_number":seat_number,"date":date,"store_id":store_id,"amount":amount})
       
        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        payment_link = "https://checkout.stripe.com/c/pay/cs_live_a1vEW9n2OWLjuVFL8gB5BBLJHvvFd0RtA6NRXuI4bGItTv3Dx7LCHcaRgw#fidkdWxOYHwnPyd1blppbHNgWjA0SWtiNT1Jck91bE9PZF9GVURXbkdmaGhTX2JHcUFmZE1XQUtTMEh1VlE0MWY3al9Td3JNa2xsYGxrRFdhbD1CakRrX3RJXTRqcUdPUTF0N1FtbDRcTjxpNTU1VUhiRkRJdCcpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl"

        database_name = f'{workspace_id}_data_q'
        collection_name = f'{workspace_id}_{date}_q'
        
        qrcode_updation_response = update_qr_code_link(
            qrcode_id,
            payment_link,
            f'seat_number_{seat_number}'
        )
       
        if not qrcode_updation_response:
            return CustomResponse(False, "Failed to update payment link to qr code server",None, status.HTTP_400_BAD_REQUEST)
        
        data_to_insert = {
            "seat_number":f'seat_number_{seat_number}',
            "qrcode_id": qrcode_id,
            "is_paid": False,
            "payment_status": "not_paid",
            "store_id": store_id,
            "payment_link": payment_link,
            "date_customer_visited": date,
            "amount":amount,
            "created_at": dowell_time(timezone)["current_time"],
            "records": [{"record": "1", "type": "overall"}]
        }
      
        response= json.loads(datacube_data_insertion(
            api_key,
            database_name,
            collection_name,
            data_to_insert
        ))
    
        if not response["success"]:
            return CustomResponse(False, "Failed to create a customer",None, status.HTTP_400_BAD_REQUEST)
         
        return CustomResponse(True,"The payment process has started, QRCode is ready to scan by customer",None, status.HTTP_201_CREATED)
    
    def retrieve_seat_customers(self, request):
        """
        Retrieve customer data for a specific seat.

        :param request: The HTTP request containing parameters for retrieving customer data.
        :type request: HttpRequest

        :return: Response containing customer data for the specified seat.
        :rtype: CustomResponse
        """
        seat_number = request.GET.get('seat_number')
        workspace_id = request.GET.get('workspace_id')
        date= request.GET.get('date')
        store_id= request.GET.get('store_id')
        timezone = request.data.get('timezone')
        limit = request.GET.get('limit')
        offset = request.GET.get('offset')


        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = GetCustomerStatusSerializer(data={"workspace_id": workspace_id,"timezone": timezone,"seat_number":seat_number,"date":date,"store_id":store_id,"limit":limit,"offset": offset})

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        response = json.loads(datacube_data_retrieval(
            api_key,
            f'{workspace_id}_data_q',
            f'{workspace_id}_{date}_q',
            {
                "seat_number":f'seat_number_{seat_number}',
                "store_id": store_id,
                "date_customer_visited": date
            },
            limit,offset,False
        ))
        
        return CustomResponse(True, f"Retrieved data for seat number {seat_number}",response["data"], status.HTTP_200_OK)

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