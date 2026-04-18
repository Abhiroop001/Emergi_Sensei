from fastapi.testclient import TestClient
from app.main import app
import io
from PIL import Image

client = TestClient(app)

def run_tests():
    print("====================================")
    print("1. Testing Authentication Endpoint")
    print("====================================")
    response = client.post("/auth/login", json={"username": "admin", "password": "password123"})
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")

    print("\n====================================")
    print("2. Testing Accident Model Endpoint")
    print("====================================")
    accident_img_path = r"d:\Accident\frontend\public\incidents\accident.jpg"
    with open(accident_img_path, "rb") as f:
        accident_bytes = f.read()
        
    response = client.post(
        "/accidentmodel/",
        files={"file": ("accident.jpg", accident_bytes, "image/jpeg")}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")

    print("\n====================================")
    print("3. Testing Fire Model Endpoint")
    print("====================================")
    fire_img_path = r"d:\Accident\frontend\public\incidents\fire.jpg"
    with open(fire_img_path, "rb") as f:
        fire_bytes = f.read()
        
    response = client.post(
        "/firemodel/",
        files={"file": ("fire.jpg", fire_bytes, "image/jpeg")}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")
    print("\nTests completed.")

if __name__ == "__main__":
    run_tests()
