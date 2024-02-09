from schema import Room, User

"""
*    GIVEN a User model
*    WHEN a new User is created
*    THEN check the id, name, and ready are defined correctly
"""
def test_new_user():
        
    user = User(uID=0, name='User_Name', ready=False)
    user.save()
    assert user.uID == 0
    assert user.name == 'User_Name'
    assert user.ready == False

"""
*    GIVEN a Room model
*    WHEN a new Room is created
*    THEN check the id, name, pw, host, round, and capacity are defined correctly
"""
def test_new_room():
    
    room = Room(rID=1, name='Room_Name', pw='', cap=4)
    assert room.rID == 1
    assert room.name == 'Room_Name'
    assert room.pw == ''
    assert room.cap == 4
    assert room.g_round == 0
    assert room.host == None