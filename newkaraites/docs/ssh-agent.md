### Github changed is policy, now it does not allow login with passwords, so a ssh certificate must be used

#### config the ssh-agent to run on ssh login

Add to the end .bashrc

```bash
# SSH Agent should be running, once
run_count=$(ps -ef | grep "ssh-agent" | grep -v "grep" | wc -l)
if [ $run_count -eq 0 ]; then
    echo Starting SSH Agent
    eval $(ssh-agent -s)
    ssh-add ~/.ssh/id_rsa
fi
```

It's possible that the ssh-agent is running from a previous session, depending on time passed, github ssh authentication, may fail. Just kill the ssh-agent
ssh logout, and ssh login.

A work around this:
https://unix.stackexchange.com/questions/136548/force-command-to-be-run-on-logout-or-disconnect/136552#136552

But that's for another day.
