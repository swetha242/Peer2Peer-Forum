from flask import Flask, redirect, url_for,jsonify,request,flash,abort
from flask_cors import CORS, cross_origin
from flask_pymongo import PyMongo
from bson.json_util import dumps
from bson.objectid import ObjectId
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'files'
ALLOWED_EXTENSIONS = set(['txt', 'pdf'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config["MONGO_URI"] = "mongodb://localhost:27017/P2Pdb"
mongo = PyMongo(app)


"""  User add to mongodb database """
@app.route('/v1/signup',methods=['POST'])
def adduser():
    data=request.get_json()
    userdata = {'name':data['username'] ,'password':data['password'],'email': data['email'],'is_student':1}
    user=mongo.db.users.insert_one(userdata)
    if user:
        query={
            'email':data['email'] ,
            'password':data['password']
        }
        #return jsonify(query)
        user=mongo.db.users.find_one(query)
        user['_id']=str(user['_id'])
        return jsonify({'user_id':user['_id'],'result':'Success'})
    else:
        return jsonify({'result':"Something wrong"})


"""  User Authentication  """
@app.route('/v1/auth',methods=['POST'])
def check_user():
    data=request.get_json()
    query={
		'email':data['email'] ,
		'password':data['password']
	}
    #return jsonify(query)
    user=mongo.db.users.find_one(query)
    user1=mongo.db.users.find_one({'email':data['email']})
    if user:
        user['_id']=str(user['_id'])
        return jsonify({'user_id':user['_id'],'result':'Success'})
    elif user1:
        return jsonify({'result':"Invalid password"})
    else:
        return jsonify({'result':"Invalid user"})

#notes with a particular tag
@app.route('/notes/<tag>')
def get_notes(tag):
    notes = mongo.db.notes.find({'tag':tag})
    return dumps(notes)

#latest notes with a particular tag
@app.route('/notes/<tag>/latest')
def get_latest(tag):
    notes = mongo.db.notes.find({'tag':tag}).sort([('time',-1)])
    return dumps(notes)

#most popular notes based on tag
@app.route('/notes/<tag>/popular')
def get_popular(tag):
    notes = mongo.db.notes.find({'tag':tag}).sort([('upvotes',-1)])
    return dumps(notes)

#upvote notes
@app.route('/notes/<ID>/upvote/')
def upvote(ID):
	v=mongo.db.notes.find_one({"_id":ObjectId(ID)})['upvotes']
	mongo.db.notes.update({"_id":ObjectId(ID)},{"$set":{'upvotes':v+1}})
	return jsonify({'upvote':v+1})
	
#downvote notes
@app.route('/notes/<ID>/downvote/')
def downvote(ID):
	v=mongo.db.notes.find_one({"_id":ObjectId(ID)})['downvotes']
	mongo.db.notes.update({"_id":ObjectId(ID)},{"$set":{'downvotes':v+1}})
	return jsonify({'downvote':v+1})

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_file():
   if request.method == 'POST':
        if 'file' not in request.files:
            #flash('No file part')
            return redirect(request.url)
        f = request.files['file']
        if f.filename == '':
            #flash('No selected file')
            return "no file selected"
        if f and allowed_file(f.filename):
            filename = secure_filename(f.filename)
            print(filename)
            f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return 'file uploaded successfully'   
if __name__ == '__main__':
   app.run(debug = True)