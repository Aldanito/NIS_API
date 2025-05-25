# NIS API Project

This project is a Django-based API for managing educational content including lessons and quizzes.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Running with Docker](#running-with-docker)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Postman Collection and API Endpoints](#postman-collection-and-api-endpoints)

## Local Development Setup

Follow these steps to set up and run the project on your local machine.

**Prerequisites:**

- Python 3.8+ installed
- Pip (Python package installer)
- Virtualenv (recommended for managing project dependencies)

**Setup Steps:**

1.  **Clone the repository (if you haven't already):**

    ```bash
    git clone https://github.com/Aldanito/NIS_API.git
    cd NIS_TEST
    ```

2.  **Create and activate a virtual environment:**
    On Windows (PowerShell):

    ```powershell
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    ```

    On macOS/Linux (bash):

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

    You should see `(venv)` at the beginning of your terminal prompt.

3.  **Install dependencies:**
    Ensure your `requirements.txt` is up-to-date and does not have conflicting packages (see previous discussions about `python-semrush` and `requests` if you encounter issues).

    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Database Settings (if not using default SQLite):**
    The project is configured to use SQLite by default (`db.sqlite3`). If you want to use a different database (like PostgreSQL for local development, similar to the Docker setup), you'll need to:

    - Install the appropriate database driver (e.g., `psycopg2-binary` for PostgreSQL).
    - Update the `DATABASES` setting in `config/settings.py` with your database credentials.

5.  **Apply database migrations:**
    This command creates the necessary database tables based on your models.

    ```bash
    python manage.py migrate
    ```

6.  **Create a superuser (optional but recommended):**
    This allows you to access the Django admin interface.

    ```bash
    python manage.py createsuperuser
    ```

    Follow the prompts to set a username, email (optional), and password.

7.  **Run the development server:**

    ```bash
    python manage.py runserver
    ```

    By default, the server will run at `http://127.0.0.1:8000/`.

8.  **Access the application and API documentation:**
    - Application (API endpoints): `http://127.0.0.1:8000/api/`
    - Swagger UI: `http://127.0.0.1:8000/swagger/`
    - ReDoc UI: `http://127.0.0.1:8000/redoc/`
    - Django Admin: `http://127.0.0.1:8000/admin/` (login with your superuser credentials)

**Stopping the development server:**

Press `Ctrl+C` in the terminal where the server is running.

**Deactivating the virtual environment:**

When you're done working on the project, you can deactivate the virtual environment:

```bash
deactivate
```

## Running with Docker

This project includes a `Dockerfile` and `docker-compose.yml` for easy containerization.

**Prerequisites:**

- Docker installed
- Docker Compose installed

**Steps to run:**

1.  **Build and run the containers:**
    Open a terminal in the project root directory and run:

    ```bash
    docker-compose up --build
    ```

    This command will build the Docker image for the web service (if it doesn't exist or if `Dockerfile` changed) and start both the `web` and `db` services.

2.  **Access the application:**
    Once the containers are up and running, you can access the application at `http://127.0.0.1:8000` in your web browser.
    The API documentation will be available at `http://127.0.0.1:8000/swagger/`.

3.  **Applying migrations (if needed):**
    If you need to apply database migrations (e.g., after pulling changes or for the first run if not handled automatically by your entrypoint script), you can run:

    ```bash
    docker-compose exec web python manage.py migrate
    ```

4.  **Creating a superuser (if needed):**
    To create a superuser to access the Django admin panel:

    ```bash
    docker-compose exec web python manage.py createsuperuser
    ```

5.  **Stopping the containers:**
    To stop the containers, press `Ctrl+C` in the terminal where `docker-compose up` is running, or run:
    ```bash
    docker-compose down
    ```

**Database:**

The `docker-compose.yml` sets up a PostgreSQL database service.

- Database Name: `nis_db`
- User: `nis_user`
- Password: `nis_password`

The data is persisted in a Docker volume named `postgres_data`.

**Note on `settings.py` for Docker:**

For the Django application to connect to the PostgreSQL database running in another Docker container, your `settings.py` should be configured to use the service name (`db`) as the host for the database connection. Example:

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'nis_db',
        'USER': 'nis_user',
        'PASSWORD': 'nis_password',
        'HOST': 'db',
        'PORT': '5432',
    }
}
```

Make sure your `settings.py` reflects this configuration when running with Docker. If you are using SQLite for local development outside Docker, you might need to adjust your settings or use environment variables to switch configurations.

---

## API Documentation (Swagger)

This project uses Swagger (via `drf-yasg`) to provide interactive API documentation.

Once the development server is running, you can access the Swagger UI at:

- `http://127.0.0.1:8000/swagger/`

And the ReDoc documentation at:

- `http://127.0.0.1:8000/redoc/`

---

## Postman Collection and API Endpoints

This section details the available API endpoints and provides examples for use with Postman.

### Authentication

#### 1. Register User

- **Endpoint:** `POST /api/register/`
- **Description:** Registers a new user.
- **Request Body (JSON):**
  ```json
  {
    "username": "newuser",
    "password": "password123",
    "email": "newuser@example.com"
  }
  ```
- **Response:** User details upon successful registration.

#### 2. Login User (Obtain Token)

- **Endpoint:** `POST /api/login/`
- **Description:** Authenticates a user and returns an access and refresh token.
- **Request Body (JSON):**
  ```json
  {
    "username": "aldan",
    "password": "Password" //admin
  }
  ```
- **Response (JSON):**
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Categories

#### 3. List Categories

- **Endpoint:** `GET /api/categories/`
- **Description:** Retrieves a list of all categories.
- **Authentication:** None
- **Response:** A list of category objects.

### Lessons

#### 4. List Lessons

- **Endpoint:** `GET /api/lessons/`
- **Description:** Retrieves a list of lessons.
  - Unauthenticated users see only 'public' lessons.
  - Authenticated non-staff users see 'public' and 'registered' lessons.
  - Staff users see all lessons.
- **Query Parameters:**
  - `category` (integer, optional): Filter lessons by category ID.
- **Authentication:** Optional (behavior changes based on authentication status)
- **Response:** A list of lesson objects.

#### 5. Retrieve Lesson Detail

- **Endpoint:** `GET /api/lessons/<lesson_id>/`
- **Description:** Retrieves details of a specific lesson. Access control is enforced based on the lesson's `access_type` and user authentication.
  - `public`: Accessible to all.
  - `registered`: Accessible to authenticated users.
  - `token`: Accessible if the correct `token` query parameter is provided or if the user is staff.
- **Path Parameters:**
  - `lesson_id` (integer): The ID of the lesson.
- **Query Parameters (for 'token' access_type):**
  - `token` (string): The access token for the lesson.
- **Authentication:** Optional (required for 'registered' and potentially for 'token' access types if not staff).
- **Response:** Lesson object details.

#### 6. Create Lesson

- **Endpoint:** `POST /api/lessons/create/`
- **Description:** Creates a new lesson. The owner will be the authenticated user.
- **Authentication:** Required (Bearer Token).
- **Request Body (form-data):**
  - `title` (string, required)
  - `description` (string, required)
  - `video` (file, required): The video file for the lesson.
  - `category` (integer, required): The ID of the category this lesson belongs to.
  - `access_type` (string, required): One of 'public', 'registered', 'token'.
  - `token` (string, optional): Required if `access_type` is 'token'.
- **Response:** The created lesson object.
- **Example Postman Setup:**
  - Set Method to `POST`.
  - Set URL to `[domain]/api/lessons/create/`.
  - In the "Authorization" tab, select "Bearer Token" and paste your access token.
  - In the "Body" tab, select "form-data".
  - Add the fields as described above, making sure to select "File" type for the `video` field.

### Quizzes

#### 7. Retrieve Quiz Detail

- **Endpoint:** `GET /api/lessons/<lesson_id>/quiz/`
- **Description:** Retrieves the quiz associated with a specific lesson.
- **Path Parameters:**
  - `lesson_id` (integer): The ID of the lesson.
- **Authentication:** Depends on the lesson's access settings.
- **Response:** Quiz object details.

#### 8. Submit Quiz

- **Endpoint:** `POST /api/lessons/<lesson_id>/quiz/submit/`
- **Description:** Submits answers for a quiz and records the result.
- **Authentication:** Required (Bearer Token).
- **Path Parameters:**
  - `lesson_id` (integer): The ID of the lesson whose quiz is being submitted.
- **Request Body (JSON):**
  ```json
  {
    "answers": [1, 3, 5] // Array of selected answer IDs
  }
  ```
- **Response (JSON):**
  ```json
  {
    "score": 85.5
  }
  ```

#### 9. Quiz Analytics

- **Endpoint:** `GET /api/lessons/<lesson_id>/quiz/analytics/`
- **Description:** Retrieves analytics for a quiz, including average score and number of attempts.
- **Path Parameters:**
  - `lesson_id` (integer): The ID of the lesson.
- **Authentication:** None (user-specific data like `user_last_attempt` will only be present if authenticated).
- **Response (JSON):**
  ```json
  {
    "average_score": 75.2,
    "attempts_count": 120,
    "user_last_attempt": {
      // Null if user is not authenticated or has no attempts
      "id": 10,
      "user": 1,
      "quiz": 5,
      "score": 90.0,
      "passed_at": "2023-10-27T10:30:00Z"
    }
  }
  ```

#### 10. Create Quiz

- **Endpoint:** `POST /api/lessons/<lesson_id>/quiz/create/`
- **Description:** Creates a new quiz for a lesson. Only the lesson owner can create a quiz. A lesson can only have one quiz.
- **Authentication:** Required (Bearer Token - must be lesson owner).
- **Path Parameters:**
  - `lesson_id` (integer): The ID of the lesson to create the quiz for.
- **Request Body (JSON):**
  ```json
  {
    "title": "Chapter 1 Review Quiz",
    "questions": [
      {
        "text": "What is the capital of France?",
        "answers": [
          { "text": "Paris", "is_correct": true },
          { "text": "London", "is_correct": false },
          { "text": "Berlin", "is_correct": false }
        ]
      },
      {
        "text": "What is 2 + 2?",
        "answers": [
          { "text": "3", "is_correct": false },
          { "text": "4", "is_correct": true },
          { "text": "5", "is_correct": false }
        ]
      }
    ]
  }
  ```
- **Response:** The created quiz object with its questions and answers.
- **Example Postman Setup:**
  - Set Method to `POST`.
  - Set URL to `[domain]/api/lessons/<lesson_id>/quiz/create/` (replace `<lesson_id>` with an actual ID).
  - In the "Authorization" tab, select "Bearer Token" and paste your access token (must be the owner of the lesson).
  - In the "Headers" tab, add `Content-Type` with value `application/json`.
  - In the "Body" tab, select "raw" and choose "JSON" from the dropdown. Paste the request body.

---

**Note:** Replace `[domain]` with the actual domain where your API is hosted (e.g., `http://127.0.0.1:8000`).
