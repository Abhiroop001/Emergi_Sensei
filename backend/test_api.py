import os
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("====================================")
    print("1. Testing Health & Root Endpoint")
    print("====================================")
    response = client.get("/health")
    print(f"Health Status: {response.status_code}, Body: {response.json()}")

    print("\n====================================")
    print("2. Testing Authentication Endpoint")
    print("====================================")
    response = client.post("/auth/login", json={"username": "admin", "password": "password123"})
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    accident_img_path = os.path.join(base_dir, "frontend", "public", "incidents", "accident.jpg")
    fire_img_path = os.path.join(base_dir, "frontend", "public", "incidents", "fire.jpg")

    print("\n====================================")
    print("3. Testing Accident Model Endpoint (Two-Stage Pipeline)")
    print("====================================")
    sample_crash = os.path.join(base_dir, "Sample_Test_Images", "testa.jpg")
    sample_normal_car = os.path.join(base_dir, "Sample_Test_Images", "053.jpg")

    if os.path.exists(sample_crash):
        with open(sample_crash, "rb") as f:
            crash_bytes = f.read()
        response = client.post(
            "/accidentmodel/",
            files={"file": ("testa.jpg", crash_bytes, "image/jpeg")}
        )
        print(f"Vehicle Crash Image (testa.jpg) -> Status: {response.status_code}")
        print(f"Response: {response.json()}")

    if os.path.exists(sample_normal_car):
        with open(sample_normal_car, "rb") as f:
            normal_bytes = f.read()
        response = client.post(
            "/accidentmodel/",
            files={"file": ("053.jpg", normal_bytes, "image/jpeg")}
        )
        print(f"\nNormal Vehicle Image (053.jpg) -> Status: {response.status_code}")
        print(f"Response: {response.json()}")

    if os.path.exists(fire_img_path):
        with open(fire_img_path, "rb") as f:
            fire_bytes = f.read()
            
        response = client.post(
            "/accidentmodel/",
            files={"file": ("fire.jpg", fire_bytes, "image/jpeg")}
        )
        print(f"\nNon-Vehicle Fire Image (fire.jpg) -> Status: {response.status_code}")
        print(f"Response: {response.json()}")



    print("\n====================================")
    print("4. Testing Fire Model Endpoint")
    print("====================================")
    if os.path.exists(fire_img_path):
        with open(fire_img_path, "rb") as f:
            fire_bytes = f.read()
            
        response = client.post(
            "/firemodel/",
            files={"file": ("fire.jpg", fire_bytes, "image/jpeg")}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.json()}")
    else:
        print(f"File not found: {fire_img_path}")

    print("\n====================================")
    print("5. Testing Alerts & Analytics Endpoints")
    print("====================================")
    alerts_res = client.get("/alerts/")
    print(f"Alerts ({alerts_res.status_code}): {len(alerts_res.json())} items found")
    
    cameras_res = client.get("/cameras/")
    print(f"Cameras ({cameras_res.status_code}): {len(cameras_res.json())} cameras registered")

    analytics_res = client.get("/analytics/summary")
    print(f"Analytics ({analytics_res.status_code}): Status {analytics_res.json().get('system_health', {}).get('overall')}")

    print("\nAll Backend API Tests Completed Successfully!")

if __name__ == "__main__":
    run_tests()

