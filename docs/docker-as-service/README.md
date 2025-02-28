sudo nano /etc/systemd/system/karaites-docker.service

# Reload systemd configuration
sudo systemctl daemon-reload

# Stop the service
sudo systemctl stop karaites-docker

# Start the service
sudo systemctl start karaites-docker

# Check the status
sudo systemctl status karaites-docker

# Check detailed logs if there are still issues
sudo journalctl -u karaites-docker -n 50 --no-pager