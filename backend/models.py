from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    reset_otp = db.Column(db.String(6))
    otp_expiry = db.Column(db.DateTime)
    profile_photo = db.Column(db.Text)
    dob = db.Column(db.String(20))
    contact_number = db.Column(db.String(20))
    address = db.Column(db.String(200))
    emergency_email = db.Column(db.String(100))
    blood_group = db.Column(db.String(10))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class HealthRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    date_added = db.Column(db.DateTime, default=db.func.current_timestamp())

class Reminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    medicine_name = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(20), nullable=False)
    active = db.Column(db.Boolean, default=True)
