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

#-----------------------------users-----------------------------------
# user signup
@app.route('/v1/signup',methods=['POST'])
def adduser():
    data=request.get_json()
    user1=mongo.db.users.find_one({'email':data['email']})
    if user1:
        return jsonify({'result':"Already registered"})
    userdata = {'name':data['username'] ,'password':data['password'],'email': data['email'],'is_student':1,'ques_ask':0,'ques_ans':0,'notes_upl':0,'view_notes':0,'top_tags':[],'top_subjects':[]}
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

#-----------------------User Profile Data --------------------------------------

#owner notes
@app.route("/users/usernotes/<ID>")
def get_usernotes(ID):
    notes = mongo.db.notes.find({'owner_id':ID})
    return dumps(notes)

#owner ideas
@app.route("/users/userideas/<ID>")
def get_userideas(ID):
    ideas = mongo.db.ideas.find({'owner_id':ID})
    return dumps(ideas)

"""
#owner Q/A
@app.route("/users/userqa/<ID>")
def get_userideas(ID):
    qa = mongo.db.qa.find({'owner_id':ID})
    return dumps(qa)
"""

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
@app.route('/ideas/insert')
def insert_ideas():
	data=request.form
	
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
	idea=mongo.db.ideas.insert_one(userdata)
	if idea:
		return jsonify({'result':'success'})
	else:
		return jsonify({'result':'unsucess'})


#add comments
@app.route('/ideas/insert_comment/<ID>',methods=['post'])
def insert_comments(ID):
	data=request.form

	userdata={
		'ideas_id':ID,
		'comments':data['comments']
	}
	comment=mongo.db.ideas_comments.insert_one(userdata)
	if comment:
		return jsonify({'result':'success'})
	else:
		return jsonify({'result':'unsuccess'})

#get comments
@app.route('/ideas/get_comments/<ID>')
def get_comments(ID):
    comments = mongo.db.ideas_comments.find({'ideas_id':ID})
    return dumps(comments)


#idea with a particular tag
@app.route('/ideas/<tag>')
def get_idea(tag):
    idea = mongo.db.ideas.find({'tags':{'$in':[tag]}})
    return dumps(idea)


#latest idea with a particular tag
@app.route('/ideas/latest/<tag>')
def get_latest_idea(tag):
    idea = mongo.db.ideas.find({'tags':{'$in':[tag]}}).sort([('time',-1)])
    return dumps(idea)


#most popular idea based on tag
@app.route('/ideas/popular/<tag>')
def get_popular_idea(tag):
    idea = mongo.db.ideas.find({'tags':{'$in':[tag]}}).sort([('upvotes',-1)])
    return dumps(idea)


#upvote idea
@app.route('/ideas/upvote/<ID>')
def upvote_idea(ID):
	v=mongo.db.ideas.find_one({"_id":ObjectId(ID)})['upvotes']
	mongo.db.ideas.update({"_id":ObjectId(ID)},{"$set":{'upvotes':v+1}})
	return jsonify({'upvote':v+1})

	
#downvote idea
@app.route('/ideas/downvote/<ID>')
def downvote_idea(ID):
	v=mongo.db.ideas.find_one({"_id":ObjectId(ID)})['downvotes']
	mongo.db.ideas.update({"_id":ObjectId(ID)},{"$set":{'downvotes':v+1}})
	return jsonify({'downvote':v+1})

'''---------------------------------------------------------------------------------------------'''

'''------------------------------------Q&A SECTION-------------------------------------------'''

'''---------------------------------------------------------------------------------------------'''


@app.route("/qa/qlist")
def get_questions():
    questions = mongo.db.q.find().sort([('time', -1)])
    return dumps(questions)

@app.route("/qa/ask", methods=['POST'])
def ask_question():
    data = request.get_json()

    qdata = {
        'asked_by': data['asked_by'],
        'tags': data['tags'],
        'description': data['description'],
        'title': data['title'],
        'time': datetime.now()
    }

    if mongo.db.q.insert_one(qdata):
        return jsonify({'result': 'Success'})
    else:
        return jsonify({'result': 'Failure'})

@app.route("/qa/answer", methods=['POST'])
def post_answer():
    data = request.get_json()

    adata = {
        'answered_by': data['answered_by'],
        'content': data['content'],
        'teacher': data['teacher'],
        'time': datetime.now(),
        'upvotes': 0,
        'downvotes': 0,
        'QID': data['QID']
    }

    inserted_a = mongo.db.a.insert_one(qdata)
    if inserted_a:
        return jsonify({'result': 'Success'})
    else:
        return jsonify({'result': 'Failure'})

@app.route("/qa/<QID>/answers")
def get_answers(QID):
    answers = mongo.db.a.find({'QID': QID}).sort([('time', -1)])
    return dumps(answers)

@app.route('/qa/<AID>/upvote')
def upvote_answer(AID):
	v = mongo.db.a.find_one({"_id": ObjectId(AID)})['upvotes']
	mongo.db.a.update({"_id": ObjectId(AID)}, {"$set": {'upvotes': v + 1}})
	return jsonify({'upvote': v + 1})
	
@app.route('/qa/<AID>/downvote')
def downvote_answer(AID):
	v = mongo.db.a.find_one({"_id": ObjectId(AID)})['downvotes']
	mongo.db.a.update({"_id": ObjectId(AID)}, {"$set": {'downvotes': v + 1}})
	return jsonify({'downvote': v + 1})

'''---------------------------------------------------------------------------------------------'''
'''PROFILE PAGE'''
def top_tags(user_id): #example-ObjectId("5be2eaec000f12e4ebaff63e")
    top_tags=mongo.db.users.find( { "_id": user_id }, { "top_tags": {$slice: -2 } } ) #returns last two items of list
    return dumps(top_tags)

def top_subjects(user_id): #example-ObjectId("5be2eaec000f12e4ebaff63e")
    top_subjects=mongo.db.users.find( { "_id": user_id }, { "top_subjects": {$slice: -2 } } )
    return dumps(top_subjects)
    


@app.route('/profile',methods='GET')
def profile(user_id):
    #data=request.get_json()
    value=mongo.db.users.findOne({"_id":user_id})
    t=top_tags(value["_id"])
    s=top_subjects(value["_id"])
    mongo.db.users.update({},{$set:{"top_subjects":s}},false,true)
    mongo.db.users.update({},{$set:{"top_tags":t}},false,true)
    return dumps(value)
	'''return value['name']+ 'number of notes uploaded' + str(value['num_notes'])
	return value['name']+'number of upvotes'+str(value['num_upvotes'])
    return value['name']+'number of questions asked'+str(value['num_asked'])
    return value['name']+'number of questions answered'+str(value['num_answered'])
    return value['name']+'number of project ideas'+str(value['num_project_ideas'])
    return value['name']+'number of views of notes'+str(value['num_views'])
    return value['name']+'top 2 tags'+','.join(top_tags)
    return value['name']+'top 2 tags'+','.join(top_subjects)'''
if __name__ == '__main__':
   app.run(debug = True)
