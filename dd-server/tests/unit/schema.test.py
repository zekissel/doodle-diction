from schema import Room

"""
*    GIVEN a Room model
*    WHEN a new Room is created
*    THEN check the id, name, pw, and capacity are defined correctly
"""
def test_new_room():
    
    room = Room(rID=1, rName='Room_Name', rPW='', rCap=4)
    assert room.rID == 1
    assert room.rName == 'Room_Name'
    assert room.rPW == ''
    assert room.rCap == 4