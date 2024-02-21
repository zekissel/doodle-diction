# syntax=docker/dockerfile:1
FROM python:3.10-alpine
WORKDIR /doodle/backend/

RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

EXPOSE 8000

RUN adduser -D api
USER api

CMD [ "gunicorn", "--bind", "0.0.0.0:8000", "wsgi:app" ]