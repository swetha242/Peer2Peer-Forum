from flask import Flask, redirect, url_for,jsonify,request,flash,abort
from flask_cors import CORS, cross_origin
from flask_pymongo import PyMongo
from bson.json_util import dumps
from bson.objectid import ObjectId
import os
import random
import base64
import smtplib
from werkzeug.utils import secure_filename
import pyotp
from datetime import datetime
import json
import pickle
from nltk.corpus import stopwords
import re

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'files'
ALLOWED_EXTENSIONS = set(['pdf'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config["MONGO_URI"] = "mongodb://localhost:27017/P2Pdb"
mongo = PyMongo(app)


# ------------- ML Auto Taging --------------------#
stopWords = set(stopwords.words('english'))
stopWords = list(stopWords)

subjectsFile = open("subjects.pickle","rb")
subjectsTagsFile = open("subjectsWords.pickle","rb")

subjects = pickle.load(subjectsFile)
subjectsTags = pickle.load(subjectsTagsFile)

def cleanText(string):
    string=string.strip("\n")
    string=string.strip("//")
    string = re.sub(r"[^A-Za-z0-9(),!?\'\`]", " ", string)
    string = re.sub(r"\'s", " is ", string)
    string = re.sub(r"\'ve", " have ", string)
    string = re.sub(r"n\'t", " not ", string)
    string = re.sub(r"\'re", " are ", string)
    string = re.sub(r"\'d" , " would ", string)
    string = re.sub(r"\'ll", " will ", string)
    string = re.sub(r",", " , ", string)
    string = re.sub(r"!", " ! ", string)
    string = re.sub(r"\(", " ( ", string)
    string = re.sub(r"\)", " ) ", string)
    string = re.sub(r"\?", " ? ", string)
    string = re.sub(r"\s{2,}", " ", string)

    return string.strip().lower()

def getTags(text, subject):
	text = cleanText(text)
	wordsList = text.split()

	tags=[]

	subject = subject.lower()
	subjectsTagsList = subjectsTags[subject]

	wordsListStopWordsRemoved = []
	for word in wordsList:
		if(word not in stopWords):
			wordsListStopWordsRemoved.append(word)

	for word in wordsListStopWordsRemoved:
		if(word in subjectsTagsList):
			tags.append(word)

	return tags

#----------------- OTP ------------------------- #
otp_generator = pyotp.TOTP('base32secret3232')
otp_times = []

email_server = smtplib.SMTP('smtp.gmail.com', 587)
email_server.starttls()
email_server.login('peerforum5@gmail.com','peertopeer5')

def send_email(to_addr, msg):
    email_server.sendmail('peerforum5@gmail.com', to_addr, msg)

#----------------------------------------------OTP------------------------------------------------------------
#send OTP to email
@app.route('/otp/send', methods=['POST'])
def send_otp():
    data = request.get_json()
    to_email = data['email']

    now_time = datetime.now()
    otp = otp_generator.at(now_time)
    otp_times.append(now_time)

    try:
        send_email(to_email, otp)
        return jsonify({'result': "Success"})
    except:
        return jsonify({'result': "Failure"})

# verify OTP
@app.route('/otp/verify', methods=['POST'])
def verify_otp():
    data = request.get_json()
    otp = data['otp']

    for otp_time in otp_times:
        if otp_generator.verify(otp, otp_time):
            otp_times.remove(otp_time)
            return jsonify({'result': "Success"})

    return jsonify({'result': "Failure"})

#--------------------------------------get notifications-------------------------------------------------------
@app.route('/get_notif',methods=['POST'])
def get_notif():
    user=request.get_json()['userid']
    notif_all=mongo.db.notif.find_one({'userid':user})['notif']
    sorted(notif_all, key=lambda k: k['time'], reverse=True)
    notif={}
    c=0
    for i in notif_all:
        if(i['read']==0):
            notif[str(c)]=i
            c=c+1
    return jsonify({'notif':notif})

@app.route('/notif/mark_as_read',methods=['POST'])
def notif_read():
    notif=request.get_json()
    user=notif['userid']
    notif_id=notif['notif_id']
    notif_all=mongo.db.notif.find_one({'userid':user})['notif']
    notif_upd=[]
    print(notif_id)
    for i in notif_all:
        print(i['notif_id'])
        if(i['notif_id']==notif_id):
            i['read']=1
        notif_upd.append(i)
    print(notif_upd)
    mongo.db.notif.update_one({'userid':user},{'$set':{'notif':notif_upd}})
    return jsonify({'result':'Success'})

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
#check if user already exists
@app.route('/v1/checkuser',methods=['POST'])
def check_user():
    data=request.get_json()
    user1=mongo.db.users.find_one({'email':data['email']})
    if user1:
        return jsonify({'result':"Already registered"})
    else:
        return jsonify({'result':"New User"})


# user signup
@app.route('/v1/signup',methods=['POST'])
def adduser():
    data=request.get_json()
    userdata = {'name':data['username'] ,'password':data['password'],'email': data['email'],'is_student':1,'ques_ask':0,'ques_ans':0,'notes_upl':0,'view_notes':0,'ans_upvote':0,'proj_ideas':0,'score':0,'topSubjects':{},'topTags':{}}
    #userdata = {'name':data['username'] ,'password':data['password'],'email': data['email'],'is_student':1,'ques_ask':0,'ques_ans':0,'notes_upl':0,'view_notes':0,'score':0,'topSubjects':{},'topTags':{}}
    user=mongo.db.users.insert_one(userdata)
    if user:
        query={
            'email':data['email'] ,
            'password':data['password']
        }
        #return jsonify(query)
        notif={
            "userid":str(user.inserted_id),
            "notif":[]
        }
        mongo.db.notif.insert_one(notif)
        user=mongo.db.users.find_one(query)
        user['_id']=str(user['_id'])
        return jsonify({'user_id':user['_id'],'uname':data['username'],'result':'Success'})
    else:
        return jsonify({'result':"Something wrong"})

#User Authentication
@app.route('/v1/auth',methods=['POST'])
def auth_user():
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
        notif_exists=mongo.db.notif.find_one({'userid':user['_id']})
        if not notif_exists:
            notif={
            "userid":user['_id'],
            "notif":[]
            }
            mongo.db.notif.insert_one(notif)
        return jsonify({'user_id':user['_id'],'uname':user['name'],'result':'Success'})
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


#get user details from profile
def get_userDetails(ID):
	ID = ObjectId(ID)
	userdata =	mongo.db.users.find_one({'_id' : ID})
	print("Extracted user data : ",userdata)
	userdata['_id'] = str(userdata['_id'])
	#if userdata:
	#	return jsonify({'result' : 'success', 'data' : userdata})
	#else:
	#	return jsonify({'result' : 'unsuccess'})
	return userdata

def get_userid(email):
	uid=mongo.db.users.find_one({'email':email})
	if uid:
		return jsonify({'result':'success','userid':str(uid['_id'])})
	else:
		return jsonify({'result':'unsuccess'})

def get_useremail(ID):
	uemail=mongo.db.users.find_one({'_id':ObjectId(ID)})
	if uemail:
		return jsonify({'result':'success','email':uemail['email'],'uname':uemail['name']})
	else:
		return jsonify({'result':'unsuccess'})

#-------------------------------NOTES------------------------------------------------------
#get json
def notes_now(notes):
    note={}
    c=0
    print(notes)
    for i in notes:
        i['_id']=str(i['_id'])
        x=mongo.db.users.find_one({'_id':ObjectId(i['upl_by'])})
        print(x)
        note[str(c)]=i
        note[str(c)]['upl_by']=x['name']
      #  print x['name']
        c=c+1
    return note

#notes with a particular tag
@app.route('/notes/list',methods=['POST'])
def get_notes():
    data=request.get_json()
    #print(data)
    notes = list(mongo.db.notes.find({'subject':data['subject']}))
    #print(notes)
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
    #list of colab ids
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
          'max_colaborators':data['max_colaborators'],
          'owner_id':data['owner_id'],
          'upvotes':0,
          'downvotes':0,
          'views':0,
          'colaborator_id':[],
          'mentor_id':get_userid(data['mentor_id']),
          'mentor_status':0,
          'comments':[]
    }
    idea=mongo.db.ideas.insert_one(userdata)
    notif_id=str(random.randrange(100,10000000,1))
    if idea:
        #mentor_email=mongo.db.users.find_one({'_id':ObjectId(data['mentor_id'])})['email']
        x=mongo.db.users.find_one({'_id':ObjectId(data['owner_id'])})

        notif_q={
            "type":5,
            "msg":x['name'] + "has chosen you as mentor for"+data['title'],
            "project_id":str(idea.inserted_id),
            'time': datetime.now(),
            'notif_id':notif_id,
            "student_id":data['owner_id'],
            "read":0
        }
        notif_msg=mongo.db.notif.find_one({'userid':data['mentor_id']})['notif']
        notif_msg.append(notif_q)
        mongo.db.notif.update_one({'userid':data['mentor_id']},{"$set":{'notif':notif_msg}})
        #notify colaborators
        for colab in l:
            notif_q={
            "type":6,
            "msg":x['name'] +"has invited you to colaborate on"+data['title'],
            "project_id":str(idea.inserted_id),
            'time': datetime.now(),
            'notif_id':notif_id,
            "student_id":data['owner_id'],
            "read":0
            }
            notif_msg=mongo.db.notif.find_one({'userid':colab})['notif']
            notif_msg.append(notif_q)
            mongo.db.notif.update_one({'userid':colab},{"$set":{'notif':notif_msg}})
        #profile update
        mongo.db.users.update_one({"_id":ObjectId(data['owner_id'])},{"$set":{'proj_ides':x['proj_ideas']+1}})
        return jsonify({'result':'success'})
    else:
        return jsonify({'result':'failure'})

#colaborator request to join
@app.route('/ideas/insert_colaborator',methods=['POST'])
def insert_colaborator():
    ideas=request.get_json()
    ideas_id=ideas['ideas_id']
    colab_id=ideas['colab_id']
    #call fn to update
    #c=mongo.db.ideas.update_one({'_id':ObjectId(ideas_id)},{'$addToSet':{'colaborator_id':colab_id}})
    if True:
        data=mongo.db.ideas.find_one({'_id':ObjectId(ideas_id)})
        uinfo=get_useremail(colab_id)['uname']
        notif_id=str(random.randrange(100,10000000,1))
        notif_q={
            "type":5,
            "msg":uinfo +"wants to colaborate on"+data['title'],
            "project_id":ideas_id,
            'time': datetime.now(),
            "colab_id":colab_id,
            'notif_id':notif_id,
            "read":0
        }
        notif_msg=mongo.db.notif.find_one({'userid':data['owner_id']})['notif']
        notif_msg.append(notif_q)
        mongo.db.notif.update_one({'userid':data['owner_id']},{"$set":{'notif':notif_msg}})
        return jsonify({"result":"success"})
    else:
        return jsonify({"result":"failure"})

@app.route('/ideas/update_members/',methods=['post'])
def update_members():
    data = request.get_json()
    ideas_id = data['ideas_id']
    ideas = mongo.db.ideas.find_one({"_id":ObjectId(ideas_id)})
    member_id = data['member_id']
    colab = data['mode']
    owner_name=get_useremail(ideas['owner_id'])['uname']
    notif_id=str(random.randrange(100,10000000,1))
    if colab:
        res = mongo.db.ideas.update_one({"_id":ObjectId(ideas_id)},{'$addToSet':{'colaborator_id':member_id}})
        if res:
            notif_q={
                "type":3,
                "msg":owner_name +"accepted your request to join "+ideas['title'],
                "project_id":ideas_id,
                'time': datetime.now(),
                "member_id":ideas['owner_id'],
                'notif_id':notif_id,
                "read":0
            }
            notif_msg=mongo.db.notif.find_one({'userid':member_id})['notif']
            notif_msg.append(notif_q)
            mongo.db.notif.update_one({'userid':member_id},{"$set":{'notif':notif_msg}})
            return jsonify({'result':'success'})
            #call notify to member_id with message saying colab request accepted

        else:
            return jsonify({'result':'failure'})
    else:
        res = mongo.db.ideas.update_one({"_id":ObjectId(ideas_id)},{'$set':{'mentor_id':member_id}})
        if res:
            member_name=get_useremail(member_id)['uname']
            notif_q={
                "type":4,
                "msg":member_name +"accepted your request to mentor "+ideas['title'],
                "project_id":ideas_id,
                'time': datetime.now(),
                "member_id":member_id,
                'notif_id':notif_id,
                "read":0
            }
            notif_msg=mongo.db.notif.find_one({'userid':ideas['owner_id']})['notif']
            notif_msg.append(notif_q)
            mongo.db.notif.update_one({'userid':ideas['owner_id']},{"$set":{'notif':notif_msg}})
            return jsonify({'result':'success'})
            #call notify to owner_id of the idea saying mentor has accepted

        else:
            return jsonify({'result':'failure'})

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
    if idea:
        for i in idea:
            for colab in i['colaborator_id']:
                coll_list.append(get_useremail(i))
            i['colaborator_email']=coll_list
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
    description = data['description']
    subject = data['subject']
    tagsForQuestions = getTags(description,subject)
    tagsForQuestions.append(data['tags'])

    data['tags']= tagsForQuestions

    print(tagsForQuestions)

    qdata = {
        'asked_by': data['asked_by'],
        'tags': data['tags'],
        'description': data['description'],
        'title': data['title'],
        'subject': data['subject'],
        'time': datetime.now()
    }
    x= mongo.db.q.insert_one(qdata)
    print(x.inserted_id)
    print(qdata)
    if x:
        updatetrends(qdata['tags'],qdata['subject'],qdata['asked_by'])
        v=mongo.db.users.find_one({"_id":ObjectId(data['asked_by'])})
        mongo.db.users.update_one({"_id":ObjectId(data['asked_by'])},{"$set":{'ques_ask':v['ques_ask']+1}})
        return jsonify({'result': 'Success','qid':str(x.inserted_id),"name":v['name']})
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
        question = mongo.db.q.find_one({'_id': ObjectId(data['QID'])})
        asker_id = question['asked_by']
        asker = mongo.db.users.find_one({'_id': ObjectId(asker_id)})
        answerer_id = data['answered_by']
        answerer = mongo.db.users.find_one({'_id': ObjectId(answerer_id)})
        notif_id=str(random.randrange(100,10000000,1))
        notif_msg = answerer['name']+' answered the following to your question ('+question['title']+'):'+adata['content']

        send_email(asker['email'], notif_msg)
        notif_q={
            "type":1,
            "msg":answerer['name'] + "has answered your question on "+question['title'],
            "ans":data['content'],
            'time': datetime.now(),
            "qid":data['QID'],
            'notif_id':notif_id,
            "read":0
        }
        notif_msg=mongo.db.notif.find_one({'userid':asker_id})['notif']
        notif_msg.append(notif_q)
        mongo.db.notif.update_one({'userid':asker_id},{"$set":{'notif':notif_msg}})
        mongo.db.users.update_one({"_id":ObjectId(answerer_id)},{"$set":{'ques_ans':answerer['ques_ans']+1}})
        
        return jsonify({'result': 'Success', 'name': answerer['name'], 'aid': str(inserted_a.inserted_id)})
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
        #update profile
        v=mongo.db.users.find_one({"_id":ObjectId(upv['answered_by'])})
        mongo.db.users.update_one({"_id":ObjectId(upv['answered_by'])},{"$set":{'ans_upvote':v['ans_upvote']+1}})
        
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



@app.route('/profile',methods=['POST'])
def profile():
    data=request.get_json()
    user=mongo.db.users.find_one({"_id":ObjectId(data['userid'])})
    user['_id']=str(user['_id'])
    loc_sub=user['topSubjects']
    if(len(loc_sub)<=1):
        if(len(loc_sub)==0):
            ls=[]
        else:
            ls=[]
            for key in loc_sub:
                ls.append(key)
    else:
        ls1 = [(k, loc_sub[k]) for k in sorted(loc_sub, key=loc_sub.get, reverse=True)]
        user['topSubjects']=topthree(ls1)
    loc_tag=user['topTags']
    if(len(loc_tag)<=1):
        if(len(loc_tag)==0):
            lt=[]
        else:
            lt=[]
            for key in loc_tag:
                lt.append(key)
    else:
        lt1 = [(k, loc_tag[k]) for k in sorted(loc_tag, key=loc_tag.get, reverse=True)]
        user['topTags']=topthree(lt1)
    return jsonify({'profile':user})

'''
------------------------- ML Model and Reccomendation Systems
------------------------------------------------------------------

'''
#to sort questions
def returnOverLapScore(a):
	return a[1]

#get questions similar to user
#takes userID and the number of questions
@app.route('/qa/recoqa',methods=['POST'])
def getQuestionsSimilarToUser():
	k=10
	data=request.get_json()
	print(data)
	userID= data['asked_by']

	noCommon = True

	print("User id : ",userID)
	overLapScores=[]
	questions=list(mongo.db.q.find())
	questionsReturned=[]

	if(len(questions)<=k):
		k=len(questions)

	userTags={}
	userSubjects={}
	userFound=False

	profileData = get_userDetails(userID)
	print("Profile Data : :",profileData)
	#if(profileData['result']=='unsuccess'):
	#	return

	userdata = profileData
	userSubjects = userdata["topSubjects"]
	userTags = userdata["topTags"]
	overlapQuestions=[]

	for question in questions:
		overLapScore=1
		questionTags=question["tags"]
		questionSubject=question["subject"]
		if(questionSubject in userSubjects):
			overLapScore+=userSubjects[questionSubject]
		for tag in questionTags:
			if(tag in userTags):
				overLapScore+=userTags[tag]
		if(noCommon==True and overLapScore>1):
			noCommon=False
		overlapQuestions.append([question,overLapScore])

	if(noCommon==True):
		number = 10
		for question in questions:
			if(number >= 0):
				questionsReturned.append(question)
			else:
				break
			number-=1
		return jsonify({'questions':questionsReturned})

	overlapQuestions.sort(key=returnOverLapScore,reverse=True)
	print("Overlap is : ",overlapQuestions)
	for i in range(k):
		overlapQuestions[i][0]['_id']=str(overlapQuestions[i][0]['_id'])
		questionsReturned.append(overlapQuestions[i][0])
		overLapScores.append(overlapQuestions[i][1])

	return jsonify({'questions':questionsReturned})


#get notes similar to user
@app.route('/notes/reconotes',methods=['POST'])
def getNotesSimilarToUser():
	k=10
	data=request.get_json()
	print(data)
	userID= data['asked_by']

	noCommon = True

	print("User id : ",userID)
	overLapScores=[]

	notes=list(mongo.db.notes.find())
	notesReturned=[]

	if(len(notes)<=k):
		k=len(notes)

	userTags={}
	userSubjects={}
	userFound=False

	profileData = get_userDetails(userID)
	print("Profile Data : :",profileData)
	#if(profileData['result']=='unsuccess'):
	#	return

	userdata = profileData
	userSubjects = userdata["topSubjects"]
	userTags = userdata["topTags"]
	overlapNotes=[]

	for note in notes:
		overLapScore=1
		noteTags=note["tag"]
		noteSubject=note["subject"]
		if(noteSubject in userSubjects):
			overLapScore+=userSubjects[noteSubject]
		for tag in noteTags:
			if(tag in userTags):
				overLapScore+=userTags[tag]
		if(noCommon==True and overLapScore>1):
			noCommon=False
		overlapNotes.append([note,overLapScore])

	if(noCommon==True):
		number = 10
		for note in notes:
			if(number >= 0):
				notesReturned.append(note)
			else:
				break
			number-=1
		return jsonify({'notes':notesReturned})

	overlapNotes.sort(key=returnOverLapScore,reverse=True)
	print("Overlap is : ",overlapNotes)
	for i in range(k):
		overlapNotes[i][0]['_id']=str(overlapNotes[i][0]['_id'])
		notesReturned.append(overlapNotes[i][0])
		overLapScores.append(overlapNotes[i][1])

	return jsonify({'notes':notesReturned})

#get notes similar to user
@app.route('/projects/recoprojects',methods=['POST'])
def getProjectsSimilarToUser():
	k=10
	data=request.get_json()
	print(data)
	userID= data['asked_by']

	noCommon = True

	print("User id : ",userID)
	overLapScores=[]

	projects=list(mongo.db.ideas.find())
	projectsReturned=[]

	if(len(projects)<=k):
		k=len(projects)

	userTags={}
	userSubjects={}
	userFound=False

	profileData = get_userDetails(userID)
	print("Profile Data : :",profileData)
	#if(profileData['result']=='unsuccess'):
	#	return

	userdata = profileData
	userSubjects = userdata["topSubjects"]
	userTags = userdata["topTags"]
	overlapProjects=[]

	for project in projects:
		overLapScore=1
		projectTags=project["tag"]
		projectSubject=project["subject"]
		if(projectSubject in userSubjects):
			overLapScore+=userSubjects[projectSubject]
		for tag in projectTags:
			if(tag in userTags):
				overLapScore+=userTags[tag]
		if(noCommon==True and overLapScore>1):
			noCommon=False
		overlapProjects.append([project,overLapScore])

	if(noCommon==True):
		number = 10
		for project in projects:
			if(number >= 0):
				projectsReturned.append(project)
			else:
				break
			number-=1
		return jsonify({'projects':projectsReturned})

	overlapProjects.sort(key=returnOverLapScore,reverse=True)
	print("Overlap is : ",overlapProjects)
	for i in range(k):
		overlapProjects[i][0]['_id']=str(overlapProjects[i][0]['_id'])
		projectsReturned.append(overlapProjects[i][0])
		overLapScores.append(overlapProjects[i][1])

	return jsonify({'projects':projectsReturned})

#ML Part ends here.
if __name__ == '__main__':
   app.run(debug = True)
