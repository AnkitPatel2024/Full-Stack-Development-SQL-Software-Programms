from flask import Flask, request, g
from flask_restful import Resource, Api
from sqlalchemy import create_engine
from flask import jsonify
import json
import string
import time
import eth_account
import algosdk

from algosdk.v2client import algod
from algosdk.v2client import indexer
from algosdk import account
from algosdk.future import transaction
from web3 import Web3


from algosdk import mnemonic
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import load_only
from datetime import datetime
import math
import sys
import traceback


# TODO: make sure you implement connect_to_algo, send_tokens_algo, and send_tokens_eth
from send_tokens import connect_to_algo, connect_to_eth, send_tokens_algo, send_tokens_eth

from models import Base, Order, TX, Log
engine = create_engine('sqlite:///orders.db')
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)

#w3 = Web3()
#w3.eth.account.enable_unaudited_hdwallet_features()
#acct,mnemonic_secret = w3.eth.account.create_with_mnemonic()

#mnemonic_secret = "sausage thing rural image gallery address ill soap scorpion rely update inch"

#algo_sk, algo_pk = get_algo_keys()
#eth_sk, eth_pk = get_eth_keys(mnemonic_secret)

mnemonic_secret = "today festival smart catalog skate acquire tomato super elite estate clip major"
algo_sk, algo_pk = "", ""
eth_sk, eth_pk = "",""

icl = connect_to_algo(connection_type = 'indexer')
acl = connect_to_algo()
w3 = connect_to_eth()

app = Flask(__name__)

""" Pre-defined methods (do not need to change) """

@app.before_request
def create_session():
	g.session = scoped_session(DBSession)

@app.teardown_appcontext
def shutdown_session(response_or_exc):
	sys.stdout.flush()
	g.session.commit()
	g.session.remove()

def connect_to_blockchains():
	try:
		# If g.acl has not been defined yet, then trying to query it fails
		acl_flag = False
		g.acl
	except AttributeError as ae:
		acl_flag = True

	try:
		if acl_flag or not g.acl.status():
			# Define Algorand client for the application
			g.acl = connect_to_algo()
	except Exception as e:
		print("Trying to connect to algorand client again")
		print(traceback.format_exc())
		g.acl = connect_to_algo()

	try:
		icl_flag = False
		g.icl
	except AttributeError as ae:
		icl_flag = True

	try:
		if icl_flag or not g.icl.health():
			# Define the index client
			g.icl = connect_to_algo(connection_type='indexer')
	except Exception as e:
		print("Trying to connect to algorand indexer client again")
		print(traceback.format_exc())
		g.icl = connect_to_algo(connection_type='indexer')


	try:
		w3_flag = False
		g.w3
	except AttributeError as ae:
		w3_flag = True

	try:
		if w3_flag or not g.w3.isConnected():
			g.w3 = connect_to_eth()
	except Exception as e:
		print("Trying to connect to web3 again")
		print(traceback.format_exc())
		g.w3 = connect_to_eth()

""" End of pre-defined methods """

""" Helper Methods (skeleton code for you to implement) """


def check_sig(payload,sig):
		platform = payload.get('platform')
		public_key = payload.get('sender_pk')
		receiver_key = payload.get('receiver_pk')
		sig_obj = sig
		payload = json.dumps(payload)
		#content = {'sig':sig, 'payload':payload}

		if (platform == 'Algorand'):
			algo_sig_str = sig_obj
			if algosdk.util.verify_bytes(payload.encode('utf-8'), algo_sig_str, public_key):
				return True
			else:
				return False
		
		elif (platform == 'Ethereum'):
			eth_encoded_msg = eth_account.messages.encode_defunct(text=payload)
			if eth_account.Account.recover_message(eth_encoded_msg, signature=sig_obj) == public_key:		
				return True
			else:
				return False

