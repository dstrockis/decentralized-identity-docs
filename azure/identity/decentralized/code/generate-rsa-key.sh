# <private>
openssl genrsa -out private.pem 2048
# </private>

# <public>
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
# </public>