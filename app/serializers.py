from rest_framework import serializers
import json 
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError as DjangoValidationError

class LimitedKeysDictField(serializers.DictField):
    def __init__(self, *args, **kwargs):
        self.allowed_keys = kwargs.pop('allowed_keys', [])
        super().__init__(*args, **kwargs)

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            self.fail('invalid')
        for key in data.keys():
            if key not in self.allowed_keys:
                self.fail('invalid_key', key=key)
        return data
    
class UserDetailsSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    email = serializers.EmailField()
    username = serializers.CharField(max_length=100, allow_null= False, allow_blank=False)
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    timezone = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)

class UpdateUserDetailsSerializer(serializers.Serializer):
    document_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    update_data = LimitedKeysDictField(allowed_keys=['bank_details', 'address','ticket_link','product_name'])
    
    def validate_bank_details(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("bank_details must be a JSON object")
        return value
class CreateStoreSerializer(serializers.Serializer):
    store_id = serializers.ListField(child=serializers.CharField(max_length=100), allow_null=True, allow_empty=True)
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    user_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)

class RetrieveStoreSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    limit = serializers.IntegerField()
    offset = serializers.IntegerField()

class UpdateStoreDataSerializer(serializers.Serializer):
    STORE_TYPE = (
        ("ONLINE","ONLINE"),
        ("OFFLINE","OFFLINE")
    )
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    user_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    timezone = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_type = serializers.ChoiceField(allow_null=False, allow_blank=False, choices=STORE_TYPE)
    update_data = LimitedKeysDictField(allowed_keys=['store_name', 'image_link','bill_genration_by','session_starts_by','PAYMENT_METHOD','tables'])

    
    PAYMENT_METHOD_CHOICES = ('PHONEPAY', 'GOOGLEPAY', 'DIRECT_BANK')
    BILL_GENERATION_BY_CHOICES = ('MANAGER', 'CUSTOMER')

    def validate_update_data(self, value):
        errors = {}

        # Validate image_link
        image_link = value.get('image_link')
        if image_link:
            validator = URLValidator()
            try:
                validator(image_link)
            except DjangoValidationError:
                errors['image_link'] = "image_link must be a valid URL"

        # Validate PAYMENT_METHOD
        payment_method = value.get('PAYMENT_METHOD')
        if payment_method and payment_method not in self.PAYMENT_METHOD_CHOICES:
            errors['PAYMENT_METHOD'] = "Invalid PAYMENT_METHOD"

        # Validate bill_genration_by
        bill_generation_by = value.get('bill_genration_by')
        if bill_generation_by and bill_generation_by not in self.BILL_GENERATION_BY_CHOICES:
            errors['bill_genration_by'] = "Invalid bill_genration_by"

        if errors:
            raise serializers.ValidationError(errors)

        return value

class CreateQrCodeSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    user_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    timezone = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    username = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_type = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    seat_number = serializers.IntegerField()
    link = serializers.URLField()
    
class CreateMasterQrCodeSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    user_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    timezone = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    username = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    link = serializers.URLField()

class RetrieveQRcodeRecordSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    user_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    limit = serializers.IntegerField()
    offset = serializers.IntegerField()

class CreateCollectionSerializer(serializers.Serializer):
    DATABASE_CHOICES = (
        ("META DATA","META DATA"),
        ("DATA","DATA"),
    )
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    collection_name = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    database_type = serializers.ChoiceField(choices=DATABASE_CHOICES)

class SaveSeatDetailsSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    qrcode_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    seat_number = serializers.IntegerField()
    amount = serializers.IntegerField()
    timezone = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    date = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    orderId = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)

class GetCustomerStatusSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    seat_number = serializers.IntegerField()
    timezone = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    date = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    limit = serializers.IntegerField()
    offset = serializers.IntegerField()

class CreateMenuSerializer(serializers.Serializer):
    STORE_TYPE = (
        ("ONLINE","ONLINE"),
        ("OFFLINE","OFFLINE")
    )
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_type = serializers.ChoiceField(allow_null= False, choices=STORE_TYPE)
    user_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    timezone = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    menu_data = serializers.ListField(
        child=serializers.DictField()
    )

class OrderInitiateSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    seat_number = serializers.IntegerField()
    phone_number = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    timezone = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    date = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
class OnlineOrderInitiateSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    customer_user_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    timezone = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    ticket_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    date = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)

class OldOrdersSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    phone_number = serializers.CharField(max_length=100,allow_null= True, allow_blank=True)
    date = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
class OldOnlineOrdersSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    customer_user_id = serializers.CharField(max_length=100,allow_null= True, allow_blank=True)
    order_intiated_id = serializers.CharField(max_length=100,allow_null= True, allow_blank=True)
    date = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)