import unittest
import requests
from ..schema import User, Room, index_models

unittest.TestLoader.sortTestMethodsUsing = None

class TestAPIServerEmpty(unittest.TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        pass
    
    def test_get_public_rooms_none(self):
        """
        *  GIVEN the server is running and no rooms exist
        *  WHEN a GET request is made to '/join'
        *  THEN the server should return an empty list
        """
        r = requests.get("http://localhost:8000/join").json()
        self.assertEqual(r['rooms'], [])

class TestAPIServer(unittest.TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        pass
    
    def test_host_public_room(self):
        """
        *  GIVEN the server is running and no rooms exist
        *  WHEN a POST request is made to '/host' with a room name and host name
        *  THEN the server should return a r_key, u_key, and u_id
        """
        data = { 'name': 'Test Room', 'host': 'Test Host' }
        r = requests.post("http://localhost:8000/host", json=data).json()
        self.assertEqual(r['u_id'], 0)
        self.assertIn('r_key', r.keys())
        self.assertIn('u_key', r.keys())
        self.host_key = r['u_key']
        self.room_key = r['r_key']

    def test_join_public_room(self):
        """
        *  GIVEN the server is running and one room exists
        *  WHEN a POST request is made to '/join' with a room name and user name
        *  THEN the server should return a r_key, u_key, and u_id
        """
        data = { 'name': 'Test Room', 'user': 'Test User', 'pw': '' }
        r = requests.post("http://localhost:8000/join", json=data).json()
        self.assertEqual(r['u_id'], 1)
        self.assertIn('r_key', r.keys())
        self.assertIn('u_key', r.keys())
        self.assertNotEqual(self.host_key, r['u_key'])
        self.user_key = r['u_key']

    def test_close_room(self):
        """
        *  GIVEN the server is running and one room exists
        *  WHEN a POST request is made to '/exit' with the room and host keys
        *  THEN the server should return a 200 status code
        """
        r = requests.post("http://localhost:8000/exit", json={ 'r_key': self.room_key, 'u_key': self.host_key }).json()
        self.assertEqual(r.status_code, 200)

if __name__ == '__main__':
    unittest.main()