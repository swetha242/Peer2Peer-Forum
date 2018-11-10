from flask import Flask, redirect, url_for,jsonify,request,flash,abort
from flask_cors import CORS, cross_origin
from flask_pymongo import PyMongo
from bson.json_util import dumps
from bson.objectid import ObjectId
import os
import random
import base64
from werkzeug.utils import secure_filename
from datetime import datetime

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'files'
ALLOWED_EXTENSIONS = set(['pdf'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config["MONGO_URI"] = "mongodb://localhost:27017/P2Pdb"
mongo = PyMongo(app)


"""  User add to mongodb database """
@app.route('/v1/signup',methods=['POST'])
def adduser():
    data=request.get_json()
    user1=mongo.db.users.find_one({'email':data['email']})
    if user1:
        return jsonify({'result':"Already registered"})
    userdata = {'name':data['username'] ,'password':data['password'],'email': data['email'],'is_student':1,'ques_ask':0,'ques_ans':0,'notes_upl':0,'view_notes':0}
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
#-------------------------------NOTES------------------------------------------------------
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

@app.route('/notes/upload', methods = ['GET', 'POST'])
def upload_file():
    data=request.get_json()
    if data['islink']==0:
            x=bytes(data['data'],encoding="UTF-8")
            file_decode=base64.decodebytes(x)
            file_name=str(random.randrange(100,10000000,1))+".pdf"
            file1=open(os.path.join(app.config['UPLOAD_FOLDER'], file_name),'wb')
            file1.write(file_decode)
            file1.close()
            data['data']=file_name
    query={'subject':data['subject'],'course':1,'upvotes':0,'downvotes':0,'title':data['title'],'summary':data['summary'],'link':data['data'],'time':datetime.now()}
    notes_ins=mongo.db.notes.insert_one(query)
    if notes_ins:
        v=mongo.db.users.find_one({"_id":ObjectId(data['userid'])})['notes_upl']
        mongo.db.users.update({"_id":ObjectId(data['userid'])},{"$set":{'notes_upl':v+1}})
        return jsonify({'result':'Success'})
    else:
        return jsonify({'result':'Error'})

@app.route('/notes/view',methods=['GET','POST'])
def view_file():
    data=request.get_json()
    print(data['notesid'])
    notes_query=mongo.db.notes.find_one({'_id':ObjectId(data['notesid'])})
    if notes_query:
        file_name=notes_query['link']
        file1=open(os.path.join(app.config['UPLOAD_FOLDER'], file_name),'rb')
        file1=file1.read()
        enc=base64.encodebytes(file1)
        enc=enc.decode("utf-8").strip()
        v=mongo.db.users.find_one({"_id":ObjectId(data['userid'])})['view_notes']
        mongo.db.users.update({"_id":ObjectId(data['userid'])},{"$set":{'view_notes':v+1}})
        return jsonify({'result':"Success",'data':enc})
    return jsonify({'result':'Error'})

'''------------------------------------IDEAS SECTION-------------------------------------------'''

#insert ideas
@app.route('/idea/insert')
def insert_ideas():
	data=request.get_json()
	
	userdata={
		'title':data['title'],
		'link':data['links'],
		'tags':data['tags'],
		'description':data['description'],
		'owner_id':data['owner_id'],
		'upvotes':data['upvotes'],
		'downvotes':data['downvotes'],
		'collaborator_id':data['collaborator_id'],
		'mentor_id':data['mentor_id']
	}
	idea=mongo.db.idea.insert_one(userdata)
	if idea:
		return jsonify({'result':'success'})
	else:
		return jsonify({'result':'unsucess'})


#add comments
@app.route('/idea/<ID>/insert_comment')
def insert_comments(ID):
	data=request.get_json()

	userdata={
		'ideas_id':ID,
		'comments':data['comments']
	}
	comment=mongo.db.ideas_comments.insert_one(userdata)
	if comment:
		return jsonify({'result':'success'})
	else:
		return jsonify({'result':'unsuccess'})
		
'''
@app.route('/idea/<ID>/get_comments')
def get_comments(ID):
	comments = mongo.db.idea.find({'id':ID}).sort([('time',-1)])
    return dumps(idea)
'''

#idea with a particular tag
@app.route('/idea/<tag>')
def get_idea(tag):
    idea = mongo.db.idea.find({'tag':tag})
    return dumps(idea)


#latest idea with a particular tag
@app.route('/idea/latest/<tag>')
def get_latest_idea(tag):
    idea = mongo.db.idea.find({'tag':tag}).sort([('time',-1)])
    return dumps(idea)


#most popular idea based on tag
@app.route('/idea/<tag>/popular')
def get_popular_idea(tag):
    idea = mongo.db.idea.find({'tag':tag}).sort([('upvotes',-1)])
    return dumps(idea)


#upvote idea
@app.route('/idea/<ID>/upvote/')
def upvote_idea(ID):
	v=mongo.db.idea.find_one({"_id":ObjectId(ID)})['upvotes']
	mongo.db.idea.update({"_id":ObjectId(ID)},{"$set":{'upvotes':v+1}})
	return jsonify({'upvote':v+1})

	
#downvote idea
@app.route('/idea/<ID>/downvote/')
def downvote_idea(ID):
	v=mongo.db.idea.find_one({"_id":ObjectId(ID)})['downvotes']
	mongo.db.idea.update({"_id":ObjectId(ID)},{"$set":{'downvotes':v+1}})
	return jsonify({'downvote':v+1})



'''---------------------------------------------------------------------------------------------'''



if __name__ == '__main__':
   app.run(debug = True)
