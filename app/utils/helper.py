import json
import requests
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId


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