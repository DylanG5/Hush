from flask import Flask, request, jsonify
from Crypto.Cipher import AES
from abc import ABC, abstractmethod
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
import base64

app = Flask(__name__)

class EncryptionAlgorithm(ABC):
    
    @abstractmethod
    def encrypt_message(self, message, key):
        pass

    @abstractmethod
    def decrypt_message(self, encrypted_message, key):
        pass

class AESEncryption(EncryptionAlgorithm):
    
    def encrypt_message(self, message, key):
        iv = get_random_bytes(AES.block_size)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        encrypted_message = cipher.encrypt(pad(message.encode(), AES.block_size))
        return base64.b64encode(iv + encrypted_message).decode('utf-8')

    def decrypt_message(self, encrypted_message, key):
        try:
            encrypted_message_with_iv = base64.b64decode(encrypted_message)
            iv = encrypted_message_with_iv[:AES.block_size]
            encrypted_message = encrypted_message_with_iv[AES.block_size:]
            cipher = AES.new(key, AES.MODE_CBC, iv)
            decrypted_message = unpad(cipher.decrypt(encrypted_message), AES.block_size)
            return decrypted_message.decode(), None
        except Exception as e:
            return None, str(e)
        
app = Flask(__name__)

# Create an instance of the AESEncryption class
aes_encryption = AESEncryption()

@app.route('/encrypt', methods=['POST'])
def encrypt():
    content = request.json
    if 'message' not in content or 'key' not in content:
        return jsonify({'error': 'Missing message or key'}), 400
    encrypted_message = aes_encryption.encrypt_message(content['message'], base64.b64decode(content['key']))
    return jsonify({'encrypted_message': encrypted_message})

@app.route('/decrypt', methods=['POST'])
def decrypt():
    content = request.json
    key = base64.b64decode(content['key'])
    encrypted_message = base64.b64decode(content['encrypted_message'])
    if 'encrypted_message' not in content or 'key' not in content:
        return jsonify({'error': 'Missing encrypted_message or key'}), 400
    decrypted_message, error = aes_encryption.decrypt_message(content['encrypted_message'], key)
    if error:
        return jsonify({'error': 'Decryption failed', 'details': error}), 500
    return jsonify({'decrypted_message': decrypted_message})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
