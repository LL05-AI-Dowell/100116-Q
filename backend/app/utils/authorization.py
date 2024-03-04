from rest_framework.response import Response
from rest_framework import status

class InvalidTokenException(Exception):
    pass

def authorization_check(api_key):
    """
    Checks the validity of the API key.

    :param api_key: The API key to be validated.
    :return: The extracted token if the API key is valid.
    :raises InvalidTokenException: If the API key is missing, invalid, or has an incorrect format.
    """
    if not api_key or not api_key.startswith('Bearer '):
        
        raise InvalidTokenException("Bearer token is missing or invalid")
    try:
        _, token = api_key.split(' ')
    except ValueError:
        raise InvalidTokenException("Invalid Authorization header format")
    
    return token
