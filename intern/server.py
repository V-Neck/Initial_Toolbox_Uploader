import os, random, toolbox, re, tempfile
from flask import Flask, request, render_template, url_for

UPLOAD_FOLDER = "temp"
tempfile.tempdir = UPLOAD_FOLDER
CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"
TOOLBOX_LINE_PATTERN = re.compile(r"^\\[a-z]+")
TB_STD_MKRS = ['\\ref', '\\t', '\\m','\\g', '\\f', '\\l']
TB_STD_MKR_INTERP = ['reference', 'text', 'morphemes', 'gloss','free translation', 'literal translation']
TOOLBOX_STD_MKR = dict(zip(TB_STD_MKRS, TB_STD_MKR_INTERP))

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/upload", methods=['GET', 'POST'])
def upload(name=None):
    if request.method == 'POST':
        print request.get_json()

    return render_template("upload.html")


@app.route("/success", methods=['GET', 'POST'])
def success(name=None):
    return render_template("success.html")


#returns a new, unique, random filename
def rand_string(path, N):
    dirs = os.listdir(path)
    file_name = ''.join(random.choice(CHARS) for _ in range(N))

    while file_name in dirs:
        file_name = ''.join(random.choice(CHARS) for _ in range(N))

    return file_name

#determines whether the user used standard keys
#Quick and dirty method just checks if they ever used a non standard marker
#fuller method also checks for order
def uses_std_mkrs(mkrs, quick_and_dirty=False):
    if quick_and_dirty:
        for mkr in mkrs:
            if mkr not in TB_STD_MKRS():
                return False
        return True
    else:
        #hacky temporary fix to the problem of pairs not including "ref"
        if len(mkrs) != (len(TB_STD_MKRS) -1):
            return False
        i = 0
        while i < len(mkrs) and i < len(TB_STD_MKRS):
            if not mkrs[i] == TB_STD_MKRS[i]:
                return False
            i += 1
        print mkrs, TB_STD_MKRS
        print i
        return True

#determines whether upload used standard keys in standard order
def get_non_std_mkrs(mkrs):
    print mkrs
    print  TB_STD_MKRS
    non_std_mkrs = []
    i = 0
    #hacky temporary fix to the problem of pairs not including "ref"
    while i < len(mkrs) and i < (len(TB_STD_MKRS)-1):
        #hacky temporary fix to the problem of pairs not including "ref"
        if not mkrs[i] == TB_STD_MKRS[i+1]:
            non_std_mkrs.append(mkrs[i])
        i += 1
    return non_std_mkrs

def find_delimiter(lines):
    block_initial_marker = lines[0].split(" ")[0]
    for i in range(1, len(lines)):
        if lines[i] == block_initial_marker:
            print lines[i]
            return lines[i-1]
    return "\n\n"
2
if __name__ == "__main__":
    app.run(debug=True)
