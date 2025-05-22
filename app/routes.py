from flask import Blueprint, render_template, request, jsonify
from .models import Item, db

# Create a Blueprint for the routes
main = Blueprint('main', __name__)

# Route to render the main page
@main.route('/')
def index():
    return render_template('index.html')

# Route to create a new entry
@main.route('/create', methods=['POST'])
def create_entry():
    data = request.json
    new_entry = Item(name=data['name'], description=data.get('description'))
    db.session.add(new_entry)
    db.session.commit()
    return jsonify({'message': 'Entry created successfully', 'id': new_entry.id}), 201

# Route to update an existing entry
@main.route('/update/<int:id>', methods=['PUT'])
def update_entry(id):
    data = request.json
    entry = Item.query.get(id)
    if entry:
        entry.name = data['name']
        entry.description = data.get('description')
        db.session.commit()
        return jsonify({'message': 'Entry updated successfully'}), 200
    return jsonify({'message': 'Entry not found'}), 404

# Route to delete an entry
@main.route('/delete/<int:id>', methods=['DELETE'])
def delete_entry(id):
    entry = Item.query.get(id)
    if entry:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({'message': 'Entry deleted successfully'}), 200
    return jsonify({'message': 'Entry not found'}), 404

# Route to get all entries
@main.route('/entries', methods=['GET'])
def get_entries():
    entries = Item.query.all()
    return jsonify([entry.to_dict() for entry in entries]), 200