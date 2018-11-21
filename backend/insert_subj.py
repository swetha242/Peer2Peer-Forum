from flask import Flask, redirect, url_for,jsonify,request,flash,abort
from flask_cors import CORS, cross_origin
from flask_pymongo import PyMongo
from bson.json_util import dumps
from bson.objectid import ObjectId
import json
import pickle


app = Flask(__name__)
CORS(app)
app.config["MONGO_URI"] = "mongodb://localhost:27017/P2Pdb"
mongo = PyMongo(app)

subjectsFile = open("subjects.pickle","rb")
subjectsTagsFile = open("subjectsWords.pickle","rb")

subjects = pickle.load(subjectsFile)
subjectsTags = pickle.load(subjectsTagsFile)

subjects=list(set(subjects))
sub={}
tags={}
for i in subjects:
    sub[i]=0
print(sub)

for i in subjectsTags.keys():
    for j in subjectsTags[i]:
        tags[j]=0
print(tags)
mongo.db.globaltrends.insert({'_id':1,'subject':sub,'tag':tags},check_keys=False)
#print(subjectsTags)

if __name__ == '__main__':
   app.run(debug = True)
