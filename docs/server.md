# New server

create server on DO

use an ssh key to log in

Disable services not needed.

```bash
sudo systemctl stop apport unattended-upgrades plymouth plymouth-log sysstat ufw rsync uuidd
sudo systemctl disable apport unattended-upgrades plymouth plymouth-log sysstat ufw rsync uuidd
```

Create a production user
```bash
sudo adduser <username>
sudo usermod -aG sudo <username>
```
#### confirm user groups

```bash
groups <username>
```

#### switch to <username>
```bash
su - <username>
sudo whoami
```

#### Add ssl to <username>

#### Disable root login

#### Install SSH Agent

#### install docker

###

