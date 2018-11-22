import pickle
import csv
from nltk.corpus import stopwords


data = (open("data.txt","r")).read().split('\n')
print(len(data))

stopWords = set(stopwords.words('english'))
stopWords = list(stopWords)

subjects=[]
subjectsData = {}

first = True
currSubject=""
content =""
prevLineStart = False
for line in data:
	if(line.strip()=="UECS"):
		#print("Reached")
		prevLineStart = True
		
		if(first == False):
			subjectsData[currSubject] = content[content.find("Course"):]
		else:
			first = False
		#print(prevLineStart)
		#break
	elif(prevLineStart == True):
		#print(line)
		prevLineStart = False
		subjects.append(line.strip().lower())
		content=""
		currSubject = line.strip().lower()
		#break
	content +=' '+line.strip(' ')
subjects=subjects[0:len(subjects)-1]
print(subjects)
print(len(subjects))

subjectsWords = {}
#print(subjects[0],subjectsData[subjects[0]])
for subject in subjects:
	content = subjectsData[subject].lower()
	content = content[content.find("course content")+17:content.find(".prerequisite courses")]

	content = content.split()
	keywords = []
	for word in content:
		if(word != '.' and word not in stopWords):
			keywords.append(word.strip().strip('.'))

	subjectsWords[subject] = list(set(keywords))
print(subjects[0])
print(subjectsWords[subjects[0]])

print(subjectsWords["machine learning"])


pickle.dump(subjects,open("subjects.pickle","wb"))
pickle.dump(subjectsWords,open("subjectsWords.pickle","wb"))


