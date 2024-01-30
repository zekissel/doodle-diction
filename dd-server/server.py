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
        host = User(**{ 'uID': 0, 'name': request.json['host'], 'ready': False })
        host.save()

        request.json['host'] = host
        request.json['rID'] = cache.incr('count')
        
        room = Room(**request.json)
        room.users.append(host)
        room.save()
        return { 'r_key': room.pk, 'u_key': host.pk, 'u_id': host.uID }, 200
    
    except ValidationError: return { 'err': 'Bad request' }, 400
    

@app.route('/exit', methods=['POST'])
def leave():
    try:
        room = Room.get(request.json['r_key'])
    except ValidationError: return { 'err' : 'Room not found' }, 404

    if room.host.pk == request.json['u_key']:
        for u in room.users: User.delete(u.pk)
        for c in room.chats: Chat.delete(c.pk)
        for g in room.games: Game.delete(g.pk)
        Room.delete(request.json['r_key'])
        return { 'msg': 'Room deleted' }, 200
    
    else:
        room.users = [u for u in room.users if u.pk != request.json['u_key']]
        room.save()
        User.delete(request.json['u_key'])
        return { 'msg': 'Exited room' }, 200


@app.route('/join', methods=['GET', 'POST'])
def join():

    # return list of publicly avaible games
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

    # otherwise, if POST, attempt to add use to room
    try:
        query = Room.find((Room.name == request.json['name'])).all()
        if len(query) == 0: return { 'err': 'Room not found' }, 404
        room = query[0]
    except ValidationError: return { 'err': 'Invalid room name' }

    capacity = room.cap if room.cap > 0 else -1 * room.cap
    if len(room.users) >= capacity:
        return { 'err': 'Room is full' }, 403
    
    formpw = request.json['pw']
    roompw = room.pw if room.pw != None else ''
    if formpw != roompw:
        if formpw == '': return { 'auth': 'Enter room password', roompw: formpw }, 401
        else: return { 'err': 'Incorrect password' }, 403

    uID = len(room.users)
    user = User(**{ 'uID': uID, 'name': request.json['user'], 'ready': False })
    user.save()

    room.users.append(user)
    room.save()

    return { 'r_key': room.pk, 'u_key': user.pk, 'u_id': user.uID }, 200


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
    for c in chats: del c['author']['pk']

    return { 'users': users, 'chats': chats, 'uID': user.uID, 'ready': user.ready, 'round': room.g_round }, 200


@app.route('/lobby/<r_key>/msg', methods=['POST'])
def message(r_key: int):
    try:
        room = Room.get(r_key)
    except ValidationError: return { 'err': 'Room not found' }, 404

    if request.json['u_key'] not in [u.pk for u in room.users]:
        return { 'err': 'User not found' }, 404
    
    # format timestamp
    current_time = datetime.datetime.now()
    formatted_hour = current_time.strftime('%H')
    formatted_hour = int(formatted_hour) - 5
    if formatted_hour < 0: formatted_hour += 24
    formatted_time = current_time.strftime("%M:%S")
    formatted_time = str(formatted_hour) + ':' + formatted_time
    
    chat = Chat(**{ 
        'cID': len(room.chats) + 1, 
        'stamp': formatted_time, 
        'author': User.get(request.json['u_key']), 
        'message': request.json['message'] 
    })
    chat.save()
    room.chats.append(chat)
    room.save()

    return { 'success': 'message sent' }, 200

@app.route('/ready', methods=['POST'])
def ready():
    try:
        user = User.get(request.json['u_key'])
    except ValidationError: return { 'err': 'User not found' }, 404
    try:
        room = Room.get(request.json['r_key'])
    except ValidationError: return { 'err': 'Room not found' }, 404

    user.ready = request.json['ready']
    user.save()

    for u in room.users: 
        if u.pk == user.pk: u.ready = request.json['ready']
    room.save()

    return { 'ready': user.ready }, 200