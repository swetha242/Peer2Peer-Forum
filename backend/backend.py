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

#--------------------------------------get subjects and tags--------------------------------------------------
# first create a db with id as 1
@app.route('/get_subj')
def get_subjects():
    x=mongo.db.globaltrends.find_one({'_id':1})
    if (x):
        return jsonify({'subject':x['subject'],'status':'Success'})
    else:
        return jsonify({'status':'error'})

@app.route('/get_tags')
def get_tags():
    x=mongo.db.globaltrends.find_one({'_id':1})
    if (x):
        return jsonify({'tag':x['tag'],'status':'Success'})
    else:
        return jsonify({'status':'error'})
#-------------------------------------update trends----------------------------------------------------------
def updatetrends(tags,subject,userid):
    query={"_id":ObjectId(userid)}
    print(query)
    user=mongo.db.users.find_one(query)
    #update local trends
    print(user)
    mongo.db.users.update_one(query,{"$set":{'score':user['score']+1}})
    if subject in user['topSubjects']:
        sub=user['topSubjects'][subject]
        mongo.db.users.update_one(query,{"$set":{'topSubjects.'+subject:sub+1}})
    else:
        mongo.db.users.update_one(query,{"$set":{'topSubjects.'+subject:1}})
    for tag in tags:
        if tag in user['topTags']:
            tag1=user['topTags'][tag]
            mongo.db.users.update_one(query,{"$set":{'topTags.'+tag:tag1+1}})
        else:
            mongo.db.users.update_one(query,{"$set":{'topTags.'+tag:1}})
    #update global trends
    q1=mongo.db.globaltrends.find_one({'_id':1})
    if subject in q1['subject']:
        mongo.db.globaltrends.update_one({'_id':1},{"$set":{'subject.'+subject:q1['subject'][subject]+1}})
    else:
        mongo.db.globaltrends.update_one({'_id':1},{"$set":{'subject.'+subject:1}})
    for tag in tags:
        if tag in q1['tag']:
            mongo.db.globaltrends.update_one({'_id':1},{"$set":{'tag.'+tag:q1['tag'][tag]+1}})
        else:
            mongo.db.globaltrends.update_one({'_id':1},{"$set":{'tag.'+tag:1}})

def topthree(obj):
    l=[]
    c=0
    for a,b in obj:
        l.append(a)
        c=c+1
        if(c==3):
            return l
@app.route('/get_trends',methods=['POST'])
def get_trends():
    data=request.get_json()
    #global trends
    glob=mongo.db.globaltrends.find_one({'_id':1})
    glob_sub=glob['subject']
    gs1 = [(k, glob_sub[k]) for k in sorted(glob_sub, key=glob_sub.get, reverse=True)]
    gs=topthree(gs1)
    glob_tag=glob['tag']
    gt1 = [(k, glob_tag[k]) for k in sorted(glob_tag, key=glob_tag.get, reverse=True)]
    gt=topthree(gt1)
    user = list(mongo.db.users.find().sort([('score',-1)]))
    gnames=[]
    gids=[]
    c=0
    for k in user:
        gids.append(str(k['_id']))
        gnames.append(k['name'])
        c=c+1
        if(c==3):
            break
    #local trends
    userid=data['userid']
    loc=mongo.db.users.find_one({'_id':ObjectId(userid)})
    loc_sub=loc['topSubjects']
    if(len(loc_sub)<=1):
        if(len(loc_sub)==0):
            ls=[]
        else:
            ls=[]
            for key in loc_sub:
                ls.append(key)
    else:
        ls1 = [(k, loc_sub[k]) for k in sorted(loc_sub, key=loc_sub.get, reverse=True)]
        ls=topthree(ls1)
    loc_tag=loc['topTags']
    if(len(loc_tag)<=1):
        if(len(loc_tag)==0):
            lt=[]
        else:
            lt=[]
            for key in loc_tag:
                lt.append(key)
    else:
        lt1 = [(k, loc_tag[k]) for k in sorted(loc_tag, key=loc_tag.get, reverse=True)]
        lt=topthree(lt1)
    return jsonify({'global':{'subject':gs,'tag':gt,'contrib':{"names":gnames,"ids":gids}},'local':{'subject':ls,'tag':lt,'ques':loc['ques_ask'],'notes':loc['notes_upl'],'proj':loc['proj_ideas']}})

