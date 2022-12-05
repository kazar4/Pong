import logging
from websocket_server import WebsocketServer
import time
from websocket_commands import *
import _thread

# pip install websocket-server

client_pairs = {}
client_room = {}

def new_client(client, server):
	#server.send_message_to_all("Hey all, a new client has joined us")
	#print(client)
	#for i in server.clients:
	#	print(i['id'])
	pass

# Called for every client disconnecting
def client_left(client, server):
	print("Client(%d) disconnected" % client['id'])

def message_received(client, server, message):
    
	#print(client_pairs)
	#print(client_room)

	if len(message) > 200:
			message = message[:200]+'..'

	if "PIN: " in message:
		pinMessage(client, server, client_pairs, client_room, message)
	elif "MOVE: " in message:
		moveMessage(client, server, client_pairs, client_room, message)	
	elif "BALLX: " in message:
		ballXMessage(client, server, client_pairs, client_room, message)
	elif "BALLY: " in message:
		ballYMessage(client, server, client_pairs, client_room, message)		

	
	#print("Client(%d) said: %s" % (client['id'], message))

def check_state():
	import sched, time
	s = sched.scheduler(time.time, time.sleep)
	def do_something(sc): 
		# print(client_pairs)
		# do your stuff
		s.enter(5, 1, do_something, (sc,))

	s.enter(5, 1, do_something, (s,))
	s.run()

_thread.start_new_thread(check_state, ())

server = WebsocketServer(host='0.0.0.0', port=13555, loglevel=logging.INFO, key="/ssl/server.key", cert="/ssl/server.crt")
server.set_fn_new_client(new_client)
server.set_fn_client_left(client_left)
server.set_fn_message_received(message_received)
server.run_forever()