import json
from pathlib import Path

def test_catalog():
    products = json.loads((Path(__file__).resolve().parents[1]/"catalog"/"products.json").read_text(encoding="utf-8"))
    assert len(products) == 16
    assert len(set(p["id"] for p in products)) == len(products)
    assert all(p["price"] > 0 for p in products)

if __name__=="__main__":
    test_catalog()
    print("Catalog smoke test PASS")
