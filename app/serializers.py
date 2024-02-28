from rest_framework import serializers
import json 
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError as DjangoValidationError

class LimitedKeysDictField(serializers.DictField):
    def __init__(self, *args, **kwargs):
        self.allowed_keys = kwargs.pop('allowed_keys')
        super().__init__(*args, **kwargs)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        for key in data.keys():
            if key not in self.allowed_keys:
                raise serializers.ValidationError(f"Key '{key}' is not allowed")
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
    update_data = LimitedKeysDictField(allowed_keys=['bank_details', 'address'])
    
    def validate_update_data(self, value):
        store_name = value.get('bank_details')
        if not isinstance(store_name, dict):
            raise serializers.ValidationError("bank_details must be a JSON object")
        return value

class CreateStoreSerializer(serializers.Serializer):
    store_id = serializers.CharField(max_length=100,allow_null= True, allow_blank=True)
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    user_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)

class RetriveStoreSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    limit = serializers.IntegerField()
    offset = serializers.IntegerField()

class UpdateStoreDataSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    store_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    timezone = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    update_data = LimitedKeysDictField(allowed_keys=['store_name', 'image_link'])

    def validate_update_data(self, value):
        image_link = value.get('image_link')
        if not image_link:
            return value

        validator = URLValidator()
        try:
            validator(image_link)
        except DjangoValidationError:
            raise serializers.ValidationError("image_link must be a valid URL")
        
        return value

class CreateQrCodeSerializer(serializers.Serializer):
    workspace_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    user_id = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    timezone = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    username = serializers.CharField(max_length=100,allow_null= False, allow_blank=False)
    seat_number = serializers.IntegerField()
    link = serializers.URLField()

class RetriveQRcodeRecordSerializer(serializers.Serializer):
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