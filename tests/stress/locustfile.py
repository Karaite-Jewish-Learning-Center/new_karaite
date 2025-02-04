from locust import HttpUser, task, between
import json

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)  # Random wait between requests
    
    def on_start(self):
        """Initialize user session if needed"""
        pass
    
    @task(3)
    def visit_homepage(self):
        # Test frontend
        self.client.get("/")
        
    @task(2)
    def visit_api(self):
        # Test API endpoint - adjust the endpoint based on your API
        self.client.get("/api/")
    
    @task(1)
    def visit_admin(self):
        # Test admin page
        self.client.get("/admin/")
    
    @task(2)
    def simulate_api_post(self):
        # Adjust the endpoint and payload according to your API
        headers = {'Content-Type': 'application/json'}
        payload = {
            "example": "data",
            "timestamp": "2024-03-19"
        }
        self.client.post(
            "/api/example/",
            data=json.dumps(payload),
            headers=headers
        )

    def on_stop(self):
        """Clean up after test if needed"""
        pass 