#-----------------------------users-----------------------------------------------------------
# user signup
@app.route('/v1/signup',methods=['POST'])
def adduser():
    data=request.get_json()
    user1=mongo.db.users.find_one({'email':data['email']})
    if user1:
        return jsonify({'result':"Already registered"})
    userdata = {'name':data['username'] ,'password':data['password'],'email': data['email'],'is_student':1,'ques_ask':0,'ques_ans':0,'notes_upl':0,'view_notes':0,'ans_upvote':0,'proj_ideas':0,'score':0,'topSubjects':{},'topTags':{}}
    #userdata = {'name':data['username'] ,'password':data['password'],'email': data['email'],'is_student':1,'ques_ask':0,'ques_ans':0,'notes_upl':0,'view_notes':0,'score':0,'topSubjects':{},'topTags':{}}
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

#User Authentication
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


#owner Q/A
@app.route("/users/userqa/<ID>")
def get_userqa(ID):
    qa = mongo.db.qa.find({'asked_by':ID})
    return dumps(qa)

def get_userid(email):
	uid=mongo.db.users.find_one({'email':email})
	if uid:
		return jsonify({'result':'success','userid':str(uid['_id'])})
	else:
		return jsonify({'result':'unsuccess'})

def get_useremail(ID):
	uemail=mongo.db.users.find_one({'_id':ObjectId(ID)})
	if uemail:
		return jsonify({'result':'success','email':uemail['email']})
	else:
		return jsonify({'result':'unsuccess'})

#-------------------------------NOTES------------------------------------------------------
#get json
def notes_now(notes):
    note={}
    c=0
    for i in notes:
        i['_id']=str(i['_id'])
        x=mongo.db.users.find_one({'_id':ObjectId(i['upl_by'])})
        note[str(c)]=i
        note[str(c)]['upl_by']=x['name']
      #  print x['name']
        c=c+1
    return note

#notes with a particular tag
@app.route('/notes/list',methods=['POST'])
def get_notes():
    data=request.get_json()['subject']
    notes = mongo.db.notes.find({'subject':data})
    #print(dumps(notes))
    note={}
    note=notes_now(notes)
    return jsonify({'notes':note})

#latest notes with a particular tag
@app.route('/notes/latest',methods=['POST'])
def get_latest():
    data=request.get_json()
    tag=data['tag']
    subject=data['subject']
    notes = mongo.db.notes.find({'tag':tag,'subject':subject}).sort([('time',-1)])
    note={}
    note=notes_now(notes)
    return jsonify({'notes':note})

#most popular notes based on tag
@app.route('/notes/popular',methods=['POST'])
def get_popular():
    data=request.get_json()
    tag=data['tag']
    subject=data['subject']
    notes = mongo.db.notes.find({'tag':tag,'subject':subject}).sort([('upvotes',-1)])
    note={}
    note=notes_now(notes)
    return jsonify({'notes':note})

#upvote notes
@app.route('/notes/upvote',methods=['POST'])
def upvote():
    data=request.get_json()
    nid=data['nid']
    uid=data['uid']
    upv = mongo.db.notes.find_one({"_id": ObjectId(nid)})
    if uid not in upv['votes']:
        upv['votes'].append(uid)
        mongo.db.notes.update({"_id": ObjectId(nid)}, {"$set": {'upvotes': upv['upvotes'] + 1}})
        mongo.db.notes.update({"_id": ObjectId(nid)}, {"$set": {'votes': upv['votes']}})
        return jsonify({'upvote': upv['upvotes'] + 1,'result':'Success'})
    else:
        return jsonify({'result':'Error'})

#downvote notes
@app.route('/notes/downvote',methods=['POST'])
def downvote():
    data=request.get_json()
    nid=data['nid']
    uid=data['uid']
    upv = mongo.db.notes.find_one({"_id": ObjectId(nid)})
    if uid not in upv['votes']:
        upv['votes'].append(uid)
        mongo.db.notes.update({"_id": ObjectId(nid)}, {"$set": {'upvotes': upv['upvotes'] + 1}})
        mongo.db.notes.update({"_id": ObjectId(nid)}, {"$set": {'votes': upv['votes']}})
        return jsonify({'upvote': upv['upvotes'] + 1,'result':'Success'})
    else:
        return jsonify({'result':'Error'})

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
    query={'upl_by':data['userid'],'subject':data['subject'],'tag':[data['tag']],'course':data['course'],
    'upvotes':0,'downvotes':0,'title':data['title'],'summary':data['summary'],'votes':[],
    'link':data['data'],'time':datetime.now()}
    notes_ins=mongo.db.notes.insert_one(query)
    if notes_ins:
        updatetrends(data['tag'],data['subject'],data['userid'])
        v=mongo.db.users.find_one({"_id":ObjectId(data['userid'])})['notes_upl']
        mongo.db.users.update_one({"_id":ObjectId(data['userid'])},{"$set":{'notes_upl':v+1}})
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
@app.route('/ideas/insert',methods=['POST'])
def insert_ideas():
    data=request.get_json()
    l=list()
    for i in data['collaborator'].split(','):
        s=get_userid(i)
        if s:
            l.append(s)
    userdata={
          'title':data['title'],
          'links':data['links'],
          'subject':data['subject'],
          'time':datetime.now(),
          'tags':data['tags'],
          'description':data['description'],
          'owner_id':data['owner_id'],
          'upvotes':0,
          'downvotes':0,
          'views':0,
          'colaborator_id':l,
          'mentor_id':get_userid(data['mentor_id']),
          'comments':[]
    }
    idea=mongo.db.ideas.insert_one(userdata)
    if idea:
        #mentor_email=mongo.db.users.find_one({'_id':ObjectId(data['mentor_id'])})['email']
        return jsonify({'result':'success'})
    else:
        return jsonify({'result':'unsuccess'})

