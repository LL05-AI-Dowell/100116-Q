FROM python:3.9

WORKDIR /100116-Q

COPY requirements.txt /100116-Q/requirements.txt

RUN pip install -r requirements.txt

COPY . /100116-Q/

RUN python manage.py makemigrations
RUN python manage.py migrate

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
