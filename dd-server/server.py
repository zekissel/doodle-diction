import datetime

from pydantic import ValidationError
from flask import Flask, request, send_from_directory
from flask_cors import CORS
from schema import User, Chat, Game, Settings, Room, index_models, connect


def get_current_time():
    current_time = datetime.datetime.now()
    formatted_hour = current_time.strftime('%H')
    formatted_hour = int(formatted_hour) - 5
    if formatted_hour < 0: formatted_hour += 24
    formatted_time = current_time.strftime("%M:%S")
    formatted_time = str(formatted_hour) + ':' + formatted_time
    return formatted_time

def server_chat(message: str, room: Room):
    server = User(**{ 'uID': '-1', 'name': '', 'ready': False })
    room.chats.append(Chat(**{ 
            'cID': len(room.chats) + 1, 
            'stamp': get_current_time(), 
            'author': server, 
            'message': message
        }))
    room.save()


index_models()
cache = connect()
app = Flask(__name__, static_folder='dist')
CORS(app, origins=['*'], methods=['GET', 'POST', 'PUT', 'DELETE'])


@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/assets/<path:filename>')
def send_assets(filename):
    return send_from_directory(app.static_folder+'/assets', filename)



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

        server_chat(f'{host.name} is now hosting the lobby.', room)
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
        Settings.delete(room.settings.pk)
        Room.delete(request.json['r_key'])
        return { 'msg': 'Room removed' }, 200
    
    else:
        room.users = [u for u in room.users if u.pk != request.json['u_key']]
        u = User.get(request.json['u_key'])
        room.exited_users.append(u)
        room.save()
        server_chat(f'{u.name} has left the room', room)

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
    
    if room.cur_round > 0:
        return { 'err': 'Game in progress' }, 403
    
    formpw = request.json['pw']
    roompw = room.pw if room.pw != None else ''
    if formpw != roompw:
        if formpw == '': return { 'auth': 'Enter room password', roompw: formpw }, 401
        else: return { 'err': 'Incorrect password' }, 403

    user = User(**{ 
        'uID': len(room.users), 
        'name': request.json['user'], 
        'ready': False 
    })
    user.save()

    room.users.append(user)
    room.save()
    server_chat(f'{user.name} has joined the room', room)

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
    for u in users: del u['pk']

    chats = [c.dict() for c in room.chats]
    for c in chats: del c['author']['pk']

    if room.cur_round < 2: pa = ''
    else: 
        index = (int(user.uID) + (room.cur_round - 1)) % len(room.users)
        pa = room.games[index].data[-1]

    return { 'users': users, 'chats': chats, 'uID': user.uID, 'ready': user.ready, 'round': room.cur_round, 'prev_answer': pa, 'chat': room.settings.enable_chat }, 200


@app.route('/lobby/<r_key>/msg', methods=['POST'])
def message(r_key: int):
    try:
        room = Room.get(r_key)
    except ValidationError: return { 'err': 'Room not found' }, 404

    if request.json['u_key'] not in [u.pk for u in room.users]:
        return { 'err': 'User not found' }, 404
    
    chat = Chat(**{ 
        'cID': len(room.chats) + 1, 
        'stamp': get_current_time(), 
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

    start = True
    for u in room.users: 
        if u.pk == user.pk: 
            u.ready = request.json['ready']
            u.save()
        if not u.ready: start = False
    
    if start: 
        if room.cur_round < 0:
            for g in room.games: Game.delete(g.pk)
            room.games = []
            room.save()
        
        for u in room.users: 
            u.ready = False
            u.save()
            if room.cur_round == 0: room.games.append(Game(**{ 'gID': u.uID, 'data': [] }))

        room.cur_round += 1

    room.save()

    return { 'ready': user.ready }, 200


@app.route('/submit', methods=['POST'])
def submit():
    try:
        user = User.get(request.json['u_key'])
    except ValidationError: return { 'err': 'User not found' }, 404
    try:
        room = Room.get(request.json['r_key'])
    except ValidationError: return { 'err': 'Room not found' }, 404

    index = (int(user.uID) + (room.cur_round - 1)) % len(room.users)
    
    room.games[index].data.append(request.json['answer'])
    for u in room.users:
        if u.pk == user.pk:
            u.ready = True
            u.save()
    room.save()

    advance = True
    for u in room.users:
        if u.ready == False: advance = False

    if advance:
        for u in room.users: 
            u.ready = False
            u.save()
        if room.cur_round < room.settings.max_rounds:
            room.cur_round += 1
        else:
            room.cur_round = -1
    
    room.save()
    return { 'ok': 'Answer submitted' }, 200


@app.route('/settings/<r_key>/<u_key>', methods=['GET', 'POST'])
def settings(r_key: str, u_key: str):
    if request.method == 'GET':
        try:
            room = Room.get(r_key)
            if room.host.pk != u_key:
                return { 'err': 'Not authorized' }, 403
        except ValidationError: return { 'err': 'Room not found' }, 404

        cap = room.cap if room.cap > 0 else -1 * room.cap
        vis = 0 if room.cap > 0 else 1

        return { 'max_players': cap, 'visibility': vis, 'round_timer': room.settings.round_timer, 'max_rounds': room.settings.max_rounds, 'chat': room.settings.enable_chat }, 200
    
    #else, POST update to settings
    try:
        room = Room.get(r_key)
        if room.host.pk != u_key:
            return { 'err': 'Not authorized' }, 403
    except ValidationError: return { 'err': 'Room not found' }, 404

    public = request.json['visibility'] == 0
    room.cap = request.json['max_players'] if public else -1 * request.json['max_players']
    room.settings.round_timer = request.json['round_timer']
    room.settings.max_rounds = request.json['max_rounds']
    room.settings.enable_chat = request.json['chat'] == True
    room.settings.save()
    room.save()

    return { 'ok': 'Settings updated' }, 200

@app.route('/results/<r_key>', methods=['GET'])
def results(r_key: str):
    try:
        room = Room.get(r_key)
    except ValidationError: return { 'err': 'Room not found' }, 404

    if room.cur_round != -1:
        return { 'err': 'Game in progress' }, 403
    
    return { 'results': [g.dict() for g in room.games] }, 200