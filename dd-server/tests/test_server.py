import unittest
from ..schema import User, Room, index_models

class TestAPIServer(unittest.TestCase):

    def setUp(self):
        self.user = User(uID='0', name='test-host', ready=False)
        self.user.save()

    def tearDown(self):
        pass
    
    def test_get_public_rooms_none(self):
        """
        *  GIVEN a the server is running and no rooms exist
        *  WHEN a a GET request is made to '/join'
        *  THEN the server should return an empty list
        """
        pass
    
    def test_get_public_rooms_some(self):
        """
        *  GIVEN a the server is running and some rooms exist
        *  WHEN a a GET request is made to '/join'
        *  THEN the server should return a list of public rooms
        """
        pass

if __name__ == '__main__':
    unittest.main()