# Tell git that you are using ssh
[://] # ( Source: https://help.github.com/articles/generating-ssh-keys/ 

# Generate a new ssh key
```zsh
$ ssh-keygen -t rsa -b 4096 -C "

```


# add config file to .ssh directory

```txt
Host *
  AddKeysToAgent yes
  User user@email.com
  IdentityFile ~/.ssh/key for the site

ServerAliveInterval 50
```

# check if ssh key is already in place
```bash
$ ssh -T git@github.com
```

# copy this from the git page 
# can be found in the code button
git@github.com:repo/repo.git
# add the following command:
```Bash`
$ git remote set-url origin git@github.com:repo/repo.git

```





 