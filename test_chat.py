import requests
import json
import time

url = "http://localhost:8000/chat"

print("--- Test 1: Vague query (Expect Clarification) ---")
payload = {
    "messages": [
        {"role": "user", "content": "I am hiring a Java developer"}
    ]
}
response = requests.post(url, json=payload)
print(json.dumps(response.json(), indent=2))

print("\n--- Test 2: Adding context (Expect Recommendation) ---")
payload["messages"].append({"role": "assistant", "content": response.json().get("reply", "")})
payload["messages"].append({"role": "user", "content": "Mid-level, around 4 years"})
response = requests.post(url, json=payload)
print(json.dumps(response.json(), indent=2))

print("\n--- Test 3: Refining (Expect updated Recommendation) ---")
payload["messages"].append({"role": "assistant", "content": response.json().get("reply", "")})
payload["messages"].append({"role": "user", "content": "Actually, add personality tests as well"})
response = requests.post(url, json=payload)
print(json.dumps(response.json(), indent=2))

print("\n--- Test 4: Comparison (Expect grounded answer) ---")
payload["messages"].append({"role": "assistant", "content": response.json().get("reply", "")})
payload["messages"].append({"role": "user", "content": "What is the difference between OPQ and GSA?"})
response = requests.post(url, json=payload)
print(json.dumps(response.json(), indent=2))
