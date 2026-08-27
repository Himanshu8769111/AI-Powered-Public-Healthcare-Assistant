import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User, HealthRecord, Reminder
from nlp_service import analyze_symptoms
from datetime import timedelta
import datetime
import requests
from dotenv import load_dotenv

# Ensure .env is loaded from the backend directory
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# SMTP Configuration
SMTP_EMAIL = os.environ.get('SMTP_EMAIL')
SMTP_APP_PASSWORD = os.environ.get('SMTP_APP_PASSWORD')
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_smtp_email(to_email, subject, text_content):
    """Utility function to send email via SMTP"""
    print("\n" + "="*60, flush=True)
    print("[EMAIL] OUTGOING EMAIL PROTOCOL", flush=True)
    print(f"To:      {to_email}", flush=True)
    print(f"Subject: {subject}", flush=True)
    print(f"Body:\n{text_content}", flush=True)
    print("="*60 + "\n", flush=True)
    
    if not SMTP_EMAIL or not SMTP_APP_PASSWORD:
        print("SMTP ERROR: No Email or App Password configured", flush=True)
        return False
        
    try:
        msg = MIMEMultipart()
        msg['From'] = f"MedAssist AI <{SMTP_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(text_content, 'plain'))
        
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        # Remove spaces from the app password if the user pasted them
        password = SMTP_APP_PASSWORD.replace(" ", "")
        server.login(SMTP_EMAIL, password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"SMTP EXCEPTION: {str(e)}")
        return False

# Core Configuration
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID') or os.environ.get('VITE_GOOGLE_CLIENT_ID')
DATABASE_URL = os.environ.get('DATABASE_URL')


def normalize_postgres_url(uri):
    if not uri or not uri.startswith('postgres'):
        return uri
    parsed = urlparse(uri)
    query = dict(parse_qsl(parsed.query))
    if 'sslmode' not in query:
        query['sslmode'] = 'require'
        parsed = parsed._replace(query=urlencode(query))
    return urlunparse(parsed)

db_url_to_use = None
is_sqlite = False

if DATABASE_URL:
    postgres_url = normalize_postgres_url(DATABASE_URL)
    # Test connectivity to Supabase PostgreSQL database
    from sqlalchemy import create_engine
    try:
        print("Testing connection to Supabase PostgreSQL...")
        temp_engine = create_engine(postgres_url, connect_args={'sslmode': 'require', 'connect_timeout': 5})
        with temp_engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text('SELECT 1'))
        print("[OK] Database connection successful! Using Supabase PostgreSQL.")
        db_url_to_use = postgres_url
    except Exception as e:
        print(f"[WARN] Connection to external DATABASE_URL failed: {e}")
        print("[WARN] Falling back to local SQLite database (healthcare.db) for development.")
        is_sqlite = True
else:
    is_sqlite = True

if is_sqlite:
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_url_to_use = 'sqlite:///' + os.path.join(basedir, 'healthcare.db')
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_pre_ping': True}
else:
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'connect_args': {'sslmode': 'require'}
    }

app.config['SQLALCHEMY_DATABASE_URI'] = db_url_to_use
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT Configuration
app.config["JWT_SECRET_KEY"] = "super-secret-production-key-change-me"  # In prod, use .env
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)
jwt = JWTManager(app)

db.init_app(app)

with app.app_context():
    try:
        db.create_all()
        print("[OK] Database tables verified / created successfully.")
    except Exception as e:
        print(f"[WARN] Error initializing database tables: {e}")