#add colaborator
@app.route('/ideas/insert_colaborator/<ID>',methods=['post','get'])
def insert_colaborator(ID):
    ideas_id=request.form['ideas_id']
    c=mongo.db.ideas.update_one({'_id':ObjectId(ideas_id)},{'$addToSet':{'colaborator_id':ID}})
    if c:
        return jsonify({"result":"success"})
    else:
        return jsonify({"result":"unsuccess"})


#count no of colaborator
@app.route('/ideas/count_colaborator/<ID>',methods=['post','get'])
def count_colaborator(ID):
    data=mongo.db.ideas.count({'_id':ObjectId(ID)})
    return jsonify({'count':data})


#add commentss
@app.route('/ideas/insert_comment/<ID>',methods=['post'])
def insert_comments(ID):
    data=request.form

    userdata={
        'time':datetime.now(),
        'comments':data['comments']
    }
    comment=mongo.db.ideas.update_one({'_id':ObjectId(ID)},{'$push':{'comments':userdata}})
    if comment:
        return jsonify({'result':'success'})
    else:
        return jsonify({'result':'unsuccess'})

#get comments
@app.route('/ideas/get_comments/<ID>')
def get_comments(ID):
    comments = mongo.db.ideas.find({'ideas_id':ID})['comments']
    return dumps(comments)


#idea with a particular tag
@app.route('/ideas/<tag>')
def get_idea(tag):
    idea = mongo.db.ideas.find({'tags':{'$in':[tag]}})
    coll_list=[]
    for i in idea['colaborator_id']:
        coll_list.append(get_useremail(i))
    idea['colaborator_email']=coll_list
    return dumps(idea)


#latest idea with a particular tag
@app.route('/ideas/latest/<tag>')
def get_latest_idea(tag):
    idea = mongo.db.ideas.find({'tags':{'$in':[tag]}}).sort([('time',-1)])
    coll_list=[]
    for i in idea['colaborator_id']:
        coll_list.append(get_useremail(i))
    idea['colaborator_email']=coll_list
    return dumps(idea)


#most popular idea based on tag
@app.route('/ideas/popular/<tag>')
def get_popular_idea(tag):
    idea = mongo.db.ideas.find({'tags':{'$in':[tag]}}).sort([('upvotes',-1)])
    coll_list=[]
    for i in idea['colaborator_id']:
        coll_list.append(get_useremail(i))
    idea['colaborator_email']=coll_list
    return dumps(idea)


#upvote idea
@app.route('/ideas/upvote/',methods=['post'])
def upvote_idea():
    ID=request.form['id']
    v=mongo.db.ideas.find_one({"_id":ObjectId(ID)})['upvotes']
    mongo.db.ideas.update({"_id":ObjectId(ID)},{"$set":{'upvotes':v+1}})
    return jsonify({'upvote':v+1})


#downvote idea
@app.route('/ideas/downvote/',methods=['post'])
def downvote_idea():
    ID=request.form['id']
    v=mongo.db.ideas.find_one({"_id":ObjectId(ID)})['downvotes']
    mongo.db.ideas.update({"_id":ObjectId(ID)},{"$set":{'downvotes':v+1}})
    return jsonify({'downvote':v+1})


#view count
@app.route('/ideas/views/',methods=['post'])
def ideas_views_count():
    ID=request.form['id'];
    v=mongo.db.ideas.find_one({"_id":ObjectId(ID)})['views']
    mongo.db.ideas.update({"_id":ObjectId(ID)},{"$set":{'views':v+1}})
    return jsonify({'views':v+1})


'''---------------------------------------------------------------------------------------------'''

'''------------------------------------Q&A SECTION-------------------------------------------'''

'''---------------------------------------------------------------------------------------------'''


