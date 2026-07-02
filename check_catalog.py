import json

with open('shl_product_catalogue.json', 'r', encoding='utf-8') as f:
    data = json.load(f, strict=False)

for item in data:
    if 'Java 8' in item['name'] or 'OPQ32r' in item['name']:
        print(f"Name: {item['name']}")
        print(f"Keys: {item.get('keys')}")
        print("-" * 20)
