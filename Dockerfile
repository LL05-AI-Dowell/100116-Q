# FROM python:3.11

# WORKDIR /100116-Q

# COPY requirements.txt /100116-Q/requirements.txt

# RUN pip install -r requirements.txt

# COPY . /100116-Q/

# RUN python manage.py makemigrations
# RUN python manage.py migrate

# EXPOSE 8000

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

FROM python:3.11

# Set the working directory in the container
WORKDIR /usr/src/app

# Remember to clean your package manager cache to reduce your custom image size...
RUN apt-get clean all \
   && rm -rvf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY ./requirements.txt /usr/src/app/requirements.txt
RUN pip install -r requirements.txt --no-cache-dir

# Copy the rest of the Django app code to the container
COPY . /usr/src/app

# Expose the port on which the Django app will run
EXPOSE 8000