def check_txn(order_dict):
		txid = order_dict['tx_id']
		print("TXID OF Order:")
		print(txid)
		platform = order_dict['sell_currency']
		sell_amount = order_dict['sell_amount']
		sender = order_dict['sender_pk']
		#print("Sender of Order:")
		#print(sender)
		
				
		if (platform == 'Algorand'):
			time.sleep(5)
			tx = icl.search_transactions(txid = txid)
			#print("printing tx for algo")
			#print(tx)
			txlist = tx['transactions']
			
			len_l = len(txlist)
				 
			if len_l == 0:		      
			      	return False
			      
			txn_sender = txlist[0]['sender']
			for txn in txlist:
				if 'payment-transaction' in txn.keys():
					txn_rec = txn['payment-transaction']['receiver']
					#print("TX receiver from TXID:")
					#print(txn_rec)
					txn_amt =  txn['payment-transaction']['amount']
					#print("Amount from TXID")
					#print(txn_amt)
					
					#print("Sender from TXID:")
					#print(txn_sender)
					#print("algo_pk:")
					algo_sk, algo_pk = get_algo_keys()
					#print(algo_pk)
					if txn['payment-transaction']['receiver'] == algo_pk and txn['payment-transaction']['amount'] ==sell_amount and txn_sender == sender :
		
						#print("algo transaction sent to exchange was verified")
						return True
	
				else:
					print("algo transaction sent to exchange was NOT verified line 188")
					return False
			
		elif (platform == 'Ethereum'):
			tx = w3.eth.get_transaction(txid)
			#print("printing tx for Eth")
			#print(tx)
			eth_sk, eth_pk = get_eth_keys(mnemonic_secret)
			#print("ETH PK:")
			#print(eth_pk)
			#print("tx[to] from tx:")
			#print(tx['to'])
			#print("tx[value] from tx:")
			#print(tx['value'])
			#print("tx[from] from tx:")
			#print(tx['from'])
			#print("comparing tx[to] == eth_pk and tx[value] ==sell_amount and tx[from] ==sender")      
			if (tx['to'] == eth_pk and tx['value'] ==sell_amount and tx['from'] ==sender):
				#print("Eth transaction sent to exchange was verified")
				return True
			else:
				print("Eth transaction sent to exchange was NOT verified line 209")
				return False
				
def log_message(message_dict):
	msg = json.dumps(message_dict)
	# TODO: Add message to the Log table
	add_log = Log(logtime = datetime.now(), message = msg)
	g.session.add(add_log)
	g.session.commit()   

def toDict(ord):
	rec_key = ord.receiver_pk
	sen_key = ord.sender_pk
	sig = ord.signature
	buy_c = ord.buy_currency
	sell_c = ord.sell_currency
	buy_amt = ord.buy_amount
	sell_amt = ord.sell_amount
	txid = ord.tx_id
	order_dict = {'sender_pk':sen_key, 'receiver_pk':rec_key,'buy_currency': buy_c, 'sell_currency': sell_c, 'buy_amount':buy_amt, 'sell_amount':sell_amt,'signature':sig, 'tx_id':txid}
	return order_dict

def get_algo_keys():

	# TODO: Generate or read (using the mnemonic secret)
	# the algorand public/private keys
	mnemonic_secret = "dress edge digital wisdom forward grief friend wet tag hurdle hope tool original wedding steel screen problem inquiry save permit perfect mammal network absorb leopard"
	algo_sk = mnemonic.to_private_key(mnemonic_secret)
	algo_pk = mnemonic.to_public_key(mnemonic_secret)

	return algo_sk, algo_pk


def get_eth_keys(mnemonic_secret):	
	#w3 = Web3()
	w3.eth.account.enable_unaudited_hdwallet_features()
	
	# TODO: Generate or read (using the mnemonic secret)
	# the ethereum public/private keys
	acct = w3.eth.account.from_mnemonic(mnemonic_secret)
	eth_pk = acct._address
	eth_sk = acct._private_key
   
	return eth_sk, eth_pk
  
  
