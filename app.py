import csv
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def main():
    return render_template('main.html', data={})

@app.route('/data')
def data():
    data = {"timestamps": [], "hr": [], "br": [], "temp": [], "valence": [], "stress": [], "incident": []}
    with open('csv/data.csv', newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',')
        for row in spamreader:
            try:
                int(row[0])
            except:
                continue
            data["timestamps"].append(row[0])
            data["hr"].append(row[1])
            data["br"].append(row[2])
            data["temp"].append(row[3])
            data["valence"].append(row[4])
            data["stress"].append(row[5])
            data["incident"].append(row[6])
    data["max_hr"] = max(data["hr"])
    data["min_hr"] = min(data["hr"])
    data["max_br"] = max(data["br"])
    data["min_br"] = min(data["br"])
    data["max_temp"] = max(data["temp"])
    data["min_temp"] = min(data["temp"])
    return data
