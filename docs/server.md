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
in  /etc/sshd_config
#### Install SSH Agent
```bash
sudo apt-get install openssh-client -y
```
### Add to .bashrc
```bash
if [ -z "$SSH_AGENT_PID" ]; then
    echo "Starting SSH Agent"
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/github
    # Save the agent PID for cleanup
    echo $SSH_AGENT_PID > ~/.ssh-agent-pid
fi

trap "if [ -f ~/.ssh-agent-pid ]; then
    kill $(cat ~/.ssh-agent-pid) 2>/dev/null
    rm -f ~/.ssh-agent-pid
fi" EXIT

```
#### logout / login

#### this should be the output
```
Last login: Mon Feb  3 18:22:56 2025 from 201.158.42.255
Starting SSH Agent
Agent pid 2700
Identity added:
```
#### test github 
ssh -T git@github.com
```
Hi SandroFernandes! You've successfully authenticated, but GitHub does not provide shell access.
```

#### install docker
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

```
### Add Docker Official GPG key

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

```

### Add Docker's repository
```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### install docker

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

### Enable & start docker

```bash
sudo systemctl enable docker
sudo systemctl start docker
```
#### Test install

```bash
docker --version

```