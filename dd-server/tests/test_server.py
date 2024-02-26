import unittest
import requests
from ..schema import User, Room, index_models

class TestAPIServer(unittest.TestCase):

    def setUp(self):
        self.user = User(uID='0', name='test-host', ready=False)
        self.user.save()

    def tearDown(self):
        User.delete(self.user.pk)
    
    def test_get_public_rooms_none(self):
        """
        *  GIVEN the server is running and no rooms exist
        *  WHEN a GET request is made to '/join'
        *  THEN the server should return an empty list
        """
        r = requests.get("http://localhost:8000/join").json()
        self.assertEqual(r['rooms'], [])
    
    def test_get_public_rooms_some(self):
        """
        *  GIVEN the server is running and some rooms exist
        *  WHEN a GET request is made to '/join'
        *  THEN the server should return a list of public rooms
        """
        room = Room(name='test-room', cap=4, host=self.user, rID=0)
        room.save()

        r = requests.get("http://localhost:8000/join").json()
        self.assertEqual(len(r['rooms']), 1)

        Room.delete(room.pk)


if __name__ == '__main__':
    unittest.main()