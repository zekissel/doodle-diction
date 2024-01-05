import time

from pydantic import ValidationError
from flask import Flask, request
from flask_cors import CORS
from schema import User, Chat, Game, Room, index_models, connect


app = Flask(__name__)
index_models()
CORS(app, origins=['http://localhost:8080'], methods=['GET', 'POST', 'PUT', 'DELETE'])
cache = connect()


@app.route('/host', methods=['POST'])
def host():

    if len(Room.find((Room.name == request.json['name'])).all()) > 0:
        return { 'err': 'Room key in use' }
    
    try:
        host = User(**{ 'uID': 0, 'name': 'Player 1', 'ready': False })
        host.save()

        request.json['host'] = host
        rid = cache.incr('count')
        request.json['rID'] = rid
        
        room = Room(**request.json)
        room.users.append(host)
        room.save()
        return { 'rKey': room.pk, 'uKey': host.pk }, 200
    
    except ValidationError: return { 'err': 'Bad request' }, 400
    

@app.route('/exit', methods=['DELETE', 'POST'])
def leave():
    try:
        room = Room.get(request.json['rKey'])
    except ValidationError: return { 'err' : 'Room not found' }, 404

    if room.host == request.json['uKey']:
        Room.delete(request.json['rKey']);
        return { 'msg': 'Room deleted' }, 200
    
    else:
        room.users = [u for u in room.users if u.uID != request.json['uKey']]
        room.save()
        return { 'msg': 'Exited room' }, 200


@app.route('/join', methods=['GET', 'POST'])
def join():

    if request.method == 'GET':
        rooms = Room.find(Room.cap > 0).all()
        resp = [r.dict() for r in rooms]
        return { 'rooms': resp }, 200

    room = Room.find((Room.name == request.json['name'])).all()
    if len(room) < 1:
        return { 'err': 'Invalid room name' }

    if room['pw'] != request.form['pw']:
        if request.form['pw'] == '': return { 'auth': 'Enter room password' }, 401
        else: return { 'err': 'Incorrect password' }, 403

    uID = len(room.users) + 1
    user = User({ 'uID': uID, 'name': 'Player {}'.format(uID + 1), 'ready': False })
    user.save()

    room.users.append(user)
    room.save()

    return { 'rKey': room.pk, 'uKey': user.pk }, 200


@app.route('/lobby/<r_key>', methods=['GET'])
def lobby(r_key: str):

    return { 'test': 'ok' }, 200


@app.route('/lobby/msg', methods=['POST'])
def message(room_id: int):

    return {}

@app.route('/lobby/ready', methods=['POST'])
def ready(room_id: int):

    return {}