def fill_order(order, txes):
	# TODO:
	# Match orders (same as Exchange Server II)
	ed_order = Order(sender_pk=order['sender_pk'], receiver_pk=order['receiver_pk'], buy_currency=order['buy_currency'],sell_currency=order['sell_currency'], buy_amount=order['buy_amount'],sell_amount=order['sell_amount'], signature=order['signature'], tx_id=order['tx_id'])
	if 'creator_id' in order.keys():
		ed_order.creator_id = order['creator_id']
	print("ed_order buy_amount on line 258:")
	print(ed_order.buy_amount)
	## txes.append(ed_order)	
	g.session.add(ed_order)
	g.session.commit()

	imp_exchange_rate = order['sell_amount'] / order['buy_amount']
	
	# check if there are any existing orders that match the new order
	orders = g.session.query(Order).filter(Order.filled == None).all()    #get all unfilled orders
	#print(orders)
	for o in orders:
		if ((o.buy_currency == ed_order.sell_currency) and (o.sell_currency == ed_order.buy_currency)):
			b2s_exchange_rate = o.buy_amount / o.sell_amount
			if imp_exchange_rate >= o.buy_amount / o.sell_amount:
				
				# a match is found
				# set the tfilled field to be the current timestamp
				o.filled = datetime.now()
				ed_order.filled = o.filled

				# set counterpartyid to be the id of the each other
				ed_order.counterparty_id = o.id
				o.counterparty_id = ed_order.id
				
				#make transactions for the matched orders and add that to the transaction list txes, make sure to deduct child buy amount when you transfer
				tx1 = TX(platform=ed_order.buy_currency, receiver_pk = ed_order.receiver_pk, order_id=ed_order.id)
				tx2 = TX(platform=o.buy_currency, receiver_pk = o.receiver_pk, order_id=o.id )
				#print("tx1 and tx2 line 298")
				#print(tx1)
				#print(tx2)
				txes.append(tx1)				
				txes.append(tx2)
				#print(txes)
				
				g.session.commit()
				# if one of the order is not completely filled, get the derived order
				if (ed_order.buy_amount > o.sell_amount):
					child_order_buy = ed_order.buy_amount - int(o.sell_amount)
					print("child_order_buy:")
					print(child_order_buy)
					child_order_sell = child_order_buy * imp_exchange_rate
					print("child_order_sell:")
					print(child_order_sell)
					child_creater_id = ed_order.id
					child_order_dict = {'sender_pk': ed_order.sender_pk, 'receiver_pk': ed_order.receiver_pk,'buy_currency': ed_order.buy_currency, 'sell_currency': ed_order.sell_currency,'buy_amount': child_order_buy, 'sell_amount': child_order_sell,'creator_id': child_creater_id, 'signature':ed_order.signature, 'tx_id':ed_order.tx_id}
					#ed_order.child = child_order
					#session.commit()
					fill_order(child_order_dict, txes)
					#session.commit()
				if (ed_order.sell_amount < o.buy_amount):
					child_order_buy = o.buy_amount - int(ed_order.sell_amount)
					print("child_order_buy:")
					print(child_order_buy)
					child_order_sell = (child_order_buy * o.sell_amount) / o.buy_amount
					print("child_order_sell:")
					print(child_order_sell)
					child_creater_id = o.id
					child_order_dict = {'sender_pk': o.sender_pk, 'receiver_pk': o.receiver_pk,'buy_currency': o.buy_currency, 'sell_currency': o.sell_currency,'buy_amount': child_order_buy, 'sell_amount': child_order_sell,'creator_id': child_creater_id, 'signature':o.signature, 'tx_id':o.tx_id}
					#o.child = child_order
					#session.commit()
					fill_order(child_order_dict, txes)
					#session.commit()
			#print("LEN OF TXES in fill_order:")
			#print(len(txes))
			return txes 
	# Validate the order has a payment to back it (make sure the counterparty also made a payment)
	# Make sure that you end up executing all resulting transactions!
  
  
def execute_txes(txes):
	if txes is None:
		return True
	if len(txes) == 0:
		return True
	print( f"Trying to execute {len(txes)} transactions" )
	print( f"IDs = {[tx.order_id for tx in txes]}" )
	eth_sk, eth_pk = get_eth_keys(mnemonic_secret)
	algo_sk, algo_pk = get_algo_keys()

	if not all( tx.platform in ["Algorand","Ethereum"] for tx in txes ):
		print( "Error: execute_txes got an invalid platform!" )
		print( tx.platform for tx in txes )

	algo_txes = [tx for tx in txes if tx.platform == "Algorand" ]
	eth_txes = [tx for tx in txes if tx.platform == "Ethereum" ]

	# TODO:
	#       1. Send tokens on the Algorand and eth testnets, appropriately
	#          We've provided the send_tokens_algo and send_tokens_eth skeleton methods in send_tokens.py
	#       2. Add all transactions to the TX table
	
	orders = g.session.query(Order).filter(Order.filled != None).all() 
	
	tx_ids_eth = send_tokens_eth(w3, eth_sk, eth_txes, orders)
	tx_ids_algo = send_tokens_algo(acl, algo_sk, algo_txes, orders)
	
	for txid in tx_ids_eth:
		#tx = w3.eth.get_transaction(txid)
		g.session.add(txid)
	for txid in tx_ids_algo:
		#txn = acl.search_transaction(txid)
		g.session.add(txid)
		
	g.session.commit()

""" End of Helper methods"""
  
