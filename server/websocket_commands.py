from websocket_server import WebsocketServer

def getClientFromID(clients, id):
	for c in clients:
		if c['id'] == id:
			return c

	return None

# Handles Message with PIN Data
def pinMessage(client, server, client_pairs, client_room, message):
	message = message[5:]
	pin = message.strip()

	roomLen = len(client_pairs[pin])
	if roomLen == 0:
		client_pairs[pin] = [client['id']]
		client_room[client['id']] = "1"
		print(f"Setting ID: {client['id']} to player 1")
		server.send_message(getClientFromID(server.clients, client['id']), "PLAYER: 1")
	elif roomLen == 1:
		client_pairs[pin] = client_pairs[pin] + [client['id']]
		client_room[client['id']] = "1"
		print(f"Setting ID: {client['id']} to player 2")
		server.send_message(getClientFromID(server.clients, client['id']), "PLAYER: 2")

		# Tell user we can start game
		for c in client_pairs[pin]:
			server.send_message(getClientFromID(server.clients, c), "READY")

	elif roomLen == 2:
		## Add code to tell user the room is full
		pass
	else:
		## Add code for error as roomLen should not be greater than 2
		print(f"ERROR, room length is greater than 2, found {roomLen}")	

# Handles Messages Of Mouse Movement
def moveMessage(client, server, client_pairs, client_room, message):	
	roomPin = client_room.setdefault(client['id'], None)

	if roomPin != None:
		if (len(client_pairs[roomPin]) == 2):
			message = message[6:]
			currPos = float(message.strip())

			##print(client_pairs)
			clients = client_pairs[str(client_room[client['id']])]
			if clients[0] == client['id']:
				server.send_message(getClientFromID(server.clients, clients[1]), f"MOVE: {currPos}")
			else:
				server.send_message(getClientFromID(server.clients, clients[0]), f"MOVE: {currPos}")

# Handles Pong Xpos Movement
def ballXMessage(client, server, client_pairs, client_room, message):
	roomPin = client_room.setdefault(client['id'], None)

	if roomPin != None:
		if (len(client_pairs[roomPin]) == 2):
			message = message[7:]
			currPos = float(message.strip())

			clients = client_pairs[str(client_room[client['id']])]
			server.send_message(getClientFromID(server.clients, clients[1]), f"BALLX: {currPos}")

# Handles Pong Ypos Movement
def ballYMessage(client, server, client_pairs, client_room, message):
	roomPin = client_room.setdefault(client['id'], None)

	if roomPin != None:
		if (len(client_pairs[roomPin]) == 2):
			message = message[7:]
			currPos = float(message.strip())

			clients = client_pairs[str(client_room[client['id']])]
			server.send_message(getClientFromID(server.clients, clients[1]), f"BALLY: {currPos}")