# --- AUTHENTICATION ROUTES ---

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({"error": "Missing required fields"}), 400
            
        email = data['email'].strip().lower()
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "Email already exists"}), 400
            
        new_user = User(name=data['name'].strip(), email=email)
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.commit()
        
        access_token = create_access_token(identity=str(new_user.id))
        return jsonify({"message": "User created", "token": access_token, "user": {"name": new_user.name, "email": new_user.email}}), 201
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"SIGNUP ERROR:\n{error_details}")
        return jsonify({
            "error": "Internal server error during signup", 
            "details": str(e)
        }), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Missing fields"}), 400
            
        email = data['email'].strip().lower()
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(data['password']):
            return jsonify({"error": "Invalid email or password"}), 401
            
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"message": "Login successful", "token": access_token, "user": {"name": user.name, "email": user.email}}), 200
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"LOGIN ERROR:\n{error_details}")
        return jsonify({
            "error": "Internal server error during login", 
            "details": str(e)
        }), 500

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400
            
        email = email.strip().lower()
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "User with this email does not exist"}), 404
            
        import random
        otp = str(random.randint(1000, 9999))
        user.reset_otp = otp
        user.otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        db.session.commit()
        
        # Send OTP via Gmail SMTP
        subject = "Password Reset OTP - MedAssist AI"
        text_content = f"Hello {user.name},\n\nYour 4-digit OTP for password reset is: {otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email."
        
        if send_smtp_email(email, subject, text_content):
            return jsonify({"message": "OTP sent to your email"}), 200
        else:
            # Fallback for development/errors
            print(f"\n[FALLBACK] OTP for {email} is {otp}\n", flush=True)
            return jsonify({
                "message": "OTP generated but email failed. Check server logs.", 
                "otp_fallback": otp
            }), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        new_password = data.get('new_password')
        
        if not email or not otp or not new_password:
            return jsonify({"error": "Missing fields"}), 400
            
        email = email.strip().lower()
        otp = str(otp).strip()
        user = User.query.filter_by(email=email).first()
        if not user or user.reset_otp != otp:
            return jsonify({"error": "Invalid OTP or email"}), 400
            
        if user.otp_expiry < datetime.datetime.utcnow():
            return jsonify({"error": "OTP has expired"}), 400
            
        user.set_password(new_password)
        user.reset_otp = None
        user.otp_expiry = None
        db.session.commit()
        
        return jsonify({"message": "Password reset successful"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

import secrets
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

@app.route('/api/google-login', methods=['POST'])
def google_login():
    try:
        data = request.get_json()
        token = data.get('credential')
        
        if not token:
            return jsonify({"error": "Missing credential"}), 400
            
        try:
            # Verify the token with Google
            # Pass GOOGLE_CLIENT_ID to ensure the token was issued for our app
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
            
            email = idinfo['email']
            name = idinfo.get('name', 'Google User')
            picture = idinfo.get('picture', '') # Google provides profile picture URL
            
            # Check if user already exists
            user = User.query.filter_by(email=email).first()
            
            if not user:
                # Create a brand new account
                user = User(name=name, email=email, profile_photo=picture)
                user.set_password(secrets.token_urlsafe(32))
                db.session.add(user)
                db.session.commit()
            elif picture and not user.profile_photo:
                # Update photo if user exists but has none
                user.profile_photo = picture
                db.session.commit()
                
            access_token = create_access_token(identity=str(user.id))
            return jsonify({
                "message": "Google Login successful", 
                "token": access_token, 
                "user": {
                    "name": user.name, 
                    "email": user.email,
                    "profile_photo": user.profile_photo
                }
            }), 200
            
        except ValueError as e:
            print(f"GOOGLE VERIFY ERROR: {str(e)}")
            return jsonify({"error": "Invalid Google Token", "details": str(e)}), 401
            
    except Exception as e:
        import traceback
        print(f"GOOGLE LOGIN SYSTEM ERROR:\n{traceback.format_exc()}")
        return jsonify({"error": "Google Authentication system error", "details": str(e)}), 500


# --- DATA ROUTES ---

@app.route('/api/analyze-symptoms', methods=['POST'])
def handle_analyze_symptoms():
    # Public route, no JWT required
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    
    analysis = analyze_symptoms(data['text'])
    return jsonify(analysis)

@app.route('/api/records', methods=['GET', 'POST'])
@jwt_required()
def handle_records():
    user_id = int(get_jwt_identity())
    if request.method == 'GET':
        records = HealthRecord.query.filter_by(user_id=user_id).order_by(HealthRecord.date_added.desc()).all()
        return jsonify([{"id": r.id, "title": r.title, "description": r.description, "date_added": r.date_added.strftime("%Y-%m-%d %H:%M:%S")} for r in records])
    
    if request.method == 'POST':
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({"error": "Title required"}), 400
            
        new_record = HealthRecord(user_id=user_id, title=data['title'], description=data.get('description', ''))
        db.session.add(new_record)
        db.session.commit()
        return jsonify({"message": "Record added", "id": new_record.id}), 201

@app.route('/api/reminders', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def handle_reminders():
    user_id = int(get_jwt_identity())
    if request.method == 'GET':
        reminders = Reminder.query.filter_by(user_id=user_id).all()
        return jsonify([{"id": r.id, "medicine_name": r.medicine_name, "dosage": r.dosage, "time": r.time, "active": r.active} for r in reminders])
        
    if request.method == 'POST':
        data = request.get_json()
        new_reminder = Reminder(
            user_id=user_id, 
            medicine_name=data['medicine_name'], 
            dosage=data['dosage'], 
            time=data['time']
        )
        db.session.add(new_reminder)
        db.session.commit()
        return jsonify({"message": "Reminder created", "id": new_reminder.id}), 201

@app.route('/api/reminders/<int:reminder_id>', methods=['DELETE'])
@jwt_required()
def delete_reminder(reminder_id):
    user_id = int(get_jwt_identity())
    reminder = Reminder.query.filter_by(id=reminder_id, user_id=user_id).first()
    if reminder:
        db.session.delete(reminder)
        db.session.commit()
        return jsonify({"message": "Reminder deleted"})
    return jsonify({"error": "Not found or unauthorized"}), 404

@app.route('/api/sos', methods=['POST'])
@jwt_required()
def emergency_sos():
    try:
        user_id = int(get_jwt_identity())
        user = db.session.get(User, user_id)
        
        data = request.get_json()
        lat = data.get('lat', 'Unknown')
        lng = data.get('lng', 'Unknown')
        
        print(f"!!! EMERGENCY SOS TRIGGERED by {user.name} at LAT:{lat}, LNG:{lng} !!!", flush=True)
        
        if user and user.emergency_email:
            subject = f"EMERGENCY SOS: {user.name} needs help!"
            text_content = f"Hello,\n\nThis is an automated emergency alert from MedAssist AI.\n\nUSER: {user.name}\nEMAIL: {user.email}\n\nLOCATION: https://www.google.com/maps?q={lat},{lng}\n\nPlease take immediate action or contact the user.\n\nCoordinates: {lat}, {lng}"
            
            if send_smtp_email(user.emergency_email, subject, text_content):
                return jsonify({"status": "success", "message": "Emergency contact alerted via email!"})
            else:
                return jsonify({"status": "partial", "message": "SOS triggered but email failed to send. Check server logs for email content and verify SMTP configuration."})
        
        return jsonify({"status": "success", "message": "SOS protocol initiated (No emergency email configured)"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/profile', methods=['GET', 'PUT'])
@jwt_required()
def handle_profile():
    try:
        user_id = int(get_jwt_identity())
        user = db.session.get(User, user_id)
        
        if not user:
            return jsonify({"error": f"User not found (ID: {user_id})."}), 404
            
        if request.method == 'GET':
            return jsonify({
                "name": user.name,
                "email": user.email,
                "dob": user.dob,
                "contact_number": user.contact_number,
                "address": user.address,
                "profile_photo": user.profile_photo,
                "emergency_email": user.emergency_email,
                "blood_group": user.blood_group
            })
            
        if request.method == 'PUT':
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400
            
            print(f"DEBUG: Updating profile for user {user_id}: {list(data.keys())}")
            
            if 'name' in data:
                user.name = data['name']
            if 'dob' in data:
                user.dob = data['dob']
            if 'contact_number' in data:
                user.contact_number = data['contact_number']
            if 'address' in data:
                user.address = data['address']
            if 'profile_photo' in data:
                user.profile_photo = data['profile_photo']
            if 'emergency_email' in data:
                user.emergency_email = data['emergency_email']
            if 'blood_group' in data:
                user.blood_group = data['blood_group']
                
            db.session.commit()
            print(f"DEBUG: Profile updated successfully for user {user_id}")
            return jsonify({
                "message": "Profile updated",
                "user": {
                    "name": user.name,
                    "email": user.email,
                    "dob": user.dob,
                    "contact_number": user.contact_number,
                    "address": user.address,
                    "profile_photo": user.profile_photo,
                    "emergency_email": user.emergency_email,
                    "blood_group": user.blood_group
                }
            })
    except Exception as e:
        print(f"DEBUG: Error in handle_profile: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
