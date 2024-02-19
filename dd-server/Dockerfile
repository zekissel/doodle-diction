# syntax=docker/dockerfile:1
FROM python:3.10-alpine
WORKDIR /doodle/backend/

RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

ENV FLASK_APP=server.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=8000
EXPOSE 8000

RUN adduser -D api
USER api

CMD ["flask", "run"]