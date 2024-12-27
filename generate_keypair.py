from quantcrypt import kem
from quantcrypt import cipher


kyber = kem.Kyber()
public_key, private_key = kyber.keygen()


with open('public_key.bin', 'wb') as file:
    file.write(public_key)

with open('private_key.bin', 'wb') as file:
    file.write(private_key)






