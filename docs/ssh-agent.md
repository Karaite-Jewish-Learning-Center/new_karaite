### GitHub changed is policy, now it does not allow login with passwords, so an ssh certificate must be used

#### config the ssh-agent to run on ssh login

Add to the end .bashrc

```bash
# SSH Agent should be running, once
run_count=$(ps -ef | grep "ssh-agent" | grep -v "grep" | wc -l)
if [ $run_count -eq 0 ]; then
    echo Starting SSH Agent
    eval $(ssh-agent -s)
    ssh-add ~/.ssh/your key
fi
```

# Kill agent when you are done
# add to ~/.bash_logout
```bash
killall ssh-agent
```