@app.route('/address', methods=['POST'])
def address():
	if request.method == "POST":
		content = request.get_json(silent=True)
		if 'platform' not in content.keys():
			print( f"Error: no platform provided" )
			return jsonify( "Error: no platform provided" )
		if not content['platform'] in ["Ethereum", "Algorand"]:
			print( f"Error: {content['platform']} is an invalid platform" )
			return jsonify( f"Error: invalid platform provided: {content['platform']}"  )

		if content['platform'] == "Ethereum":
			#print("gets here 1")
			#print(mnemonic_secret)
			
			#Your code here
			try:
				eth_sk, eth_pk = get_eth_keys(mnemonic_secret)
			except Exception as e:
				import traceback
				print(traceback.format_exc())
				print(e)
				
			#print("EthPk2:")
			try:
				print(eth_pk)
			except Exception as e:
				import traceback
				print(traceback.format_exc())
				print(e)
			return jsonify( eth_pk )
		if content['platform'] == "Algorand":
			#Your code here
			#print("gets here 2")
			#print("Algo_PK:")
			try:
				algo_sk, algo_pk = get_algo_keys()
				
			except Exception as e:
				import traceback
				print(traceback.format_exc())
				print(e)
			#print(algo_pk)
			return jsonify( algo_pk )

@app.route('/trade', methods=['POST'])
def trade():
	print( "In trade", file=sys.stderr )
	connect_to_blockchains()
	#get_keys()
	if request.method == "POST":
		content = request.get_json(silent=True)
		columns = [ "buy_currency", "sell_currency", "buy_amount", "sell_amount", "platform", "tx_id", "receiver_pk"]
		fields = [ "sig", "payload" ]
		error = False
		for field in fields:
			if not field in content.keys():
				print( f"{field} not received by Trade" )
				error = True
		if error:
			print( json.dumps(content) )
			return jsonify( False )

		error = False
		for column in columns:
			if not column in content['payload'].keys():
				print( f"{column} not received by Trade" )
				error = True
		if error:
			print( json.dumps(content) )
			return jsonify(False)

		# Your code here 

		# 1. Check the signature
		# 2. Add the order to the table
		platform = content['payload']['platform']
		public_key = content['payload']['sender_pk']
		receiver_key = content['payload']['receiver_pk']
		txid = content['payload']['tx_id']
		sig_obj = content.get('sig')
		payload = json.dumps(content['payload'])		
		transactions =[]
		if (check_sig(content['payload'], content['sig'])) == True:
			add_order = Order(receiver_pk=receiver_key, sender_pk=public_key, buy_currency=content['payload']['buy_currency'], sell_currency=content['payload']['sell_currency'], buy_amount=content['payload']['buy_amount'], sell_amount=content['payload']['sell_amount'], signature=sig_obj, tx_id=txid)
			g.session.add(add_order)
			order_dict = {'sender_pk': add_order.sender_pk, 'receiver_pk': add_order.receiver_pk,'buy_currency': add_order.buy_currency, 'sell_currency': add_order.sell_currency,'buy_amount': add_order.buy_amount, 'sell_amount': add_order.sell_amount, 'signature':sig_obj, 'tx_id':txid}
			 # 3a. TODO Check if the order is backed by a transaction equal to the sell_amount (this is new)
			#print("order_dict passed to check_txn function:")
			#print(order_dict)
			
			if (check_txn(order_dict)) == True:		 
				# 3b. Fill the order (as in Exchange Server II) if the order is valid
				
				fill_order(order_dict, transactions)	
				#print("entries in transactions after fill_order is called line 458")
				#print(len(transactions))
				
				# 4. Execute the transactions
				execute_txes(transactions)
				g.session.commit()
			else:
				
				return jsonify(False)
		else:
			log_message(content)
			#for project part V
			log_message(content['payload'])
			return jsonify(False)     

		# If all goes well, return jsonify(True). else return jsonify(False)
		return jsonify(True)

@app.route('/order_book')
def order_book():
	fields = [ "buy_currency", "sell_currency", "buy_amount", "sell_amount", "signature", "tx_id", "receiver_pk", "sender_pk" ]

	# Same as before
	orders = g.session.query(Order).all()  #change this to filter orders for which transactions has been submitted to the approp. network
	orders_list =[]
	for o in orders:
		o_data = toDict(o)    # convert Order object to Dictionay
		orders_list.append(o_data)
		
	result_dict = {'data': orders_list}

	result = json.dumps(result_dict)	#convert dictionary to JSON format

	g.session.commit()
	
	return result

if __name__ == '__main__':
	app.run(port='5002')
	




