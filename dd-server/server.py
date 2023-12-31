import datetime

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
        return { 'r_key': room.pk, 'u_key': host.pk }, 200
    
    except ValidationError: return { 'err': 'Bad request' }, 400
    

@app.route('/exit', methods=['POST'])
def leave():
    try:
        room = Room.get(request.json['r_key'])
    except ValidationError: return { 'err' : 'Room not found' }, 404

    if room.host.pk == request.json['u_key']:
        Room.delete(request.json['r_key'])
        return { 'msg': 'Room deleted' }, 200
    
    else:
        room.users = [u for u in room.users if u.uID != request.json['u_key']]
        User.delete(request.json['u_key'])
        room.save()
        return { 'msg': 'Exited room' }, 200


@app.route('/join', methods=['GET', 'POST'])
def join():

    if request.method == 'GET':
        rooms = Room.find(Room.cap > 0).all()
        resp = [r.dict() for r in rooms]
        for r in resp:
            del r['pk']
            del r['pw']
            del r['host']
            for u in r['users']:
                del u['pk']
        return { 'rooms': resp }, 200

    try:
        room = Room.find((Room.name == request.json['name'])).all()
        room = room[0]
    except ValidationError: return { 'err': 'Invalid room name' }

    if 'pw' in room and room['pw'] != request.form['pw']:
        if request.form['pw'] == '': return { 'auth': 'Enter room password' }, 401
        else: return { 'err': 'Incorrect password' }, 403

    uID = len(room.users) + 1
    user = User(**{ 'uID': uID, 'name': 'Player {}'.format(uID + 1), 'ready': False })
    user.save()

    room.users.append(user)
    room.save()

    return { 'r_key': room.pk, 'u_key': user.pk }, 200


@app.route('/lobby/<r_key>/<u_key>', methods=['GET'])
def lobby(r_key: str, u_key: str):
    try:
        room = Room.get(r_key)
    except ValidationError: return { 'err': 'Room not found' }, 404

    try:
        user = User.get(u_key)
    except ValidationError: return { 'err': 'User not found' }, 404

    users = [u.dict() for u in room.users]
    chats = [c.dict() for c in room.chats]
    for u in users: del u['pk']
    #for c in chats: 
    #    del c.author['pk']

    return { 'users': users, 'chats': chats, 'uID': user.uID, 'round': 0 }, 200


@app.route('/lobby/<r_key>/msg', methods=['POST'])
def message(r_key: int):
    try:
        room = Room.get(r_key)
    except ValidationError: return { 'err': 'Room not found' }, 404

    if request.json['u_key'] not in [u.pk for u in room.users]:
        return { 'err': 'User not found' }, 404
    
    current_time = datetime.datetime.now()
    formatted_hour = current_time.strftime('%H')
    formatted_hour = int(formatted_hour) - 5
    if formatted_hour < 0: formatted_hour += 24
    formatted_time = current_time.strftime("%M:%S")
    formatted_time = str(formatted_hour) + ':' + formatted_time
    assert(type(formatted_time) == str)
    chat = Chat(**{ 'cID': len(room.chats) + 1, 'stamp': formatted_time, 'author': User.get(request.json['u_key']), 'message': request.json['message'] })
    chat.save()
    room.chats.append(chat)
    room.save()

    return { 'success': 'message sent' }, 200

@app.route('/lobby/ready', methods=['POST'])
def ready(room_id: int):

    return {}