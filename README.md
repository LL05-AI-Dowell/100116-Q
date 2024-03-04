## Welcome to Q - DoWell Platform

Welcome to the Q -> DoWell platform, a system designed for efficient queue management in restaurants.

### Backend Services

To get started with the backend services, follow these steps:

1. **Clone Repository:**
   ```bash
   git clone --single-branch -b backend https://github.com/LL05-AI-Dowell/100116-Q.git
   ```

2. **Setup Local Environment:**
   - Create a virtual environment:
     ```bash
     python -m venv env
     ```
   - Activate the virtual environment:
     - For Windows:
       ```bash
       ./env/Scripts/activate
       ```
     - For Unix/macOS:
       ```bash
       source ./env/bin/activate
       ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Locally:**
   ```bash
   python manage.py runserver
   ```

5. **Access Services Locally:**
   Visit [http://127.0.0.1:8000/](http://127.0.0.1:8000/) in your web browser.

### Running with Docker

Alternatively, you can run the services using Docker:

1. **Build Docker Image:**
   ```bash
   docker-compose up --build
   ```

2. **Access Services with Docker:**
   Visit [http://127.0.0.1:8000/](http://127.0.0.1:8000/) in your web browser.

### Frontend Services

To get started with the frontend services, follow these steps:

- **Clone Repository:**
   ```bash
   git clone --single-branch -b frontend https://github.com/LL05-AI-Dowell/100116-Q.git
   ```

- **Install Packages:**
   ```bash
   npm install
   ```

- **Create Environment File:**
   Create a `.env` file and add the following configuration:
   ```plaintext
   VITE_BACKED_URL="https://www.q.uxlivinglab.online/api"
   ```

- **Run Locally:**
   ```bash
   npm run dev
   ```

- **Access Services Locally:**
   Visit [http://localhost:5173/](http://localhost:5173/) in your web browser.

### Running with Docker

Alternatively, you can run the services using Docker:

1. **Build Docker Image:**
   ```bash
   docker-compose -f docker/prod/docker-compose.yml up --build
   ```

2. **Access Services with Docker:**
   Visit [http://localhost:5173/](http://localhost:5173/) in your web browser.

### License 
[Apache License 2.0](https://github.com/LL05-AI-Dowell/100116-Q/blob/main/LICENSE)

### Contributors
- [Manish]()
- [Ayesha]()

Powered by DoWell UX Living Lab [DoWell UX Living Lab](https://www.uxlivinglab.org/)

Copyright © 2024 UxLiving Lab, All rights reserved.