import json
import os
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

def load_data():
    with open('shl_product_catalogue.json', 'r', encoding='utf-8') as f:
        data = json.load(f, strict=False)
    
    docs = []
    for item in data:
        # Create text for embedding
        name = item.get('name', '')
        desc = item.get('description', '')
        job_levels = ", ".join(item.get('job_levels', []))
        keys = ", ".join(item.get('keys', []))
        
        page_content = f"Name: {name}\nDescription: {desc}\nJob Levels: {job_levels}\nKeys: {keys}"
        
        # Test Type logic
        keys_list = item.get('keys', [])
        test_type = keys_list[0][0] if keys_list and len(keys_list[0]) > 0 else "U"
        
        metadata = {
            "name": name,
            "url": item.get('link', ''),
            "test_type": test_type,
            "description": desc,
            "keys": keys_list
        }
        docs.append(Document(page_content=page_content, metadata=metadata))
    
    return docs

def create_and_save_index():
    print("Loading data...")
    docs = load_data()
    print(f"Loaded {len(docs)} documents.")
    
    print("Initializing embeddings model...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    print("Building FAISS index...")
    vectorstore = FAISS.from_documents(docs, embeddings)
    
    print("Saving FAISS index...")
    vectorstore.save_local("faiss_index")
    print("Done!")

if __name__ == "__main__":
    create_and_save_index()
