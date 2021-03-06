from lameufquijouedans import app
from flask import Flask
from lameufquijouedans.celery.flask_celery import make_celery

celery = make_celery(app)

@celery.task(name='test_check')
def check(obj):
    if obj:
        return True
    else:
        return False

@celery.task(name='test_bool')
def bool(obj):
    if obj:
        return 1
    else:
        return 0
