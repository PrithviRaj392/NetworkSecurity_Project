from flask import Flask, render_template, request, jsonify
from quantcrypt import kem
from quantcrypt import cipher
import base64


app = Flask(__name__)

auth = False

with open('public_key.bin', 'rb') as file:
    public_key = file.read()

with open('private_key.bin', 'rb') as file:
    private_key = file.read()


krypton = cipher.KryptonKEM(kem.Kyber)
krypton.encrypt(public_key=public_key, data_file='challenge_value.txt', output_file='encrypted_challenge_value.bin')

with open('challenge_value.txt', 'r') as file:
    challenge_value = file.read()

with open('encrypted_challenge_value.bin', 'rb') as file:
    encrypted_challenge_value = file.read()


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/restricted_page/')
def restricted_page():
    if auth:
        return render_template('restricted_page.html', msg='Authenticated')
    else:
        return render_template('restricted_page.html', msg='Not Authenticated')


@app.route('/authenticate', methods=['POST'])
def send_challenge():
    return base64.b64encode(encrypted_challenge_value).decode('utf-8')


@app.route('/challenge', methods=['POST'])
def check():
    global auth

    value = request.data.decode('utf-8')
    value_bytes = base64.b64decode(value)

    with open('received.bin', 'wb') as file:
        file.write(value_bytes)

    krypton.decrypt_to_file(secret_key=private_key, encrypted_file='received.bin', output_file='decrypted.txt')

    with open('decrypted.txt', 'r') as file:
        decrypted_challenge_value = file.read()


    print(challenge_value)
    print(decrypted_challenge_value)
    
    if decrypted_challenge_value == challenge_value:
        auth = True

    return jsonify({
        "status": "success",
        "authenticated": auth
    }), 200





if __name__ == '__main__':
    app.run(debug=True)
