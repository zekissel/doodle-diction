import time

import redis
from flask import Flask, request

app = Flask(__name__)
cache = redis.Redis(host='dbase', port=6379)

def get_hit_count():
    retries = 5
    while True:
        try:
            return cache.incr('hits')
        except redis.exceptions.ConnectionError as exc:
            if retries == 0:
                raise exc
            retries -= 1
            time.sleep(0.5)

@app.route('/')
def home():
    count = get_hit_count()
    return { 'test': count }