@app.route("/qa/qlist",methods=['POST'])
def get_questions():
    data=request.get_json()
    questions = list(mongo.db.q.find({'subject':data['subject']}).sort([('time', -1)]))
    ques={}
    c=0
    for i in questions:
        i['_id']=str(i['_id'])
        x=mongo.db.users.find_one({'_id':ObjectId(i['asked_by'])})
        ques[str(c)]=i
        ques[str(c)]['asked_by_n']=x['name']
      #  print x['name']
        c=c+1
    return jsonify({'question':ques})

@app.route("/qa/ask", methods=['POST'])
def ask_question():
    data = request.get_json()
    qdata = {
        'asked_by': data['asked_by'],
        'tags': [data['tags']],
        'description': data['description'],
        'title': data['title'],
        'subject': data['subject'],
        'time': datetime.now()
    }
    x= mongo.db.q.insert_one(qdata)
    print(x)
    print(qdata)
    if x:
        updatetrends(qdata['tags'],qdata['subject'],qdata['asked_by'])
        v=mongo.db.users.find_one({"_id":ObjectId(data['asked_by'])})
        mongo.db.users.update_one({"_id":ObjectId(data['asked_by'])},{"$set":{'ques_ask':v['ques_ask']+1}})
        return jsonify({'result': 'Success','qid':str(x),"name":v['name']})
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
        'votes':[],
        'QID': data['QID']
    }

    inserted_a = mongo.db.a.insert_one(adata)
    if inserted_a:
        x=mongo.db.users.find_one({'_id':ObjectId(data['answered_by'])})
        return jsonify({'result': 'Success','name':x['name']})
    else:
        return jsonify({'result': 'Failure'})

@app.route("/qa/<QID>/answers")
def get_answers(QID):
    answers = list(mongo.db.a.find({'QID': QID}).sort([('time', -1)]))
    ans={}
    c=0
    for i in answers:
        i['_id']=str(i['_id'])
        x=mongo.db.users.find_one({'_id':ObjectId(i['answered_by'])})
        ans[str(c)]=i
        ans[str(c)]['answered_by_n']=x['name']
      #  print x['name']
        c=c+1
    #print ans
    return jsonify({'answer':ans})

    #return dumps(answers)

@app.route('/qa/upvote',methods=['POST'])
def upvote_answer():
    data=request.get_json()
    aid=data['aid']
    uid=data['uid']
    upv = mongo.db.a.find_one({"_id": ObjectId(aid)})
    if uid not in upv['votes']:
        upv['votes'].append(uid)
        mongo.db.a.update({"_id": ObjectId(aid)}, {"$set": {'upvotes': upv['upvotes'] + 1}})
        mongo.db.a.update({"_id": ObjectId(aid)}, {"$set": {'votes': upv['votes']}})
        return jsonify({'upvote': upv['upvotes'] + 1,'result':'Success'})
    else:
        return jsonify({'result':'Error'})
@app.route('/qa/downvote',methods=['POST'])
def downvote_answer():
    data=request.get_json()
    aid=data['aid']
    uid=data['uid']
    upv = mongo.db.a.find_one({"_id": ObjectId(aid)})
    if uid not in upv['votes']:
        upv['votes'].append(uid)
        mongo.db.a.update({"_id": ObjectId(aid)}, {"$set": {'downvotes': upv['downvotes'] + 1}})
        mongo.db.a.update({"_id": ObjectId(aid)}, {"$set": {'votes': upv['votes']}})
        return jsonify({'downvote': upv['downvotes'] + 1,'result':'Success'})
    else:
        return jsonify({'result':'Error'})

'''---------------------------------------------------------------------------------------------'''
'''PROFILE PAGE'''
def top_tags(ID): #example-ObjectId("5be2eaec000f12e4ebaff63e")
    top_tags=mongo.db.users.find( {"_id":ObjectId(ID)}, { "top_tags": {"$slice": -2 } } ) #returns last two items of list
    '''a=mongo.db.users.findOne({"_id":user_id})
    b=a["top_tags"]
    top_tags=b[-2:]'''
    return dumps(top_tags)

def top_subjects(ID): #example-ObjectId("5be2eaec000f12e4ebaff63e")
    top_subjects=mongo.db.users.find({"_id":ObjectId(ID)}, { "top_subjects": {"$slice": -2 } } )
    return dumps(top_subjects)



@app.route('/profile',methods=['GET','POST'])
def profile(ID):
    #data=request.get_json()
    user=mongo.db.users.find_one({"_id":ObjectId(ID)})
    user['_id']=str(user['_id'])
    return jsonify({'profile':user})






if __name__ == '__main__':
   app.run(debug = True)
