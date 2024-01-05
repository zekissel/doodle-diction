# syntax=docker/dockerfile:1
FROM python:3.10-alpine
WORKDIR /doodle/backend/

ENV FLASK_APP=server.py
ENV FLASK_RUN_HOST=0.0.0.0

RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip install flask-cors

COPY . .

EXPOSE 5000
CMD ["flask", "run"]