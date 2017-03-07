import os, random, toolbox, re
from flask import Flask, request, render_template, url_for
UPLOAD_FOLDER = "uploads"
CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"
TOOLBOX_LINE_PATTERN = re.compile(r"^\\[a-z]+")
TB_STD_MKR_DIR = "formats/std_tb_mrks.txt"
TOOLBOX_STD_MKR = dict([line.split(",") for line in open(TB_STD_MKR_DIR).readlines()])
"""Error Codes:
    Code | Reason
    42   | Non standard maker
"""
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/upload", methods=['GET', 'POST'])
def upload(name=None):
    if request.method == 'POST':
        toolbox_file = request.files["toolbox_file"]
        file_name = rand_string(UPLOAD_FOLDER, 10) + ".txt"
        path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
        toolbox_file.save(path)

        lines = toolbox.read_toolbox_file(open(path))
        records = toolbox.records(lines, ['\\id', '\\ref'])
        #TODO better understand what's going on here
        rec1 = next(records)
        pairs = [_ for _ in toolbox.normalize_record(rec1[1], ['\\t', '\\g', '\\m'])]

        if uses_std_mkrs([x[0] for x in pairs]):
            return render_template("success.html", pairs=pairs[:len(TOOLBOX_STD_MKR)], mkr_format=TOOLBOX_STD_MKR)
        else:
            non_std_mkrs = get_odd_mkrs([x[0] for x in pairs])
            os.remove(path)
            return render_template("non_std_fail.html", mkr_format=TOOLBOX_STD_MKR, non_std_mkrs=non_std_mkrs)

    return render_template("upload.html", name=name)

#returns a new, unique, random filename
def rand_string(path, N):
    dirs = os.listdir(path)
    file_name = ''.join(random.choice(CHARS) for _ in range(N))

    while file_name in dirs:
        file_name = ''.join(random.choice(CHARS) for _ in range(N))

    return file_name

def uses_std_mkrs(mkrs):
    for mkr in mkrs:
        if mkr not in TOOLBOX_STD_MKR.keys():
            return False
    return True

def get_odd_mkrs(mkrs):
    non_std_mkrs = []
    for mkr in mkrs:
        if mkr not in TOOLBOX_STD_MKR.keys():
            print mkr
            non_std_mkrs.append(mkr)
    return non_std_mkrs

if __name__ == "__main__":
    app.run(debug=True)
