import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from secrets import token_urlsafe
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client
import bcrypt

load_dotenv()

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials. Check your .env file.")

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Successfully connected to Supabase!")
except Exception as e:
    print(f"Error connecting to Supabase: {str(e)}")
    raise e

# Store reset tokens with expiry (in memory - will be cleared when server restarts)
reset_tokens = {}

def hash_password(password):
    # Convert the password to bytes
    password_bytes = password.encode('utf-8')
    # Generate salt and hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Return the hashed password as a string
    return hashed.decode('utf-8')

def verify_password(password, hashed_password):
    # Convert passwords to bytes
    password_bytes = password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    # Verify the password
    return bcrypt.checkpw(password_bytes, hashed_bytes)

#/api/home
@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message': "Hello World!"
    })

@app.route("/api/signup", methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        # Basic validation
        required_fields = ['firstName', 'lastName', 'username', 'email', 'password']
        if not all(key in data for key in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        try:
            # Check if email already exists
            existing_email = supabase.table('users').select('*').eq('email', data['email']).execute()
            if len(existing_email.data) > 0:
                return jsonify({'error': 'This email is already registered. Please use a different email or try logging in.'}), 400
            
            # Check if username already exists
            existing_username = supabase.table('users').select('*').eq('username', data['username']).execute()
            if len(existing_username.data) > 0:
                return jsonify({'error': 'This username is already taken. Please choose a different username.'}), 400
            
            # Hash the password before storing
            hashed_password = hash_password(data['password'])
            
            # Insert new user with hashed password and default role
            new_user = supabase.table('users').insert({
                'first_name': data['firstName'],
                'last_name': data['lastName'],
                'username': data['username'],
                'email': data['email'],
                'password': hashed_password,
                'role': 'public'  
            }).execute()
            
            return jsonify({
                'message': 'User registered successfully',
                'user': {
                    'firstName': data['firstName'],
                    'lastName': data['lastName'],
                    'username': data['username'],
                    'email': data['email'],
                    'role': 'public'
                }
            }), 201
            
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            return jsonify({'error': 'An error occurred during registration. Please try again.'}), 500
            
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({'error': 'Server error. Please try again later.'}), 500

@app.route("/api/login", methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['email', 'password']):
            return jsonify({'error': 'Missing email or password'}), 400
        
        try:
            # Find user by email
            result = supabase.table('users').select('*').eq('email', data['email']).execute()
            
            if len(result.data) == 0:
                return jsonify({'error': 'Invalid email or password'}), 401
            
            user = result.data[0]
            
            # Verify password
            if verify_password(data['password'], user['password']):
                return jsonify({
                    'message': 'Login successful',
                    'user': {
                        'firstName': user['first_name'],
                        'lastName': user['last_name'],
                        'username': user['username'],
                        'email': user['email'],
                        'role': user['role']  # Include role in response
                    }
                })
            else:
                return jsonify({'error': 'Invalid email or password'}), 401
                
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            return jsonify({'error': 'Login failed. Please try again.'}), 500
            
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({'error': 'Server error. Please try again later.'}), 500

@app.route("/api/request-reset", methods=['POST'])
def request_reset():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        try:
            # Check if user exists
            result = supabase.table('users').select('*').eq('email', email).execute()
            
            if len(result.data) == 0:
                # Don't reveal if email exists or not
                return jsonify({'message': 'If the email exists, a reset token will be sent'}), 200
            
            # Generate reset token
            reset_token = token_urlsafe(32)
            print(f"Generated token: {reset_token} for email: {email}")  # Debug print
            
            # Store token with expiry (1 hour)
            reset_tokens[reset_token] = {
                'email': email,
                'expiry': datetime.now() + timedelta(hours=1)
            }
            
            # Return the token directly
            return jsonify({
                'message': 'Password reset token generated',
                'token': reset_token
            }), 200
            
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            return jsonify({'error': 'Failed to process reset request'}), 500
            
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route("/api/reset-password", methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        email = data.get('email')
        new_password = data.get('newPassword')
        
        if not email or not new_password:
            return jsonify({'error': 'Email and new password are required'}), 400
        
        try:
            # Check if user exists
            result = supabase.table('users').select('*').eq('email', email).execute()
            
            if len(result.data) == 0:
                return jsonify({'error': 'Email not found'}), 404
            
            # Hash the new password
            hashed_password = hash_password(new_password)
            
            # Update password in database
            result = supabase.table('users').update({
                'password': hashed_password
            }).eq('email', email).execute()
            
            return jsonify({'message': 'Password updated successfully'}), 200
            
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            return jsonify({'error': 'Failed to update password'}), 500
            
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route("/api/test-db", methods=['GET'])
def test_db():
    try:
        # Try to fetch a single row from users table
        response = supabase.table('users').select("*").limit(1).execute()
        return jsonify({
            "message": "Database connection successful",
            "status": "connected"
        })
    except Exception as e:
        return jsonify({
            "message": f"Database connection failed: {str(e)}",
            "status": "error"
        }), 500

@app.route("/api/test-insert", methods=['GET'])
def test_insert():
    try:
        # Try a simple insert
        test_data = {
            'first_name': 'Test',
            'last_name': 'User',
            'username': 'testuser',
            'email': 'test@test.com',
            'password': 'password123'
        }
        
        print("Testing insert with data:", test_data)
        result = supabase.table('users').insert(test_data).execute()
        print("Insert result:", result)
        
        return jsonify({
            'message': 'Test insert successful',
            'result': result.data
        })
    except Exception as e:
        print(f"Test insert error: {type(e).__name__}", str(e))
        return jsonify({
            'error': f'Test insert failed: {str(e)}'
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=8080)
    