import json

def readQuestions():
	with open("data/questions.json", "r") as readFile:
		questions=json.load(readFile)
	readFile.close()
	return questions

def readNotesData():
	with open("data/notes.json", "r") as readFile:
		notes=json.load(readFile)
	readFile.close()
	return notes

def readProfiles():
	with open("data/profile.json", "r") as readFile:
		profiles=json.load(readFile)
	readFile.close()
	return profiles

def returnOverLapScore(a):
	return a[1]

def getQuestionsSimilarToUser(userID,k):
	overLapScores=[]
	questions=readQuestions()
	questionsReturned=[]
	if(len(questions)<=k):
		k=len(questions)
	userTags={}
	userSubjects={}
	userFound=False
	profiles=readProfiles()
	noCommon=True
	for user in profiles:
		if(profiles[user]["_id"]==userID):
			userTags=profiles[user]["topTags"]
			userSubjects=profiles[user]["topSubjects"]
			userFound=True
			break
	if(not userFound):
		print("User not Found")
		return None
	overlapQuestions=[]
	for question in questions:
		overLapScore=1
		questionTags=questions[question]["tag"]
		questionSubject=questions[question]["subject"]
		if(questionSubject in userSubjects):
			overLapScore+=userSubjects[questionSubject]
		for tag in questionTags:
			if(tag in userTags):
				overLapScore+=userTags[tag]
		if(noCommon==True and overLapScore>1):
			noCommon=False
		overlapQuestions.append([question,overLapScore])
	if(noCommon==True):
		for i in range(k):
			questionsReturned.append(questions[str(i)])
			overLapScores.append(1)
		return questionsReturned
	overlapQuestions.sort(key=returnOverLapScore,reverse=True)
	for i in range(k):
		questionsReturned.append(questions[str(overlapQuestions[i][0])])
		overLapScores.append(overlapQuestions[i][1])
	return questionsReturned,overLapScores

def getQuestionsSimilarToNotes(notesID,k):
	questions=readQuestions()
	questionsReturned=[]
	if(len(questions)<=k):
		k=len(questions)
	notesTags=[]
	notesSubjects=''
	noteFound=False
	notes=readNotesData()
	noCommon=True
	for note in notes:
		if(notes[note]["_id"]==notesID):
			notesTags=notes[note]["tag"]
			notesSubjects=notes[note]["subject"]
			noteFound=True
			break
	if(not noteFound):
		print("User not Found")
		return None
	overlapQuestions=[]
	for question in questions:
		overLapScore=1
		questionTags=questions[question]["tag"]
		questionSubject=questions[question]["subject"]
		if(questionSubject == notesSubjects):
			overLapScore+=1
		for tag in questionTags:
			if(tag in notesTags):
				overLapScore+=1
		if(noCommon==True and overLapScore>1):
			noCommon=False
		overlapQuestions.append([question,overLapScore])
	if(noCommon==True):
		for i in range(k):
			questionsReturned.append(questions[str(i)])
		return questionsReturned
	overlapQuestions.sort(key=returnOverLapScore,reverse=True)
	for i in range(k):
		questionsReturned.append(questions[str(overlapQuestions[i][0])])
	return questionsReturned

def getNotesSimilarToUser(userID,k):
	notes=readNotesData()
	notesReturned=[]
	if(len(notes)<=k):
		k=len(notes)
	userTags={}
	userSubjects={}
	userFound=False
	profiles=readProfiles()
	noCommon=True
	for user in profiles:
		if(profiles[user]["_id"]==userID):
			userTags=profiles[user]["topTags"]
			userSubjects=profiles[user]["topSubjects"]
			userFound=True
			break
	if(not userFound):
		print("User not Found")
		return None
	overlapNotes=[]
	for note in notes:
		overLapScore=1
		noteTags=notes[note]["tag"]
		noteSubject=notes[note]["subject"]
		if(noteSubject in userSubjects):
			overLapScore+=userSubjects[noteSubject]
		for tag in noteTags:
			if(tag in userTags):
				overLapScore+=userTags[tag]
		if(noCommon==True and overLapScore>1):
			noCommon=False
		overlapNotes.append([note,overLapScore])
	if(noCommon==True):
		for i in range(k):
			notesReturned.append(notes[str(i)]["_id"])
		return notesReturned
	overlapNotes.sort(key=returnOverLapScore,reverse=True)
	for i in range(k):
		notesReturned.append(notes[str(overlapNotes[i][0])]["_id"])
	return notesReturned

a,b=getQuestionsSimilarToUser("ObjectId('5bd8626a655e4e16b09ed781')",2)
for i in a:
	print(i)
for i in b:
	print(i)

print(getNotesSimilarToUser("ObjectId('5bd8626a655e4e16b09ed781')",2))

print(getQuestionsSimilarToNotes("ObjectId('5bc22037fdc52ba0ad988d64')",2))