import unittest
import json
from server import app

class FlaskServerTests(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
    
    def test_home_endpoint(self):
        response = self.app.get('/api/home')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], 'Hello World!')
    
    def test_signup_endpoint(self):
        # Test successful signup
        payload = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'password123'
        }
        response = self.app.post('/api/signup',
                               data=json.dumps(payload),
                               content_type='application/json')
        self.assertEqual(response.status_code, 201)
        
        # Test duplicate email
        response2 = self.app.post('/api/signup',
                                data=json.dumps(payload),
                                content_type='application/json')
        self.assertEqual(response2.status_code, 400)
    
    def test_login_endpoint(self):
        # First create a user
        signup_payload = {
            'name': 'Login Test',
            'email': 'login@example.com',
            'password': 'password123'
        }
        self.app.post('/api/signup',
                     data=json.dumps(signup_payload),
                     content_type='application/json')
        
        # Test successful login
        login_payload = {
            'email': 'login@example.com',
            'password': 'password123'
        }
        response = self.app.post('/api/login',
                               data=json.dumps(login_payload),
                               content_type='application/json')
        self.assertEqual(response.status_code, 200)
        
        # Test invalid password
        login_payload['password'] = 'wrongpassword'
        response = self.app.post('/api/login',
                               data=json.dumps(login_payload),
                               content_type='application/json')
        self.assertEqual(response.status_code, 401)

if __name__ == '__main__':
    unittest.main() 