import json
import requests
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from datetime import datetime, timedelta
import jwt
from jwt import ExpiredSignatureError

def send_email(toname,toemail,subject,email_content):
    """
    Sends an email using the provided parameters.

    :param toname: The name of the recipient.
    :param toemail: The email address of the recipient.
    :param subject: The subject of the email.
    :param email_content: The content of the email.
    :return: Response text from the email API indicating the status of the email sending process.
    """
    url = "https://100085.pythonanywhere.com/api/email/"
    print(toemail)
    payload = {
        "toname": toname,
        "toemail": toemail,
        "subject": subject,
        "email_content":email_content
    }
    response = requests.post(url, json=payload)
    return response.text

def dowell_time(timezone):
    """
    Fetches current time from Dowell Clock API for the specified timezone.

    :param timezone: The timezone for which to fetch the current time.
    :return: A dictionary containing the response from the API, including the current time.
    """
    
    url = "https://100009.pythonanywhere.com/dowellclock/"
    payload = json.dumps({
        "timezone":timezone,
        })
    headers = {
        'Content-Type': 'application/json'
        }

    response = requests.request("POST", url, headers=headers, data=payload)
    res= json.loads(response.text)

    return res


def CustomResponse(success=True, message=None, response=None, status_code=None):
    """
    Create a custom response.
    :param success: Whether the operation was successful or not.
    :param message: Any message associated with the response.
    :param data: Data to be included in the response.
    :param status_code: HTTP status code for the response.
    :return: Response object.
    """
    response_data = {"success": success}
    if message is not None:
        response_data["message"] = message
    if response is not None:
        response_data["response"] = response

    return Response(response_data, status=status_code) if status_code else Response(response_data)

def generate_store_id():
    """
    Generates a BSON ObjectId.
    :ObjectId: A newly generated BSON ObjectId.
    """
    return str(ObjectId())

def dowell_time(timezone):
    """
    Query the doWell clock API to get the current time for a given timezone.
    :param timezone: The timezone for which to get the current time.
    :return: A custom response object with success status, message, data, and status code.
    """
    url = "https://100009.pythonanywhere.com/dowellclock/"
    payload = json.dumps({
        "timezone":timezone,
        })
    headers = {
        'Content-Type': 'application/json'
        }

    response = requests.request("POST", url, headers=headers, data=payload)
    res= json.loads(response.text)
    return res


def generate_data_collection_list(workspace_id, num_seats):
    """
    Generate a list of data collection names based on the workspace ID and the number of seats.
    
    :param workspace_id: The ID of the workspace.
    :param num_seats: The number of seats.
    :return: A list of data collection names.
    """
    list_of_data_collection = [f'{workspace_id}_seat_{i}' for i in range(1, num_seats + 1)]
    return list_of_data_collection

def generate_payment(price, callback_url):
    """
    Generate a payment request to the Stripe payment API.
    
    :param price: The price of the product.
    :param callback_url: The URL to which the payment response will be sent.
    :return: Response object containing the payment request result.
    """
    url = "https://100088.pythonanywhere.com/api/stripe-payment"
    payload = {
        "price": price,
        "product": "Q",
        "currency_code": "INR",
        "callback_url": callback_url
    }
    response = requests.post(url, json=payload)
    return response  

def user_login(username, password):
    """
    Perform user login by sending a POST request to the server with provided username and password.

    :param username: The username of the user.
    :type username: str
    :param password: The password of the user.
    :type password: str

    :return: The response text received from the server.
    :rtype: str
    """
    url = "https://100014.pythonanywhere.com/api/check_user/"
    payload = {
        "username":username,
        "password":password
    }
    response = requests.post(url, json=payload)
    return response.text 

def generate_phonepay_payment(userId,amount,redirect_url,merchantId):
    url = "https://www.q.uxlivinglab.online/dowellpayment/phonepay/api/v1/phonepay/initiate-payment"

    payload = {
        "userId":userId,
        "amount":amount,
        "redirect_url": redirect_url,
        "merchantId": merchantId
    }
    response = requests.post(url, json=payload)
    return response.text


def generate_jwt_token(payload):
    """
    Generate a JSON Web Token (JWT) with the given payload.

    :param payload: The payload to be included in the JWT.
    :type payload: dict

    :return: The generated JWT token.
    :rtype: str
    """
    expiration_time = datetime.utcnow() + timedelta(minutes=10)
    payload['exp'] = expiration_time
    jwt_token = jwt.encode(payload, 'uxlivinglabQ', algorithm='HS256')
    return jwt_token

def decode_jwt_token(token):
    """
    Decode a JSON Web Token (JWT) and return the decoded payload.

    :param token: The JWT token to decode.
    :type token: str

    :return: The decoded payload from the JWT token.
    :rtype: dict

    :raises ValueError: If the token has expired.
    """
    try:
        decoded_token = jwt.decode(token, 'uxlivinglabQ', algorithms=['HS256'])
        print(decoded_token)
        return decoded_token
    except ExpiredSignatureError:
        return None


def format_datetime(time_string):
    datetime_obj = datetime.strptime(time_string, "%Y-%m-%dT%H:%M:%S.%f%z")

    date_part = datetime_obj.strftime("%Y_%m_%d")
    time_part = datetime_obj.strftime("%H_%M_%S")
    formatted_datetime = f"{date_part}_{time_part}"

    return formatted_datetime