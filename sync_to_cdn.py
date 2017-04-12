import hashlib
import os
import glob
import sys
import urllib
from qiniu import Auth, put_file, etag, urlsafe_base64_encode
from qiniu import BucketManager
import qiniu.config
import fnmatch

DEBUG = False
cur_path = sys.path[0]
execfile(cur_path + '/config.py')

q = Auth(config['AK'], config['SK'])

bucket = BucketManager(q)

def write(filename, content, append = False):
    type='w'
    if append:
        type = 'a'
    fileObj = open(filename,type,-1)
    fileObj.write(content)
    fileObj.close()

def sha1(a):
    m2=hashlib.sha1()
    m2.update(a)
    return m2.hexdigest()

def run_script(script, stdin=None):
    """Returns (stdout, stderr), raises error on non-zero return code"""
    import subprocess
    # Note: by using a list here (['bash', ...]) you avoid quoting issues, as the
    # arguments are passed in exactly this order (spaces, quotes, and newlines won't
    # cause problems):
    proc = subprocess.Popen(['bash', '-c', script],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        stdin=subprocess.PIPE)
    stdout, stderr = proc.communicate()
    stdout = stdout.decode('utf-8', 'ignore')

    if proc.returncode:
        print stderr
    return stdout, stderr

def delete(bucket_name, key):
    ret, info = bucket.delete(bucket_name, key)
    if DEBUG:
        print(info)
        assert ret == {}

def refresh(url):
    token, err = run_script('echo "/v2/tune/refresh" |openssl dgst -binary -hmac "' + config['SK'] + '" -sha1 |base64 | tr + - | tr / _')
    token = token[:-1]
    curl = 'curl -X POST -H "Authorization: QBox ' + config['AK'] + ":" + token + "\" http://fusion.qiniuapi.com/v2/tune/refresh -d '{\"urls\":[\"" + url + "\"]}' -H 'Content-Type: application/json'"
    result, err = run_script(curl)
    if DEBUG:
        print result


def upload(localfile, bucket_name, key):
    token = q.upload_token(bucket_name, key, 3600)
    ret, info = put_file(token, key, localfile)
    if DEBUG:
        print(info)
        assert ret['key'] == key
        assert ret['hash'] == etag(localfile)

def get_all_files(build_path):
    matches = []
    for root, dirnames, filenames in os.walk(build_path):
        for filename in fnmatch.filter(filenames, '*'):
            matches.append(os.path.join(root, filename))
    return matches;

build_path = 'build'
files = get_all_files(build_path)

for i in files:
    if i.find('.sha1') > 0:
        continue
    sha_file = i + '.sha1'
    content_hash = sha1(open(i).read())
    if os.path.exists(sha_file):
        if open(sha_file).read() == content_hash:
            continue

    write(sha_file, content_hash)
    localfile = i
    key = config['prefix'] + i[len(build_path) + 1:]
    print localfile
    full_url = config['domain'] + key
    delete(config['bucket'], full_url)
    upload(localfile, config['bucket'], key)
    refresh(full_url)
