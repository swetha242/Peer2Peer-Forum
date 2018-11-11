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
    userdata = {'name':data['username'] ,'password':data['password'],'email': data['email'],'is_student':1, "num_notes":0,"num_project_ideas":0,"num_upvotes":0,"num_views":0,"num_asked":0,"num_answered":0,"tags":[],"subjects":[}
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
def top_tags(user_id): #example-ObjectId("5be2eaec000f12e4ebaff63e")
    top_tags=mongo.db.users.find( { "_id": user_id }, { "tags": {$slice: -2 } } ) #returns last two items of list
    return dumps(top_tags)

def top_subjects(user_id): #example-ObjectId("5be2eaec000f12e4ebaff63e")
    top_subjects=mongo.db.users.find( { "_id": user_id }, { "subjects": {$slice: -2 } } )
    return dumps(top_subjects)
    


'''profile page'''
@app.route('/profile',methods='GET')
def profile(user_id):
    #data=request.get_json()
    value=mongo.db.users.findOne({"_id":user_id})
    t=top_tags(value["_id"])
    s=top_subjects(value["_id"])
    mongo.db.users.update({},{$set:{"subjects":s}},false,true)
    mongo.db.users.update({},{$set:{"tags":t}},false,true)
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
