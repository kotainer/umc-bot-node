from telethon import TelegramClient
from telethon.tl.functions.contacts import ResolveUsernameRequest
from telethon.tl.functions.channels import GetParticipantsRequest
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.tl.types import ChannelParticipantsSearch
from telethon.tl.types import UserStatusRecently
from telethon.tl.types import UserStatusEmpty
from telethon.tl.types import UserStatusLastWeek
from telethon.tl.types import UserStatusOnline
from telethon.tl.types import UserStatusLastMonth
from telethon.tl.types import UserStatusOffline

from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib
import json

api_hash = 'f2193e644c58530c6e35c222cc1aa91a'  #'dec3fd055d1ed7cd2be93b793924c28'
api_id = 56861 #219546
phone_number = '79997973497' #'79995860623'

client = TelegramClient(phone_number, api_id, api_hash)
client.session.report_errors = False
client.connect()

if not client.is_user_authorized():
    client.send_code_request(phone_number)
    client.sign_in(phone_number, input('Enter the code: '))

def get_channel_users(channel_name):
    result = []
    offset = 0
    limit = 100

    channel = client(ResolveUsernameRequest(channel_name))

    while True:
        participants = client(GetParticipantsRequest(
            channel, ChannelParticipantsSearch(''), offset, limit,
            hash=0
        ))
        if not participants.users:
            break

        for _user in participants.users:
            if type(_user.status) is UserStatusOffline:
                result.append({
                    'id': _user.id,
                    'bot': _user.bot,
                    'status': _user.status.was_online.isoformat()
                })
            elif type(_user.status) is UserStatusLastWeek:
                result.append({
                    'id': _user.id,
                    'bot': _user.bot,
                    'status': 'week'
                })
            elif type(_user.status) is UserStatusLastMonth:
                result.append({
                    'id': _user.id,
                    'bot': _user.bot,
                    'status': 'month'
                })
            elif type(_user.status) is UserStatusOffline:
                result.append({
                    'id': _user.id,
                    'bot': _user.bot,
                    'status': 'offline'
                })
            elif type(_user.status) is UserStatusOnline:
                result.append({
                    'id': _user.id,
                    'bot': _user.bot,
                    'status': 'online'
                })
            elif type(_user.status) is UserStatusRecently:
                result.append({
                    'id': _user.id,
                    'bot': _user.bot,
                    'status': 'recently'
                })
            else:
                result.append({
                    'id': _user.id,
                    'bot': _user.bot,
                    'status': 'empty'
                })

                
        offset += len(participants.users)

    return result

def join_channel(channel_name):
    channel = client(ResolveUsernameRequest(channel_name))
    client(JoinChannelRequest(channel))

    return 0

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    def setup(self):
        BaseHTTPRequestHandler.setup(self)
        self.request.settimeout(300)

    def do_GET(self):
        try:
            params = urllib.parse.parse_qs(self.path[2:])
            users = get_channel_users(params['channel'][0])

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(users).encode())
        except Exception as e:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def do_POST(self):
        try:
            params = urllib.parse.parse_qs(self.path[2:])
            join_channel(params['channel'][0])
            myself = client.get_me()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'result': True, 'userId': myself.id}).encode())
        except Exception as e:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

httpd = HTTPServer(('localhost', 8011), SimpleHTTPRequestHandler)
httpd.serve_forever()