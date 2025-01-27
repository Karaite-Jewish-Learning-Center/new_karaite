## generate the ssl certificate mac OS
```bash
cd scripts
./generate_ssl_cert.sh
```
### that is not enough, the browser will complain the OS does not
### trust self-signed certificates, so
### you need to add the certificate to your system's trusted certificates 

```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain certs/karaites.crt
```

### Remove the certificate when done.
```bash
sudo security delete-certificate -c "kjlc.karaites.org"
```
