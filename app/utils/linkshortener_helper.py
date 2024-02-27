import json
import requests

def generate_qrcode(company_id, user_id, link):
    """
    Create a QR code using the specified company ID, user ID, and link.

    :param company_id: The ID of the company.
    :param user_id: The ID of the user.
    :param link: The link to be encoded in the QR code.
    :return: The response text from the QR code server.
    """
    url = "https://www.qrcodereviews.uxlivinglab.online/api/v4/qr-code/"

    payload = {
        "company_id": company_id,
        "user_id": user_id,
        "link": link
    }
    response = requests.post(url, json=payload)
    return response.text


def update_qr_code(qrcode_id, link, word, word2, word3):
    """
    Update the specified QR code with the new link and additional words.

    :param qrcode_id: The ID of the QR code to be updated.
    :param link: The updated link to be encoded in the QR code.
    :param word: Additional word 1.
    :param word2: Additional word 2.
    :param word3: Additional word 3.
    :return: The response text from the server after updating the QR code.
    """
    url = f"https://www.qrcodereviews.uxlivinglab.online/api/v4/update-qr-code/{qrcode_id}"
    
    payload = {
        "link": link,
        "word": word,
        "word2": word2,
        "word3": word3
    }
    response = requests.put(url, json=payload)
    return response.text
