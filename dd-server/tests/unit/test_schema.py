import unittest
from unittest.mock import Mock
from schema import Room, User, Game, Chat, Settings, index_models

class TestDatabaseSchema(unittest.TestCase):

    def setUp(self):
        index_models()

    def tearDown(self):
        pass
    
    def test_new_user(self):
        """
        *  GIVEN a User model
        *  WHEN a new User is created
        *  THEN check the id, name, and ready are defined correctly
        """
        user = User(uID=0, name='User_Name', ready=False)
        self.assertEqual(user.uID, '0')
        self.assertEqual(user.name, 'User_Name')
        self.assertFalse(user.ready)

    def test_new_game(self):
        """
        *  GIVEN a Game model
        *  WHEN a new Game is created
        *  THEN check the id and data fields are defined correctly
        """
        game = Game(gID=0)
        self.assertEqual(game.gID, '0')
        self.assertEqual(game.data, [])

    def test_new_chat(self):
        """
        *  GIVEN a Chat model
        *  WHEN a new Chat is created
        *  THEN check the id, stamp, author, and message are defined correctly
        """
        user = User(uID=0, name='User_Name', ready=False)
        chat = Chat(cID=1, stamp='00:00:00', author=user, message='Hello, World!')
        self.assertEqual(chat.cID, '1')
        self.assertEqual(chat.stamp, '00:00:00')
        self.assertNotEqual(chat.author, None)
        self.assertEqual(chat.message, "Hello, World!")
    
    def test_new_room(self):
        """
        *  GIVEN a Room model
        *  WHEN a new Room is created
        *  THEN check the id, name, pw, host, round, and capacity are defined correctly
        """
        user = User(uID=0, name='User_Name', ready=False)
        room = Room(rID=1, name='Room_Name', pw='', cap=4, host=user)
        self.assertEqual(room.rID, 1)
        self.assertEqual(room.name, 'Room_Name')
        self.assertEqual(room.pw, '')
        self.assertEqual(room.cap, 4)
        self.assertEqual(room.cur_round, 0)
        self.assertNotEqual(room.host, None)
        self.assertEqual(room.users, [])
        self.assertEqual(room.chats, [])
        self.assertEqual(room.games, [])
        self.assertNotEqual(room.settings, None)

    def test_new_settings(self):
        """
        *  GIVEN a Settings model
        *  WHEN a new Settings is created
        *  THEN check the max rounds, timer, and chat fields are defined correctly
        """
        settings = Settings()
        self.assertEqual(settings.max_rounds, 5)
        self.assertEqual(settings.round_timer, 0)
        self.assertTrue(settings.enable_chat)

if __name__ == '__main__':
    unittest.main()